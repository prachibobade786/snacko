const db = require("../../config/db");

// add payment
const addPayment = (payment, callback) => {
  const { order_id, user_id, amount, payment_method, payment_status, transaction_id } = payment;

  const sql = `
    INSERT INTO payments
    (order_id, user_id, amount, payment_method, payment_status, transaction_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [order_id, user_id, amount, payment_method, payment_status, transaction_id],
    callback
  );
};

// get all payments
const getAllPayments = (callback) => {
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
`;

  db.query(sql, callback);
};

// get payment by id
const getPaymentById = (paymentId, callback) => {
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

  db.query(sql, [paymentId], callback);
};

// get payments by user id
const getPaymentsByUserId = (userId, callback) => {
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
  `;

  db.query(sql, [userId], callback);
};

// get payments by order id
const getPaymentsByOrderId = (orderId, callback) => {
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
  `;

  db.query(sql, [orderId], callback);
};

// update payment
const updatePayment = (paymentId, payment, callback) => {
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

  db.query(
    sql,
    [amount, payment_method, payment_status, transaction_id, paymentId],
    callback
  );
};

// delete payment
const deletePayment = (paymentId, callback) => {
  const sql = "DELETE FROM payments WHERE payment_id = ?";
  db.query(sql, [paymentId], callback);
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
