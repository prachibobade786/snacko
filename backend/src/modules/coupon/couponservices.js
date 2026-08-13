const db = require("../../config/db");

// Get all coupons
const getAllCoupons = async () => {
  const [rows] = await db.execute("SELECT * FROM coupons ORDER BY created_at DESC");
  return rows;
};

// Get coupon by code (active and valid)
const getCouponByCode = async (code) => {
  const [rows] = await db.execute(
    "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expiry_date IS NULL OR expiry_date >= NOW())",
    [code]
  );
  return rows[0];
};

// Create a new coupon
const createCoupon = async (couponData) => {
  const { code, discount_type, discount_value, min_order_amount, expiry_date } = couponData;
  const expiry = expiry_date || null;
  const [result] = await db.execute(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [code, discount_type, discount_value, min_order_amount || 0.00, expiry]
  );
  return result;
};

// Update coupon details
const updateCoupon = async (id, updateData) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updateData)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  const [result] = await db.execute(
    `UPDATE coupons SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return result;
};

// Delete coupon
const deleteCoupon = async (id) => {
  const [result] = await db.execute("DELETE FROM coupons WHERE id = ?", [id]);
  return result;
};

// Check if user has already used this coupon code in non-cancelled orders
const hasUserUsedCoupon = async (userId, couponCode) => {
  const [rows] = await db.execute(
    "SELECT id FROM orders WHERE user_id = ? AND coupon_code = ? AND status != 'cancelled' LIMIT 1",
    [userId, couponCode]
  );
  return rows.length > 0;
};

module.exports = {
  getAllCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  hasUserUsedCoupon
};
