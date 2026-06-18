const cartItemModel = require("./cartItemModel");

// add cart item
const addCartItem = (cartItemData, callback) => {
  cartItemModel.addCartItem(cartItemData, callback);
};

// get all cart items
const getAllCartItems = (callback) => {
  cartItemModel.getAllCartItems(callback);
};

// get cart item by id
const getCartItemById = (cartItemId, callback) => {
  cartItemModel.getCartItemById(cartItemId, callback);
};

// get cart items by user id
const getCartItemsByUserId = (userId, callback) => {
  cartItemModel.getCartItemsByUserId(userId, callback);
};

// update cart item
const updateCartItem = (cartItemId, cartItemData, callback) => {
  cartItemModel.updateCartItem(cartItemId, cartItemData, callback);
};

// delete cart item
const deleteCartItem = (cartItemId, callback) => {
  cartItemModel.deleteCartItem(cartItemId, callback);
};

module.exports = {
  addCartItem,
  getAllCartItems,
  getCartItemById,
  getCartItemsByUserId,
  updateCartItem,
  deleteCartItem
};
