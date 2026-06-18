const paymentModel = require("./paymentModel");

// add payment
const addPayment = (paymentData, callback) => {
  paymentModel.addPayment(paymentData, callback);
};

// get all payments
const getAllPayments = (callback) => {
  paymentModel.getAllPayments(callback);
};

// get payment by id
const getPaymentById = (paymentId, callback) => {
  paymentModel.getPaymentById(paymentId, callback);
};

// get payments by user id
const getPaymentsByUserId = (userId, callback) => {
  paymentModel.getPaymentsByUserId(userId, callback);
};

// get payments by order id
const getPaymentsByOrderId = (orderId, callback) => {
  paymentModel.getPaymentsByOrderId(orderId, callback);
};

// update payment
const updatePayment = (paymentId, paymentData, callback) => {
  paymentModel.updatePayment(paymentId, paymentData, callback);
};

// delete payment
const deletePayment = (paymentId, callback) => {
  paymentModel.deletePayment(paymentId, callback);
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
