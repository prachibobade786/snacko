const db = require("../../config/db");

const getCartItemsWithProducts = async (userId) => {
  const sql = `
    SELECT
      ci.cart_item_id,
      ci.user_id,
      ci.product_id,
      ci.quantity,
      p.product_name,
      p.price,
      p.stock_quantity,
      p.category_id,
      p.is_available,
      c.category_name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    JOIN categories c ON p.category_id = c.category_id
    WHERE ci.user_id = ?
  `;

  const [rows] = await db.execute(sql, [userId]);
  return rows;
};

const getProductById = async (productId) => {
  const sql = `
    SELECT
      p.product_id,
      p.product_name,
      p.product_description,
      p.price,
      p.stock_quantity,
      p.category_id,
      p.is_available,
      c.category_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    WHERE p.product_id = ?
  `;

  const [rows] = await db.execute(sql, [productId]);
  return rows[0];
};

const findCheaperAlternative = async (categoryId, currentProductId, currentPrice) => {
  const sql = `
    SELECT
      p.product_id,
      p.product_name,
      p.product_description,
      p.price,
      p.stock_quantity,
      p.category_id,
      c.category_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    WHERE p.category_id = ?
      AND p.product_id != ?
      AND p.price < ?
      AND p.stock_quantity > 0
      AND p.is_available = TRUE
      AND c.is_active = TRUE
    ORDER BY p.price ASC
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [categoryId, currentProductId, currentPrice]);
  return rows[0];
};

const findAvailableAlternatives = async (categoryId, currentProductId) => {
  const sql = `
    SELECT
      p.product_id,
      p.product_name,
      p.product_description,
      p.price,
      p.stock_quantity,
      p.category_id,
      c.category_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    WHERE p.category_id = ?
      AND p.product_id != ?
      AND p.stock_quantity > 0
      AND p.is_available = TRUE
      AND c.is_active = TRUE
    ORDER BY p.price ASC
    LIMIT 3
  `;

  const [rows] = await db.execute(sql, [categoryId, currentProductId]);
  return rows;
};

module.exports = {
  getCartItemsWithProducts,
  getProductById,
  findCheaperAlternative,
  findAvailableAlternatives
};
