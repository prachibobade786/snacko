const express = require("express");
const verifyToken = require("../../middleware/authmiddleware");
const isAdmin = require("../../middleware/adminmiddleware");

const {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct
} = require("./productController");

const router = express.Router();

// product APIs
router.post("/products", verifyToken, isAdmin, addProduct);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.get("/categories/:categoryId/products", getProductsByCategoryId);
router.put("/products/:id", verifyToken, isAdmin, updateProduct);
router.delete("/products/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
