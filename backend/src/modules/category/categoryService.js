const categoryModel = require("./categoryModel");

// add category
const addCategory = (categoryData, callback) => {
  categoryModel.addCategory(categoryData, callback);
};

// get all categories
const getAllCategories = (callback) => {
  categoryModel.getAllCategories(callback);
};

// get category by id
const getCategoryById = (categoryId, callback) => {
  categoryModel.getCategoryById(categoryId, callback);
};

// update category
const updateCategory = (categoryId, categoryData, callback) => {
  categoryModel.updateCategory(categoryId, categoryData, callback);
};

// delete category
const deleteCategory = (categoryId, callback) => {
  categoryModel.deleteCategory(categoryId, callback);
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
