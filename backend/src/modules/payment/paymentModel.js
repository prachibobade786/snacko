const db = require("../../config/db");

// add payment
const addPayment = async (payment) => {
  const { order_id, user_id, amount, payment_method, payment_status, transaction_id } = payment;

  const sql = `
    INSERT INTO payments
    (order_id, user_id, amount, payment_method, payment_status, transaction_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql, [
    order_id,
    user_id,
    amount,
    payment_method,
    payment_status,
    transaction_id
  ]);

  return result;
};

// get all payments
const getAllPayments = async () => {
  const sql = `
    SELECT
      p.payment_id,
      p.order_id,
      p.user_id,
      u.name AS full_name,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.transaction_id,
      p.payment_date,
      p.created_at,
      p.updated_at
    FROM payments p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.payment_id DESC
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

// get payment by id
const getPaymentById = async (paymentId) => {
  const sql = `
    SELECT
      p.payment_id,
      p.order_id,
      p.user_id,
      u.name AS full_name,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.transaction_id,
      p.payment_date,
      p.created_at,
      p.updated_at
    FROM payments p
    JOIN users u ON p.user_id = u.id
    WHERE p.payment_id = ?
  `;

  const [rows] = await db.execute(sql, [paymentId]);
  return rows[0];
};

// get payments by user id
const getPaymentsByUserId = async (userId) => {
  const sql = `
    SELECT
      payment_id,
      order_id,
      user_id,
      amount,
      payment_method,
      payment_status,
      transaction_id,
      payment_date,
      created_at,
      updated_at
    FROM payments
    WHERE user_id = ?
    ORDER BY payment_id DESC
  `;

  const [rows] = await db.execute(sql, [userId]);
  return rows;
};

// get payments by order id
const getPaymentsByOrderId = async (orderId) => {
  const sql = `
    SELECT
      payment_id,
      order_id,
      user_id,
      amount,
      payment_method,
      payment_status,
      transaction_id,
      payment_date,
      created_at,
      updated_at
    FROM payments
    WHERE order_id = ?
    ORDER BY payment_id DESC
  `;

  const [rows] = await db.execute(sql, [orderId]);
  return rows;
};

// update payment
const updatePayment = async (paymentId, payment) => {
  const { amount, payment_method, payment_status, transaction_id } = payment;

  const sql = `
    UPDATE payments
    SET
      amount = ?,
      payment_method = ?,
      payment_status = ?,
      transaction_id = ?
    WHERE payment_id = ?
  `;

  const [result] = await db.execute(sql, [
    amount,
    payment_method,
    payment_status,
    transaction_id,
    paymentId
  ]);

  return result;
};

// delete payment
const deletePayment = async (paymentId) => {
  const sql = "DELETE FROM payments WHERE payment_id = ?";
  const [result] = await db.execute(sql, [paymentId]);
  return result;
};

module.exports = {
  addPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByOrderId,
  updatePayment,
  deletePayment
};
