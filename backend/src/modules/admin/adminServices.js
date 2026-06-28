const adminModel = require("./adminModel");

// Get aggregated statistics for the dashboard
const getDashboardStats = async () => {
  const [totalSales, totalOrders, totalCustomers, totalProducts, outOfStock, lowStock] = await Promise.all([
    adminModel.getTotalSales(),
    adminModel.getTotalOrdersCount(),
    adminModel.getTotalCustomersCount(),
    adminModel.getTotalProductsCount(),
    adminModel.getOutOfStockCount(),
    adminModel.getLowStockCount()
  ]);

  return {
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    stockStatus: {
      outOfStock,
      lowStock,
      inStock: totalProducts - outOfStock
    }
  };
};

// Get category revenue statistics
const getCategoryRevenue = async () => {
  return await adminModel.getCategoryRevenue();
};

// Get a list of users with pagination and search
const listUsers = async (page = 1, limit = 10, search = "") => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    adminModel.getAllUsers(limitNum, offset, search),
    adminModel.getTotalUsersCountWithSearch(search)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    }
  };
};

// Update user role
const updateUserRole = async (userId, role) => {
  const allowedRoles = ["customer", "admin"];
  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role. Role must be 'customer' or 'admin'");
  }

  const result = await adminModel.updateUserRole(userId, role);
  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }
  return true;
};

// Delete user account
const deleteUser = async (userId) => {
  const result = await adminModel.deleteUser(userId);
  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }
  return true;
};

// Get all orders with pagination, status filters, and customer search
const listOrders = async (page = 1, limit = 10, status = "", search = "") => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    adminModel.getOrdersList(limitNum, offset, status, search),
    adminModel.getOrdersCount(status, search)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    orders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    }
  };
};

// Get full details of a single order (main info + order items)
const getOrderDetails = async (orderId) => {
  const orderDetails = await adminModel.getOrderMainDetails(orderId);
  if (!orderDetails) {
    throw new Error("Order not found");
  }

  const items = await adminModel.getOrderItemsList(orderId);
  orderDetails.items = items;

  return orderDetails;
};

// Update order status
const updateOrderStatus = async (orderId, status) => {
  const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status. Allowed statuses are: pending, processing, shipped, delivered, cancelled");
  }

  const result = await adminModel.updateOrderStatus(orderId, status);
  if (result.affectedRows === 0) {
    throw new Error("Order not found");
  }
  return true;
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
