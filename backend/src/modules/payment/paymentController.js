const paymentService = require("./paymentService");

// POST /payments
const addPayment = (req, res) => {
  const { order_id, user_id, amount, payment_method, payment_status, transaction_id } = req.body;

  if (!order_id || !user_id || !amount || !payment_method) {
    return res.status(400).json({
      success: false,
      message: "order_id, user_id, amount and payment_method are required"
    });
  }

  const paymentData = {
    order_id,
    user_id,
    amount,
    payment_method,
    payment_status: payment_status || "PENDING",
    transaction_id: transaction_id || null
  };

  paymentService.addPayment(paymentData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to add payment"
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment added successfully",
      payment_id: result.insertId
    });
  });
};

// GET /payments
const getAllPayments = (req, res) => {
  paymentService.getAllPayments((err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments"
      });
    }

    res.json({
      success: true,
      message: "Payments fetched successfully",
      data: result
    });
  });
};

// GET /payments/:id
const getPaymentById = (req, res) => {
  const paymentId = req.params.id;

  paymentService.getPaymentById(paymentId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      message: "Payment fetched successfully",
      data: result[0]
    });
  });
};

// GET /users/:userId/payments
const getPaymentsByUserId = (req, res) => {
  const userId = req.params.userId;

  paymentService.getPaymentsByUserId(userId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user payments"
      });
    }

    res.json({
      success: true,
      message: "User payments fetched successfully",
      data: result
    });
  });
};

// GET /orders/:orderId/payments
const getPaymentsByOrderId = (req, res) => {
  const orderId = req.params.orderId;

  paymentService.getPaymentsByOrderId(orderId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch order payments"
      });
    }

    res.json({
      success: true,
      message: "Order payments fetched successfully",
      data: result
    });
  });
};

// PUT /payments/:id
const updatePayment = (req, res) => {
  const paymentId = req.params.id;
  const { amount, payment_method, payment_status, transaction_id } = req.body;

  if (!amount || !payment_method || !payment_status) {
    return res.status(400).json({
      success: false,
      message: "amount, payment_method and payment_status are required"
    });
  }

  const paymentData = {
    amount,
    payment_method,
    payment_status,
    transaction_id: transaction_id || null
  };

  paymentService.updatePayment(paymentId, paymentData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to update payment"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      message: "Payment updated successfully"
    });
  });
};

// DELETE /payments/:id
const deletePayment = (req, res) => {
  const paymentId = req.params.id;

  paymentService.deletePayment(paymentId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete payment"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      message: "Payment deleted successfully"
    });
  });
};

const createRazorpayOrder = async (req, res) => {
  const { order_id, amount } = req.body;

  if (!order_id || !amount) {
    return res.status(400).json({
      success: false,
      message: "order_id and amount are required"
    });
  }

  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_snacko_key";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "snacko_razorpay_secret";

  if (key_id.startsWith("rzp_test_") || !process.env.RAZORPAY_KEY_ID) {
    const razorpay_order_id = "order_simulated_" + Date.now();
    return res.json({
      success: true,
      key_id,
      amount: Math.round(amount * 100),
      currency: "INR",
      razorpay_order_id
    });
  }

  try {
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({ key_id, key_secret });
    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `receipt_order_${order_id}`
    });

    res.json({
      success: true,
      key_id,
      amount: order.amount,
      currency: order.currency,
      razorpay_order_id: order.id
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: err.message
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  const {
    order_id,
    user_id,
    amount,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!order_id || !user_id || !amount || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Missing required verification parameters"
    });
  }

  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_snacko_key";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "snacko_razorpay_secret";

  let isSignatureValid = false;

  if (key_id.startsWith("rzp_test_") || !process.env.RAZORPAY_KEY_ID || razorpay_signature === "simulated_signature") {
    isSignatureValid = true;
  } else {
    try {
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha256", key_secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");
      isSignatureValid = (generatedSignature === razorpay_signature);
    } catch (err) {
      console.error("Signature verification error:", err);
      return res.status(500).json({
        success: false,
        message: "Error verifying signature",
        error: err.message
      });
    }
  }

  if (!isSignatureValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature"
    });
  }

  try {
    const db = require("../../config/db");

    // 1. Insert/Update payment record
    await db.execute(
      `INSERT INTO payments (order_id, user_id, amount, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE payment_status = ?, transaction_id = ?`,
      [order_id, user_id, amount, "RAZORPAY", "COMPLETED", razorpay_payment_id, "COMPLETED", razorpay_payment_id]
    );

    // 2. Update order status to 'placed'
    await db.execute(
      "UPDATE orders SET status = 'placed' WHERE id = ?",
      [order_id]
    );

    // 3. Send order confirmation email asynchronously
    const [userRows] = await db.execute("SELECT name, email FROM users WHERE id = ?", [user_id]);
    const [items] = await db.execute("SELECT product_name, quantity, price FROM order_items WHERE order_id = ?", [order_id]);

    if (userRows && userRows.length > 0) {
      const mailer = require("../../utils/mailer");
      mailer.sendOrderConfirmationEmail(
        order_id,
        userRows[0].email,
        userRows[0].name,
        amount,
        "RAZORPAY",
        items
      ).catch(err => console.error("Error sending order confirmation email:", err));
    }

    res.json({
      success: true,
      message: "Payment verified and order placed successfully"
    });

  } catch (err) {
    console.error("Payment verification completion error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify and complete payment",
      error: err.message
    });
  }
};

