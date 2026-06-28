const express = require("express");
const router = express.Router();

// Middlewares
const verifyToken = require("../../middleware/authmiddleware");
const isAdmin = require("../../middleware/adminmiddleware");

// Controllers
const {
  getDashboardStats,
  getCategoryRevenue,
  listUsers,
  updateUserRole,
  deleteUser,
  listOrders,
  getOrderDetails,
  updateOrderStatus
} = require("./adminController");

// Dashboard & Analytics
router.get("/dashboard/stats", verifyToken, isAdmin, getDashboardStats);
router.get("/dashboard/revenue-by-category", verifyToken, isAdmin, getCategoryRevenue);

// User Management
router.get("/users", verifyToken, isAdmin, listUsers);
router.put("/users/:id/role", verifyToken, isAdmin, updateUserRole);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

// Order Management
router.get("/orders", verifyToken, isAdmin, listOrders);
router.get("/orders/:id", verifyToken, isAdmin, getOrderDetails);
router.put("/orders/:id/status", verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
