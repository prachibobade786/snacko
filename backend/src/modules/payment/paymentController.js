const paymentService = require("./paymentService");

// POST /payments
const addPayment = async (req, res) => {
  try {
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

    const result = await paymentService.addPayment(paymentData);

    return res.status(201).json({
      success: true,
      message: "Payment added successfully",
      payment_id: result.insertId
    });
  } catch (error) {
    console.log("Add Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add payment"
    });
  }
};

// GET /payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: payments
    });
  } catch (error) {
    console.log("Get Payments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments"
    });
  }
};

// GET /payments/:id
const getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment
    });
  } catch (error) {
    console.log("Get Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment"
    });
  }
};

// GET /users/:userId/payments
const getPaymentsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const payments = await paymentService.getPaymentsByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "User payments fetched successfully",
      data: payments
    });
  } catch (error) {
    console.log("Get User Payments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user payments"
    });
  }
};

// GET /orders/:orderId/payments
const getPaymentsByOrderId = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const payments = await paymentService.getPaymentsByOrderId(orderId);

    return res.status(200).json({
      success: true,
      message: "Order payments fetched successfully",
      data: payments
    });
  } catch (error) {
    console.log("Get Order Payments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order payments"
    });
  }
};

// PUT /payments/:id
const updatePayment = async (req, res) => {
  try {
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

    const result = await paymentService.updatePayment(paymentId, paymentData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully"
    });
  } catch (error) {
    console.log("Update Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment"
    });
  }
};

// DELETE /payments/:id
const deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const result = await paymentService.deletePayment(paymentId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully"
    });
  } catch (error) {
    console.log("Delete Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment"
    });
  }
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
