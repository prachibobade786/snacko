const orderModel = require("../order/ordermodel");

const addressService = require("../address/addressservices");

const db = require("../../config/db");
const mailer = require("../../utils/mailer");

// Place Order
const placeOrder = async (orderData) => {

    const address = await addressService.addressExists(orderData.address_id, orderData.user_id);

    if(!address){
        throw new Error(
            "Invalid Address"
        );
    }

    // If an active session pincode is provided, verify that the delivery address pincode matches
    const activePincode = orderData.pincode || orderData.active_pincode;
    if (activePincode && String(address.pincode).trim() !== String(activePincode).trim()) {
        throw new Error(
            `Delivery unavailable: Selected address pincode (${address.pincode}) does not match your active delivery location (${activePincode}).`
        );
    }

    // Validate if the address pincode is served by a warehouse and get operational hours
    const [warehouseRows] = await db.execute(
        `SELECT wp.*, w.name AS warehouse_name, w.delivery_start_time, w.delivery_end_time, w.is_active 
         FROM warehouse_pincodes wp 
         JOIN warehouses w ON wp.warehouse_id = w.warehouse_id 
         WHERE wp.pincode = ?`,
        [address.pincode]
    );

    if (!warehouseRows || warehouseRows.length === 0) {
        throw new Error(
            `Delivery unavailable: The selected delivery address (Pincode: ${address.pincode}) is outside our warehouse service area.`
        );
    }

    const warehouse = warehouseRows[0];
    const { delivery_start_time, delivery_end_time, warehouse_name, is_active } = warehouse;

    if (!is_active) {
        throw new Error(
            `Delivery Unavailable: Delivery services for ${warehouse_name} (serving pincode ${address.pincode}) are currently inactive. Please try again later.`
        );
    }

    // Check delivery hours
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentSec = String(now.getSeconds()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}:${currentSec}`;

    let isOpen = false;
    if (delivery_start_time <= delivery_end_time) {
        isOpen = (currentTimeStr >= delivery_start_time && currentTimeStr <= delivery_end_time);
    } else {
        // Overnight window (e.g. 22:00:00 to 06:00:00)
        isOpen = (currentTimeStr >= delivery_start_time || currentTimeStr <= delivery_end_time);
    }

    if (!isOpen) {
        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            const parts = timeStr.split(':');
            const hour = parseInt(parts[0], 10);
            const min = parts[1];
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${min} ${ampm}`;
        };
        throw new Error(
            `Delivery Closed: Delivery services for ${warehouse_name} (serving pincode ${address.pincode}) are closed. Operating hours are from ${formatTime(delivery_start_time)} to ${formatTime(delivery_end_time)}.`
        );
    }

    // Backend Coupon Validation & Discount Computation
    if (orderData.coupon_code) {
        const couponService = require("../coupon/couponservices");
        const coupon = await couponService.getCouponByCode(orderData.coupon_code.toUpperCase().trim());
        if (!coupon) {
            throw new Error("Invalid or expired coupon code.");
        }

        const alreadyUsed = await couponService.hasUserUsedCoupon(orderData.user_id, coupon.code);
        if (alreadyUsed) {
            throw new Error("You have already used this coupon code. Coupons are limited to one-time use per customer.");
        }
        
        const discountSent = parseFloat(orderData.discount_amount || 0);
        const minAmt = parseFloat(coupon.min_order_amount);
        const subtotal = parseFloat(orderData.total_amount) - 15 + discountSent;

        if (subtotal < minAmt) {
            throw new Error(`This coupon requires a minimum purchase of ₹${minAmt.toFixed(2)}.`);
        }

        let discountAmount = 0;
        if (coupon.discount_type === "percentage") {
            discountAmount = (subtotal * parseFloat(coupon.discount_value)) / 100;
        } else {
            discountAmount = parseFloat(coupon.discount_value);
        }

        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        orderData.discount_amount = discountAmount;
        orderData.total_amount = subtotal - discountAmount + 15;
        orderData.coupon_code = coupon.code;
    } else {
        orderData.discount_amount = 0.00;
        orderData.coupon_code = null;
    }

    return await orderModel.createOrder(
        orderData
    );
};

// Get User Orders
const getOrders = async (
    userId,
    page,
    limit
) => {

    return await orderModel
        .getOrdersByUserId(userId, page, limit);
};

// Get Single Order
const getOrder = async (id) => {

    return await orderModel
        .getOrderById(id);
};

// Cancel Order
const removeOrder = async (id, currentUser = null) => {
    const order = await orderModel.getOrderById(id);
    if (!order) {
        throw new Error("Order not found");
    }
    const orderTime = new Date(order.created_at).getTime();
    const currentTime = Date.now();
    const diffMs = currentTime - orderTime;

    const isUserAdmin = currentUser && currentUser.role === "admin";
    if (!isUserAdmin && diffMs > 120000) {
        throw new Error("Order cancellation period has expired (max 2 minutes)");
    }

    // Process Razorpay refund if applicable
    const [payments] = await db.execute(
        "SELECT * FROM payments WHERE order_id = ? AND payment_method = 'RAZORPAY' AND payment_status = 'COMPLETED'",
        [id]
    );

    if (payments.length > 0) {
        const payment = payments[0];
        const transactionId = payment.transaction_id;

        const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_snacko_key";
        const key_secret = process.env.RAZORPAY_KEY_SECRET || "snacko_razorpay_secret";

        let refundId = "ref_test_" + Date.now();

        if (key_id.startsWith("rzp_test_") || !process.env.RAZORPAY_KEY_ID) {
            console.log(`[Razorpay Refund] Test mode: Simulating refund of ₹${payment.amount} for payment ${transactionId}`);
        } else {
            try {
                const Razorpay = require("razorpay");
                const rzp = new Razorpay({ key_id, key_secret });
                const refund = await rzp.payments.refund(transactionId, {
                    amount: Math.round(parseFloat(payment.amount) * 100)
                });
                refundId = refund.id;
                console.log(`[Razorpay Refund] Successfully refunded payment ${transactionId}, refund ID: ${refundId}`);
            } catch (err) {
                console.error("[Razorpay Refund] Error refunding payment via Razorpay API:", err);
                throw new Error("Failed to process refund via Razorpay: " + err.message);
            }
        }

        // Update payment record to REFUNDED
        await db.execute(
            `UPDATE payments 
             SET payment_status = 'REFUNDED', transaction_id = ?
             WHERE payment_id = ?`,
            [refundId, payment.payment_id]
        );
    }

    const cancelResult = await orderModel.cancelOrder(id);
    
    // Trigger cancellation email to user
    triggerCancellationEmail(id, order).catch(err => {
        console.error("[Cancellation Email] Failed to send email notification:", err);
    });

    return cancelResult;
};

const triggerCancellationEmail = async (orderId, order) => {
    try {
        const [users] = await db.execute("SELECT name, email FROM users WHERE id = ?", [order.user_id]);
        if (!users || users.length === 0) return;
        const user = users[0];

        await mailer.sendOrderCancellationEmail(
            orderId,
            user.email,
            user.name,
            order.total_amount
        );
    } catch (err) {
        console.error("[Cancellation Email] Error during email dispatch:", err);
    }
};

module.exports = {
    placeOrder,
    getOrders,
    getOrder,
    removeOrder
};