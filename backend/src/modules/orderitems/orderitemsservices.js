const orderItemModel = require("../orderitems/orderitemsmodel");

const addItem = async (data) => {
  data.subtotal = data.quantity * data.price;

  return await orderItemModel.createOrderItem(data);
};

const getItems = async (orderId) => {
  return await orderItemModel.getItemsByOrderId(orderId);
};

const getAllItems = async () => {
  return await orderItemModel.getAllOrderItems();
};

const getItem = async (id) => {
  return await orderItemModel.getItemById(id);
};

const editItem = async (id, data) => {
  data.subtotal = data.quantity * data.price;

  return await orderItemModel.updateOrderItem(id, data);
};

const removeItem = async (id) => {
  return await orderItemModel.deleteOrderItem(id);
};

module.exports = {
  addItem,
  getItems,
  getAllItems,
  getItem,
  editItem,
  removeItem,
};
