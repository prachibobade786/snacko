const db = require("../../config/db");

// add cart item
const addCartItem = async (cartItem) => {
  const { user_id, product_id, quantity } = cartItem;

  const sql = `
    INSERT INTO cart_items
    (user_id, product_id, quantity)
    VALUES (?, ?, ?)
  `;

  const [result] = await db.execute(sql, [user_id, product_id, quantity]);
  return result;
};

// get all cart items
const getAllCartItems = async () => {
  const sql = `
    SELECT
      ci.cart_item_id,
      ci.user_id,
      u.name AS full_name,
      ci.product_id,
      p.product_name,
      p.price,
      ci.quantity,
      (p.price * ci.quantity) AS total_price,
      ci.created_at,
      ci.updated_at
    FROM cart_items ci
    JOIN users u ON ci.user_id = u.id
    JOIN products p ON ci.product_id = p.product_id
    ORDER BY ci.cart_item_id DESC
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

// get cart item by id
const getCartItemById = async (cartItemId) => {
  const sql = `
    SELECT
      ci.cart_item_id,
      ci.user_id,
      u.name AS full_name,
      ci.product_id,
      p.product_name,
      p.price,
      ci.quantity,
      (p.price * ci.quantity) AS total_price,
      ci.created_at,
      ci.updated_at
    FROM cart_items ci
    JOIN users u ON ci.user_id = u.id
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_item_id = ?
  `;

  const [rows] = await db.execute(sql, [cartItemId]);
  return rows[0];
};

// get cart items by user id
const getCartItemsByUserId = async (userId) => {
  const sql = `
    SELECT
      ci.cart_item_id,
      ci.user_id,
      ci.product_id,
      p.product_name,
      p.price,
      ci.quantity,
      (p.price * ci.quantity) AS total_price,
      ci.created_at,
      ci.updated_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.cart_item_id DESC
  `;

  const [rows] = await db.execute(sql, [userId]);
  return rows;
};

// update cart item
const updateCartItem = async (cartItemId, cartItem) => {
  const { quantity } = cartItem;

  const sql = `
    UPDATE cart_items
    SET quantity = ?
    WHERE cart_item_id = ?
  `;

  const [result] = await db.execute(sql, [quantity, cartItemId]);
  return result;
};

// delete cart item
const deleteCartItem = async (cartItemId) => {
  const sql = "DELETE FROM cart_items WHERE cart_item_id = ?";
  const [result] = await db.execute(sql, [cartItemId]);
  return result;
};

module.exports = {
  addCartItem,
  getAllCartItems,
  getCartItemById,
  getCartItemsByUserId,
  updateCartItem,
  deleteCartItem
};
