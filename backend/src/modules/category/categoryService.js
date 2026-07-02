const categoryModel = require("./categoryModel");

const addCategory = async (categoryData) => {
  return await categoryModel.addCategory(categoryData);
};

const getAllCategories = async () => {
  return await categoryModel.getAllCategories();
};

const getCategoryById = async (categoryId) => {
  return await categoryModel.getCategoryById(categoryId);
};

const updateCategory = async (categoryId, categoryData) => {
  return await categoryModel.updateCategory(categoryId, categoryData);
};

const deleteCategory = async (categoryId) => {
  return await categoryModel.deleteCategory(categoryId);
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
