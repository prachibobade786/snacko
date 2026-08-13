const express = require("express");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  addCodPayment,
  addPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByOrderId,
  updatePayment,
  deletePayment,
  renderCheckoutForm
} = require("./paymentController");

const router = express.Router();

// Razorpay & COD payment APIs
router.post("/payments/razorpay/create-order", createRazorpayOrder);
router.post("/payments/razorpay/verify", verifyRazorpayPayment);
router.get("/payments/razorpay/checkout-form", renderCheckoutForm);
router.post("/payments/cod", addCodPayment);

// payment APIs
router.post("/payments", addPayment);
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);
router.get("/users/:userId/payments", getPaymentsByUserId);
router.get("/orders/:orderId/payments", getPaymentsByOrderId);
router.put("/payments/:id", updatePayment);
router.delete("/payments/:id", deletePayment);

module.exports = router;

