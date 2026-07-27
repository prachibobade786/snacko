const productModel = require("./productModel");

// add product
const addProduct = (productData, callback) => {
  productModel.addProduct(productData, callback);
};

// get all products
const getAllProducts = (pincode, callback) => {
  productModel.getAllProducts(pincode, callback);
};

// get product by id
const getProductById = (productId, callback) => {
  productModel.getProductById(productId, callback);
};

// get products by category id
const getProductsByCategoryId = (categoryId, pincode, callback) => {
  productModel.getProductsByCategoryId(categoryId, pincode, callback);
};

// update product
const updateProduct = (productId, productData, callback) => {
  productModel.updateProduct(productId, productData, callback);
};

// delete product
const deleteProduct = (productId, callback) => {
  productModel.deleteProduct(productId, callback);
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct
};
