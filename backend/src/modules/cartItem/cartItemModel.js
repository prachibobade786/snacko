const db = require("../../config/db");

// add cart item
const addCartItem = (cartItem, callback) => {
  const { user_id, product_id, quantity } = cartItem;

  const sql = `
    INSERT INTO cart_items
    (user_id, product_id, quantity)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [user_id, product_id, quantity], callback);
};

// get all cart items
const getAllCartItems = (callback) => {
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
`;

  db.query(sql, callback);
};

// get cart item by id
const getCartItemById = (cartItemId, callback) => {
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

  db.query(sql, [cartItemId], callback);
};

// get cart items by user id
const getCartItemsByUserId = (userId, callback) => {
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
  `;

  db.query(sql, [userId], callback);
};

// update cart item
const updateCartItem = (cartItemId, cartItem, callback) => {
  const { quantity } = cartItem;

  const sql = `
    UPDATE cart_items
    SET quantity = ?
    WHERE cart_item_id = ?
  `;

  db.query(sql, [quantity, cartItemId], callback);
};

// delete cart item
const deleteCartItem = (cartItemId, callback) => {
  const sql = "DELETE FROM cart_items WHERE cart_item_id = ?";
  db.query(sql, [cartItemId], callback);
};

module.exports = {
  addCartItem,
  getAllCartItems,
  getCartItemById,
  getCartItemsByUserId,
  updateCartItem,
  deleteCartItem
};