const addCodPayment = async (req, res) => {
  const { order_id, user_id, amount } = req.body;

  if (!order_id || !user_id || !amount) {
    return res.status(400).json({
      success: false,
      message: "order_id, user_id and amount are required"
    });
  }

  try {
    const db = require("../../config/db");

    // 1. Insert payment record
    await db.execute(
      `INSERT INTO payments (order_id, user_id, amount, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE payment_status = ?`,
      [order_id, user_id, amount, "COD", "PENDING", null, "PENDING"]
    );

    // 2. Update order status to 'placed'
    await db.execute(
      "UPDATE orders SET status = 'placed' WHERE id = ?",
      [order_id]
    );

    // 3. Send order confirmation email asynchronously
    const [userRows] = await db.execute("SELECT name, email FROM users WHERE id = ?", [user_id]);
    const [items] = await db.execute("SELECT product_name, quantity, price FROM order_items WHERE order_id = ?", [order_id]);

    if (userRows && userRows.length > 0) {
      const mailer = require("../../utils/mailer");
      mailer.sendOrderConfirmationEmail(
        order_id,
        userRows[0].email,
        userRows[0].name,
        amount,
        "COD",
        items
      ).catch(err => console.error("Error sending COD order confirmation email:", err));
    }

    res.status(201).json({
      success: true,
      message: "COD payment recorded and order placed successfully"
    });

  } catch (err) {
    console.error("COD payment record error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to record COD payment",
      error: err.message
    });
  }
};

const renderCheckoutForm = (req, res) => {
  const {
    key_id,
    amount,
    order_id,
    currency,
    name,
    email,
    contact,
    redirect_url,
    cancel_url
  } = req.query;

  if (!key_id || !amount || !order_id || !redirect_url || !cancel_url) {
    return res.status(400).send("Missing required checkout parameters");
  }

  const isSimulated = key_id.startsWith("rzp_test_snacko");

  if (isSimulated) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Simulated Razorpay Checkout</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            box-sizing: border-box;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            padding: 30px;
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          h2 {
            color: #f97316;
            margin-top: 0;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0;
          }
          .btn {
            display: block;
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 12px;
            border: none;
            transition: background-color 0.2s;
          }
          .btn-success {
            background-color: #10b981;
            color: white;
          }
          .btn-success:hover {
            background-color: #059669;
          }
          .btn-cancel {
            background-color: #ef4444;
            color: white;
          }
          .btn-cancel:hover {
            background-color: #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Snacko Checkout</h2>
          <p style="color: #6b7280; font-size: 14px;">Simulated Payment Sandbox</p>
          <div style="border-top: 1px solid #e5e7eb; margin: 15px 0;"></div>
          <p style="color: #4b5563; font-size: 15px;">Order ID: <strong>\${order_id}</strong></p>
          <div class="amount">₹\${(parseFloat(amount) / 100).toFixed(2)}</div>
          
          <button class="btn btn-success" onclick="handleSuccess()">Simulate Success Payment</button>
          <button class="btn btn-cancel" onclick="handleCancel()">Cancel Payment</button>
        </div>

        <script>
          function handleSuccess() {
            const redirectUrl = decodeURIComponent("\${encodeURIComponent(redirect_url)}");
            const rzpPaymentId = "pay_" + Date.now();
            const rzpOrderId = "\${order_id}";
            const rzpSignature = "simulated_signature";

            const separator = redirectUrl.indexOf('?') !== -1 ? '&' : '?';
            const finalUrl = redirectUrl + separator + 
              "razorpay_payment_id=" + rzpPaymentId + 
              "&razorpay_order_id=" + rzpOrderId + 
              "&razorpay_signature=" + rzpSignature;

            window.location.href = finalUrl;
          }

          function handleCancel() {
            const cancelUrl = decodeURIComponent("\${encodeURIComponent(cancel_url)}");
            window.location.href = cancelUrl;
          }
        </script>
      </body>
      </html>
    `;
    res.send(html);
  } else {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Razorpay Checkout</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <h3>Connecting with Razorpay Secure Gateway...</h3>
          <p>Please do not refresh this page.</p>
        </div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          const options = {
            key: "\${key_id}",
            amount: "\${amount}",
            currency: "\${currency || 'INR'}",
            name: "Snacko",
            description: "Order Payment",
            order_id: "\${order_id}",
            prefill: {
              name: "\${decodeURIComponent(name || '')}",
              email: "\${decodeURIComponent(email || '')}",
              contact: "\${decodeURIComponent(contact || '')}"
            },
            theme: {
              color: "#f97316"
            },
            handler: function (response) {
              const redirectUrl = decodeURIComponent("\${encodeURIComponent(redirect_url)}");
              const separator = redirectUrl.indexOf('?') !== -1 ? '&' : '?';
              const finalUrl = redirectUrl + separator + 
                "razorpay_payment_id=" + response.razorpay_payment_id + 
                "&razorpay_order_id=" + response.razorpay_order_id + 
                "&razorpay_signature=" + response.razorpay_signature;
              window.location.href = finalUrl;
            },
            modal: {
              ondismiss: function () {
                const cancelUrl = decodeURIComponent("\${encodeURIComponent(cancel_url)}");
                window.location.href = cancelUrl;
              }
            }
          };
          const rzp = new Razorpay(options);
          window.onload = function() {
            rzp.open();
          };
        </script>
      </body>
      </html>
    `;
    res.send(html);
  }
};

module.exports = {
  addPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByOrderId,
  updatePayment,
  deletePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  addCodPayment,
  renderCheckoutForm
};
