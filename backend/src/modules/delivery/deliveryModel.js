const db = require("../../config/db");

const getAddressById = async (addressId) => {
  const [rows] = await db.execute(
    "SELECT * FROM addresses WHERE id = ?",
    [addressId]
  );

  return rows[0];
};

const getActiveWarehouses = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM warehouses WHERE is_active = TRUE"
  );

  return rows;
};

const updateOrderDeliveryDetails = async (orderId, warehouseId, distance, eta, deliveryCharge, deliveryStatus) => {
  const sql = `
    UPDATE orders
    SET
      warehouse_id = ?,
      delivery_distance_km = ?,
      estimated_delivery_time = ?,
      delivery_charge = ?,
      delivery_status = ?
    WHERE id = ?
  `;

  const [result] = await db.execute(sql, [
    warehouseId,
    distance,
    eta,
    deliveryCharge,
    deliveryStatus,
    orderId
  ]);

  return result;
};

const getOrderTracking = async (orderId) => {
  const sql = `
    SELECT
      o.id AS order_id,
      o.user_id,
      o.address_id,
      o.total_amount,
      o.status AS order_status,
      o.delivery_status,
      o.delivery_distance_km,
      o.estimated_delivery_time,
      o.delivery_charge,
      o.created_at,
      o.updated_at,
      w.warehouse_id,
      w.warehouse_name,
      w.address AS warehouse_address,
      w.latitude AS warehouse_latitude,
      w.longitude AS warehouse_longitude
    FROM orders o
    LEFT JOIN warehouses w ON o.warehouse_id = w.warehouse_id
    WHERE o.id = ?
  `;

  const [rows] = await db.execute(sql, [orderId]);
  return rows[0];
};

const addTrackingHistory = async (orderId, status, description) => {
  const sql = `
    INSERT INTO order_tracking_history
    (order_id, status, description)
    VALUES (?, ?, ?)
  `;

  const [result] = await db.execute(sql, [orderId, status, description]);
  return result;
};

const getTrackingHistory = async (orderId) => {
  const sql = `
    SELECT
      tracking_id,
      order_id,
      status,
      description,
      created_at
    FROM order_tracking_history
    WHERE order_id = ?
    ORDER BY created_at ASC
  `;

  const [rows] = await db.execute(sql, [orderId]);
  return rows;
};

const updateDeliveryStatus = async (orderId, status) => {
  const sql = `
    UPDATE orders
    SET delivery_status = ?
    WHERE id = ?
  `;

  const [result] = await db.execute(sql, [status, orderId]);
  return result;
};

module.exports = {
  getAddressById,
  getActiveWarehouses,
  updateOrderDeliveryDetails,
  getOrderTracking,
  addTrackingHistory,
  getTrackingHistory,
  updateDeliveryStatus
};
