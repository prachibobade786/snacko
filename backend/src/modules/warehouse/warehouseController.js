const warehouseService = require("./warehouseService");

// POST /admin/warehouses
const createWarehouse = (req, res) => {
  const { name, address, delivery_start_time, delivery_end_time, is_active } = req.body;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Warehouse staff are not authorized to create warehouses."
    });
  }

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Warehouse name is required"
    });
  }

  const active = is_active !== undefined ? (is_active ? 1 : 0) : 1;

  warehouseService.createWarehouse(name, address || null, delivery_start_time || "06:00:00", delivery_end_time || "23:00:00", active, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to create warehouse"
      });
    }

    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      warehouse_id: result.insertId
    });
  });
};

// GET /admin/warehouses
const getAllWarehouses = (req, res) => {
  const userWarehouseId = req.user.warehouse_id;

  if (userWarehouseId) {
    warehouseService.getWarehouseById(userWarehouseId, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch warehouse"
        });
      }

      res.json({
        success: true,
        data: result // Already an array of warehouse objects
      });
    });
  } else {
    warehouseService.getAllWarehouses((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch warehouses"
        });
      }

      res.json({
        success: true,
        data: result
      });
    });
  }
};

// GET /admin/warehouses/:id
const getWarehouseById = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to view this warehouse details."
    });
  }

  warehouseService.getWarehouseById(warehouseId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch warehouse"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found"
      });
    }

    res.json({
      success: true,
      data: result[0]
    });
  });
};

// PUT /admin/warehouses/:id
const updateWarehouse = (req, res) => {
  const warehouseId = req.params.id;
  const { name, address, delivery_start_time, delivery_end_time, is_active } = req.body;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to update this warehouse."
    });
  }

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Warehouse name is required"
    });
  }

  // Fetch the existing warehouse configuration first to preserve unset parameters and handle permissions
  warehouseService.getWarehouseById(warehouseId, (err, existing) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to verify warehouse"
      });
    }

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found"
      });
    }

    const currentWH = existing[0];
    
    // Only global admin (userWarehouseId === null/undefined) can modify the active status
    let targetActive = currentWH.is_active;
    if (is_active !== undefined) {
      if (userWarehouseId) {
        // Warehouse manager: silently ignore or preserve the existing active status
        targetActive = currentWH.is_active;
      } else {
        // Global admin: update to target status
        targetActive = is_active ? 1 : 0;
      }
    }

    warehouseService.updateWarehouse(
      warehouseId, 
      name, 
      address || null, 
      delivery_start_time || currentWH.delivery_start_time, 
      delivery_end_time || currentWH.delivery_end_time, 
      targetActive, 
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Failed to update warehouse"
          });
        }

        res.json({
          success: true,
          message: "Warehouse updated successfully"
        });
      }
    );
  });
};

// DELETE /admin/warehouses/:id
const deleteWarehouse = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Warehouse staff are not authorized to delete warehouses."
    });
  }

  warehouseService.deleteWarehouse(warehouseId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete warehouse"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found"
      });
    }

    res.json({
      success: true,
      message: "Warehouse deleted successfully"
    });
  });
};

// POST /admin/warehouses/:id/pincodes
const addPincode = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to manage this warehouse."
    });
  }

  const { pincode } = req.body;

  if (!pincode) {
    return res.status(400).json({
      success: false,
      message: "Pincode is required"
    });
  }

  warehouseService.addPincodeToWarehouse(warehouseId, pincode, (err, result) => {
    if (err) {
      console.error(err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          message: "Pincode is already mapped to a warehouse"
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to add pincode to warehouse"
      });
    }

    res.status(201).json({
      success: true,
      message: "Pincode mapped to warehouse successfully"
    });
  });
};

// DELETE /admin/warehouses/:id/pincodes/:pincode
const removePincode = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to manage this warehouse."
    });
  }

  const pincode = req.params.pincode;

  warehouseService.removePincodeFromWarehouse(warehouseId, pincode, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to remove pincode from warehouse"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Pincode mapping not found"
      });
    }

    res.json({
      success: true,
      message: "Pincode unmapped successfully"
    });
  });
};

// GET /admin/warehouses/:id/pincodes
const getPincodes = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to manage this warehouse."
    });
  }

  warehouseService.getPincodesByWarehouseId(warehouseId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch warehouse pincodes"
      });
    }

    res.json({
      success: true,
      data: result
    });
  });
};

// GET /warehouses/check/:pincode
const checkPincodeServiceability = (req, res) => {
  const pincode = req.params.pincode;

  warehouseService.getWarehouseByPincode(pincode, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to check serviceability"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "We do not service this location yet"
      });
    }

    res.json({
      success: true,
      serviceable: true,
      warehouse: result[0]
    });
  });
};

// POST /admin/warehouses/:id/products
const updateStock = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to manage this warehouse."
    });
  }

  const { product_id, stock_quantity } = req.body;

  if (product_id === undefined || stock_quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: "product_id and stock_quantity are required"
    });
  }

  warehouseService.updateWarehouseProductStock(warehouseId, product_id, stock_quantity, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to update warehouse stock"
      });
    }

    res.json({
      success: true,
      message: "Warehouse stock updated successfully"
    });
  });
};

// GET /admin/warehouses/:id/products
const getInventory = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to manage this warehouse."
    });
  }

  warehouseService.getWarehouseInventory(warehouseId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch warehouse inventory"
      });
    }

    res.json({
      success: true,
      data: result
    });
  });
};

const getWarehouseOrders = (req, res) => {
  const warehouseId = req.params.id;

  const userWarehouseId = req.user.warehouse_id;
  if (userWarehouseId && parseInt(userWarehouseId) !== parseInt(warehouseId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to manage this warehouse."
    });
  }

  warehouseService.getWarehouseOrders(warehouseId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch warehouse orders"
      });
    }

    res.json({
      success: true,
      data: result
    });
  });
};

module.exports = {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  addPincode,
  removePincode,
  getPincodes,
  checkPincodeServiceability,
  updateStock,
  getInventory,
  getWarehouseOrders
};
