

const adminService = require("./adminServices");

const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard statistics"
    });
  }
};

const getCategoryRevenue = async (req, res) => {
  try {
    const data = await adminService.getCategoryRevenue();
    res.status(200).json({
      success: true,
      message: "Category revenue retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve category revenue"
    });
  }
};

const listUsers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await adminService.listUsers(page, limit, search);
    res.status(200).json({
      success: true,
      message: "Users list retrieved successfully",
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve users list"
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required in request body"
      });
    }

    await adminService.updateUserRole(userId, role);
    res.status(200).json({
      success: true,
      message: `User role updated successfully to '${role}'`
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update user role"
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await adminService.deleteUser(userId);
    res.status(200).json({
      success: true,
      message: "User account deleted successfully"
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete user"
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await adminService.listOrders(page, limit, status, search);
    res.status(200).json({
      success: true,
      message: "Orders list retrieved successfully",
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders list"
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await adminService.getOrderDetails(orderId);
    res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      data: order
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve order details"
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, delivery_partner_name, delivery_partner_phone, estimated_delivery_minutes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required in request body"
      });
    }

    await adminService.updateOrderStatus(orderId, status, {
      delivery_partner_name,
      delivery_partner_phone,
      estimated_delivery_minutes
    });
    res.status(200).json({
      success: true,
      message: `Order status updated successfully to '${status}'`
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update order status"
    });
  }
};

module.exports = {
  getDashboardStats,
  getCategoryRevenue,
  listUsers,
  updateUserRole,
  deleteUser,
  listOrders,
  getOrderDetails,
  updateOrderStatus
};
