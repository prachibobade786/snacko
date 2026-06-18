const db = require("../../config/db");

// Add Order Item
const createOrderItem = async (item) => {
  const query = `
        INSERT INTO order_items
        (
            order_id,
            product_name,
            quantity,
            price,
            subtotal
        )
        VALUES (?, ?, ?, ?, ?)
    `;

  const [result] = await db.execute(query, [
    item.order_id,
    item.product_name,
    item.quantity,
    item.price,
    item.subtotal,
  ]);

  return result;
};

// Get Items By Order
const getItemsByOrderId = async (orderId) => {
  const [rows] = await db.execute(
    `
        SELECT *
        FROM order_items
        WHERE order_id=?
        `,
    [orderId],
  );

  return rows;
};

// Get All Order Items
const getAllOrderItems = async () => {
  const [rows] = await db.execute(
    `
        SELECT *
        FROM order_items
        `,
  );

  return rows;
};

// Get Item By Id
const getItemById = async (id) => {
  const [rows] = await db.execute(
    `
        SELECT *
        FROM order_items
        WHERE id=?
        `,
    [id],
  );

  return rows[0];
};

// Update Item
const updateOrderItem = async (id, item) => {
  const [result] = await db.execute(
    `
        UPDATE order_items
        SET
        quantity=?,
        subtotal=?
        WHERE id=?
        `,
    [item.quantity, item.subtotal, id],
  );

  return result;
};

// Delete Item
const deleteOrderItem = async (id) => {
  const [result] = await db.execute(
    `
        DELETE FROM order_items
        WHERE id=?
        `,
    [id],
  );

  return result;
};

module.exports = {
  createOrderItem,
  getItemsByOrderId,
  getAllOrderItems,
  getItemById,
  updateOrderItem,
  deleteOrderItem,
};
