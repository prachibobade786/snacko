const orderItemService = require("../orderitems/orderitemsservices");

// Add Item
const addItem = async (req, res) => {
  try {
    const result = await orderItemService.addItem(req.body);

    res.status(201).json({
      success: true,
      message: "Item Added Successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Items By Order
const getItems = async (req, res) => {
  try {
    const items = await orderItemService.getItems(req.params.orderId);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Order Items
const getAllItems = async (req, res) => {
  try {
    const items = await orderItemService.getAllItems();

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Item
const getItem = async (req, res) => {
  try {
    const item = await orderItemService.getItem(req.params.id);

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Item
const updateItem = async (req, res) => {
  try {
    const result = await orderItemService.editItem(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Item Updated Successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Item
const deleteItem = async (req, res) => {
  try {
    await orderItemService.removeItem(req.params.id);

    res.status(200).json({
      success: true,
      message: "Item Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addItem,
  getItems,
  getAllItems,
  getItem,
  updateItem,
  deleteItem,
};
