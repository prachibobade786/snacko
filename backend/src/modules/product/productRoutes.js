const express = require("express");

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
router.post("/products", addProduct);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.get("/categories/:categoryId/products", getProductsByCategoryId);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;
