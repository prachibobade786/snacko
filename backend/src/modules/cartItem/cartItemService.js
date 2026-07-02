const cartItemModel = require("./cartItemModel");

const addCartItem = async (cartItemData) => {
  return await cartItemModel.addCartItem(cartItemData);
};

const getAllCartItems = async () => {
  return await cartItemModel.getAllCartItems();
};

const getCartItemById = async (cartItemId) => {
  return await cartItemModel.getCartItemById(cartItemId);
};

const getCartItemsByUserId = async (userId) => {
  return await cartItemModel.getCartItemsByUserId(userId);
};

const updateCartItem = async (cartItemId, cartItemData) => {
  return await cartItemModel.updateCartItem(cartItemId, cartItemData);
};

const deleteCartItem = async (cartItemId) => {
  return await cartItemModel.deleteCartItem(cartItemId);
};

module.exports = {
  addCartItem,
  getAllCartItems,
  getCartItemById,
  getCartItemsByUserId,
  updateCartItem,
  deleteCartItem
};
