const db = require("../../config/db");

// Add Order Item
const createOrderItem = async (item) => {
  const query = `
        INSERT INTO order_items
        (
            order_id,
            product_id,
            product_name,
            quantity,
            price,
            subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  const [result] = await db.execute(query, [
    item.order_id,
    item.product_id || null,
    item.product_name,
    item.quantity,
    item.price,
    item.subtotal,
  ]);

  // Automatic Stock Reduction
  if (item.product_id) {
    try {
      // 1. Find warehouse serving this order: use passed warehouse_id or lookup via address pincode
      let warehouseId = item.warehouse_id || null;

      if (!warehouseId) {
        const warehouseQuery = `
          SELECT wpin.warehouse_id 
          FROM orders o
          JOIN addresses a ON o.address_id = a.id
          JOIN warehouse_pincodes wpin ON a.pincode = wpin.pincode
          WHERE o.id = ?
          LIMIT 1
        `;
        const [warehouseRows] = await db.execute(warehouseQuery, [item.order_id]);
        if (warehouseRows.length > 0) {
          warehouseId = warehouseRows[0].warehouse_id;
        }
      }

      if (warehouseId) {
        // Check available stock in warehouse
        const stockCheckQuery = `
          SELECT stock_quantity 
          FROM warehouse_products 
          WHERE warehouse_id = ? AND product_id = ?
        `;
        const [stockRows] = await db.execute(stockCheckQuery, [warehouseId, item.product_id]);
        const availableStock = stockRows.length > 0 ? stockRows[0].stock_quantity : 0;

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for product. Available: ${availableStock}, Requested: ${item.quantity}`);
        }

        // Reduce stock in warehouse_products
        const reduceWarehouseStockQuery = `
          UPDATE warehouse_products
          SET stock_quantity = stock_quantity - ?
          WHERE warehouse_id = ? AND product_id = ?
        `;
        await db.execute(reduceWarehouseStockQuery, [item.quantity, warehouseId, item.product_id]);
      }

      // Check and reduce global product stock
      const globalCheckQuery = `
        SELECT stock_quantity FROM products WHERE product_id = ?
      `;
      const [globalRows] = await db.execute(globalCheckQuery, [item.product_id]);
      const globalStock = globalRows.length > 0 ? globalRows[0].stock_quantity : 0;

      if (globalStock < item.quantity && !warehouseId) {
        throw new Error(`Insufficient global stock for product. Available: ${globalStock}, Requested: ${item.quantity}`);
      }

      // Reduce global product stock in products table
      const reduceGlobalStockQuery = `
        UPDATE products
        SET stock_quantity = GREATEST(0, stock_quantity - ?)
        WHERE product_id = ?
      `;
      await db.execute(reduceGlobalStockQuery, [item.quantity, item.product_id]);
    } catch (err) {
      console.error("Stock validation or decrement failed:", err.message);
      throw err; // Propagate error so transaction/insertion fails
    }
  }

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
