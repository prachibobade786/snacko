const paymentModel = require("./paymentModel");

const addPayment = async (paymentData) => {
  return await paymentModel.addPayment(paymentData);
};

const getAllPayments = async () => {
  return await paymentModel.getAllPayments();
};

const getPaymentById = async (paymentId) => {
  return await paymentModel.getPaymentById(paymentId);
};

const getPaymentsByUserId = async (userId) => {
  return await paymentModel.getPaymentsByUserId(userId);
};

const getPaymentsByOrderId = async (orderId) => {
  return await paymentModel.getPaymentsByOrderId(orderId);
};

const updatePayment = async (paymentId, paymentData) => {
  return await paymentModel.updatePayment(paymentId, paymentData);
};

const deletePayment = async (paymentId) => {
  return await paymentModel.deletePayment(paymentId);
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
