const warehouseModel = require("./warehouseModel");

const createWarehouse = (name, address, delivery_start_time, delivery_end_time, is_active, callback) => {
  warehouseModel.createWarehouse(name, address, delivery_start_time, delivery_end_time, is_active, callback);
};

const getAllWarehouses = (callback) => {
  warehouseModel.getAllWarehouses(callback);
};

const getWarehouseById = (warehouseId, callback) => {
  warehouseModel.getWarehouseById(warehouseId, callback);
};

const updateWarehouse = (warehouseId, name, address, delivery_start_time, delivery_end_time, is_active, callback) => {
  warehouseModel.updateWarehouse(warehouseId, name, address, delivery_start_time, delivery_end_time, is_active, callback);
};

const deleteWarehouse = (warehouseId, callback) => {
  warehouseModel.deleteWarehouse(warehouseId, callback);
};

const addPincodeToWarehouse = (warehouseId, pincode, callback) => {
  warehouseModel.addPincodeToWarehouse(warehouseId, pincode, callback);
};

const removePincodeFromWarehouse = (warehouseId, pincode, callback) => {
  warehouseModel.removePincodeFromWarehouse(warehouseId, pincode, callback);
};

const getPincodesByWarehouseId = (warehouseId, callback) => {
  warehouseModel.getPincodesByWarehouseId(warehouseId, callback);
};

const getWarehouseByPincode = (pincode, callback) => {
  warehouseModel.getWarehouseByPincode(pincode, callback);
};

const updateWarehouseProductStock = (warehouseId, productId, stockQuantity, callback) => {
  warehouseModel.updateWarehouseProductStock(warehouseId, productId, stockQuantity, callback);
};

const getWarehouseInventory = (warehouseId, callback) => {
  warehouseModel.getWarehouseInventory(warehouseId, callback);
};

const getWarehouseOrders = (warehouseId, callback) => {
  warehouseModel.getWarehouseOrders(warehouseId, callback);
};

module.exports = {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  addPincodeToWarehouse,
  removePincodeFromWarehouse,
  getPincodesByWarehouseId,
  getWarehouseByPincode,
  updateWarehouseProductStock,
  getWarehouseInventory,
  getWarehouseOrders
};
