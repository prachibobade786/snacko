const db = require("../../config/db");

const createWarehouse = (name, address, delivery_start_time, delivery_end_time, is_active, callback) => {
  let start = delivery_start_time;
  let end = delivery_end_time;
  let active = is_active;
  let cb = callback;
  if (typeof delivery_start_time === "function") {
    cb = delivery_start_time;
    start = "06:00:00";
    end = "23:00:00";
    active = 1;
  } else if (typeof is_active === "function") {
    cb = is_active;
    active = 1;
  }
  const sql = "INSERT INTO warehouses (name, address, delivery_start_time, delivery_end_time, is_active) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, address, start || "06:00:00", end || "23:00:00", active !== undefined ? active : 1], cb);
};

// get all warehouses
const getAllWarehouses = (callback) => {
  const sql = "SELECT * FROM warehouses ORDER BY name";
  db.query(sql, callback);
};

// get warehouse by id
const getWarehouseById = (warehouseId, callback) => {
  const sql = "SELECT * FROM warehouses WHERE warehouse_id = ?";
  db.query(sql, [warehouseId], callback);
};

const updateWarehouse = (warehouseId, name, address, delivery_start_time, delivery_end_time, is_active, callback) => {
  let start = delivery_start_time;
  let end = delivery_end_time;
  let active = is_active;
  let cb = callback;
  if (typeof delivery_start_time === "function") {
    cb = delivery_start_time;
    start = "06:00:00";
    end = "23:00:00";
    active = 1;
  } else if (typeof is_active === "function") {
    cb = is_active;
    active = 1;
  }
  const sql = "UPDATE warehouses SET name = ?, address = ?, delivery_start_time = ?, delivery_end_time = ?, is_active = ? WHERE warehouse_id = ?";
  db.query(sql, [name, address, start || "06:00:00", end || "23:00:00", active !== undefined ? active : 1, warehouseId], cb);
};

// delete warehouse
const deleteWarehouse = (warehouseId, callback) => {
  const sql = "DELETE FROM warehouses WHERE warehouse_id = ?";
  db.query(sql, [warehouseId], callback);
};

// add pincode to warehouse
const addPincodeToWarehouse = (warehouseId, pincode, callback) => {
  const sql = "INSERT INTO warehouse_pincodes (warehouse_id, pincode) VALUES (?, ?)";
  db.query(sql, [warehouseId, pincode], callback);
};

// remove pincode from warehouse
const removePincodeFromWarehouse = (warehouseId, pincode, callback) => {
  const sql = "DELETE FROM warehouse_pincodes WHERE warehouse_id = ? AND pincode = ?";
  db.query(sql, [warehouseId, pincode], callback);
};

// get pincodes served by a warehouse
const getPincodesByWarehouseId = (warehouseId, callback) => {
  const sql = "SELECT * FROM warehouse_pincodes WHERE warehouse_id = ? ORDER BY pincode";
  db.query(sql, [warehouseId], callback);
};

// get warehouse serving a pincode
const getWarehouseByPincode = (pincode, callback) => {
  const sql = `
    SELECT w.*
    FROM warehouses w
    JOIN warehouse_pincodes wp ON w.warehouse_id = wp.warehouse_id
    WHERE wp.pincode = ?
  `;
  db.query(sql, [pincode], callback);
};

// update warehouse product stock (upsert)
const updateWarehouseProductStock = (warehouseId, productId, stockQuantity, callback) => {
  const sql = `
    INSERT INTO warehouse_products (warehouse_id, product_id, stock_quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE stock_quantity = ?
  `;
  db.query(sql, [warehouseId, productId, stockQuantity, stockQuantity], (err, result) => {
    if (err) return callback(err);

    // Sync global product stock
    const syncSql = `
      UPDATE products p
      SET p.stock_quantity = COALESCE((
        SELECT SUM(stock_quantity) 
        FROM warehouse_products 
        WHERE product_id = p.product_id
      ), 0)
      WHERE p.product_id = ?
    `;
    db.query(syncSql, [productId], (syncErr, syncResult) => {
      if (syncErr) {
        console.error("Global stock sync failed during admin adjustment:", syncErr.message);
      }
      callback(null, result);
    });
  });
};

// get warehouse inventory list (all products with their stock in the warehouse)
const getWarehouseInventory = (warehouseId, callback) => {
  const sql = `
    SELECT
      p.product_id,
      p.product_name,
      p.price,
      p.discount_price,
      p.product_image,
      c.category_name,
      COALESCE(wp.stock_quantity, 0) AS stock_quantity
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN warehouse_products wp ON p.product_id = wp.product_id AND wp.warehouse_id = ?
    WHERE p.warehouse_id IS NULL OR p.warehouse_id = ?
    ORDER BY p.product_name
  `;
  db.query(sql, [warehouseId, warehouseId], callback);
};

// get orders assigned to a warehouse based on address pincode
const getWarehouseOrders = (warehouseId, callback) => {
  const sql = `
    SELECT o.id AS order_id, o.user_id, u.name AS name, u.email AS email,
           o.address_id, o.total_amount, o.status, o.created_at AS order_date, o.updated_at,
           o.delivery_partner_name, o.delivery_partner_phone, o.estimated_delivery_minutes,
           a.address_line1, a.address_line2, a.city, a.state, a.country,
           a.pincode AS shipping_pincode,
           p.payment_method, p.payment_status, p.transaction_id
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN addresses a ON o.address_id = a.id
    JOIN warehouse_pincodes wp ON a.pincode = wp.pincode
    LEFT JOIN payments p ON o.id = p.order_id
    WHERE wp.warehouse_id = ?
    ORDER BY o.created_at DESC
  `;
  db.query(sql, [warehouseId], callback);
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
