const express = require("express");
const verifyToken = require("../../middleware/authmiddleware");
const isAdmin = require("../../middleware/adminmiddleware");

const {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require("./categoryController");

const router = express.Router();

// category APIs
router.post("/categories", verifyToken, isAdmin, addCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", verifyToken, isAdmin, updateCategory);
router.delete("/categories/:id", verifyToken, isAdmin, deleteCategory);

module.exports = router;
