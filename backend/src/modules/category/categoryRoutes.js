const express = require("express");

const {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require("./categoryController");

const router = express.Router();

// category APIs
router.post("/categories", addCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;
