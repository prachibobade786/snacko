const productModel = require("./productModel");

const addProduct = async (productData) => {
  return await productModel.addProduct(productData);
};

const getAllProducts = async () => {
  return await productModel.getAllProducts();
};

const getProductById = async (productId) => {
  return await productModel.getProductById(productId);
};

const getProductsByCategoryId = async (categoryId) => {
  return await productModel.getProductsByCategoryId(categoryId);
};

const updateProduct = async (productId, productData) => {
  return await productModel.updateProduct(productId, productData);
};

const deleteProduct = async (productId) => {
  return await productModel.deleteProduct(productId);
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct
};
