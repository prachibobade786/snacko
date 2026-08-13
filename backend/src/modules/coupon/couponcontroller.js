const couponService = require("./couponservices");

// List all coupons
const listCoupons = async (req, res) => {
  try {
    const result = await couponService.getAllCoupons();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, expiry_date } = req.body;
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, discount type, and discount value are required."
      });
    }

    const result = await couponService.createCoupon({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value: parseFloat(discount_value),
      min_order_amount: parseFloat(min_order_amount || 0),
      expiry_date
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: result
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "A coupon with this code already exists."
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update coupon
const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const result = await couponService.updateCoupon(couponId, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found."
      });
    }
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const result = await couponService.deleteCoupon(couponId);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found."
      });
    }
    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Apply coupon check
const applyCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    if (!code || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and total order amount are required."
      });
    }

    const coupon = await couponService.getCouponByCode(code.toUpperCase().trim());
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired coupon code."
      });
    }

    const userId = req.user ? req.user.id : null;
    if (userId) {
      const alreadyUsed = await couponService.hasUserUsedCoupon(userId, coupon.code);
      if (alreadyUsed) {
        return res.status(400).json({
          success: false,
          message: "You have already used this coupon code. Coupons are limited to one-time use per customer."
        });
      }
    }

    const minAmt = parseFloat(coupon.min_order_amount);
    const orderAmt = parseFloat(totalAmount);

    if (orderAmt < minAmt) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum purchase amount of ₹${minAmt.toFixed(2)}.`
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderAmt * parseFloat(coupon.discount_value)) / 100;
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    // Cap the discount at the order amount
    if (discountAmount > orderAmt) {
      discountAmount = orderAmt;
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount,
        final_amount: orderAmt - discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
};
