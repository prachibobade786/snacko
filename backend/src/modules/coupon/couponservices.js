const db = require("../../config/db");

// Get all coupons
const getAllCoupons = async () => {
  const [rows] = await db.execute("SELECT * FROM coupons ORDER BY created_at DESC");
  return rows;
};

// Create a new coupon
const createCoupon = async (data) => {
  const { code, discount_type, discount_value, min_order_amount, expiry_date } = data;
  const [result] = await db.execute(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date)
     VALUES (?, ?, ?, ?, ?)`,
    [code, discount_type, discount_value, min_order_amount, expiry_date || null]
  );
  return { id: result.insertId, ...data };
};

// Update a coupon
const updateCoupon = async (couponId, data) => {
  const fields = [];
  const values = [];
  const allowedFields = ["code", "discount_type", "discount_value", "min_order_amount", "expiry_date", "is_active"];
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      if (field === "code" && typeof data[field] === "string") {
        values.push(data[field].toUpperCase().trim());
      } else {
        values.push(data[field]);
      }
    }
  });

  if (fields.length === 0) return { affectedRows: 0 };

  values.push(couponId);
  const [result] = await db.execute(
    `UPDATE coupons SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return result;
};

// Delete a coupon
const deleteCoupon = async (couponId) => {
  const [result] = await db.execute("DELETE FROM coupons WHERE id = ?", [couponId]);
  return result;
};

// Retrieve an active, non-expired coupon by code
const getCouponByCode = async (code) => {
  const [rows] = await db.execute(
    `SELECT * FROM coupons 
     WHERE code = ? AND is_active = 1 
       AND (expiry_date IS NULL OR expiry_date > NOW())`,
    [code]
  );
  return rows[0] || null;
};

// Verify if a user has already used a specific coupon code (excluding cancelled orders)
const hasUserUsedCoupon = async (userId, code) => {
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS count FROM orders WHERE user_id = ? AND coupon_code = ? AND status != 'cancelled'",
    [userId, code]
  );
  return rows[0].count > 0;
};

module.exports = {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponByCode,
  hasUserUsedCoupon
};
