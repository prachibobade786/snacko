const express = require("express");
const router = express.Router();

// Middlewares
const verifyToken = require("../../middleware/authmiddleware");
const isAdmin = require("../../middleware/adminmiddleware");

// Controllers
const {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  addPincode,
  removePincode,
  getPincodes,
  checkPincodeServiceability,
  updateStock,
  getInventory,
  getWarehouseOrders
} = require("./warehouseController");

// Public endpoints
router.get("/warehouses/check/:pincode", checkPincodeServiceability);

// Admin-only endpoints
router.post("/admin/warehouses", verifyToken, isAdmin, createWarehouse);
router.get("/admin/warehouses", verifyToken, isAdmin, getAllWarehouses);
router.get("/admin/warehouses/:id", verifyToken, isAdmin, getWarehouseById);
router.put("/admin/warehouses/:id", verifyToken, isAdmin, updateWarehouse);
router.delete("/admin/warehouses/:id", verifyToken, isAdmin, deleteWarehouse);

// Admin-only pincode mapping endpoints
router.get("/admin/warehouses/:id/pincodes", verifyToken, isAdmin, getPincodes);
router.post("/admin/warehouses/:id/pincodes", verifyToken, isAdmin, addPincode);
router.delete("/admin/warehouses/:id/pincodes/:pincode", verifyToken, isAdmin, removePincode);

// Admin-only product stock endpoints
router.get("/admin/warehouses/:id/products", verifyToken, isAdmin, getInventory);
router.post("/admin/warehouses/:id/products", verifyToken, isAdmin, updateStock);

// Admin-only warehouse orders endpoint
router.get("/admin/warehouses/:id/orders", verifyToken, isAdmin, getWarehouseOrders);

module.exports = router;
