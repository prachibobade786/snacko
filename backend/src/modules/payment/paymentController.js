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

module.exports = {
  addPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByOrderId,
  updatePayment,
  deletePayment
};
