const express = require("express");

const {
  addPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByOrderId,
  updatePayment,
  deletePayment
} = require("./paymentController");

const router = express.Router();

// payment APIs
router.post("/payments", addPayment);
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);
router.get("/users/:userId/payments", getPaymentsByUserId);
router.get("/orders/:orderId/payments", getPaymentsByOrderId);
router.put("/payments/:id", updatePayment);
router.delete("/payments/:id", deletePayment);

module.exports = router;
