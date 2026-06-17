const db = require("../../config/db");

// add product
const addProduct = (product, callback) => {
  const {
    category_id,
    product_name,
    product_description,
    price,
    stock_quantity,
    product_image,
    is_available
  } = product;

  const sql = `
    INSERT INTO products
    (category_id, product_name, product_description, price, stock_quantity, product_image, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [category_id, product_name, product_description, price, stock_quantity, product_image, is_available],
    callback
  );
};

// get all products
const getAllProducts = (callback) => {
  const sql = `
    SELECT
      p.product_id,
      p.category_id,
      c.category_name,
      p.product_name,
      p.product_description,
      p.price,
      p.stock_quantity,
      p.product_image,
      p.is_available,
      p.created_at,
      p.updated_at
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
  `;

  db.query(sql, callback);
};

// get product by id
const getProductById = (productId, callback) => {
  const sql = `
    SELECT
      p.product_id,
      p.category_id,
      c.category_name,
      p.product_name,
      p.product_description,
      p.price,
      p.stock_quantity,
      p.product_image,
      p.is_available,
      p.created_at,
      p.updated_at
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    WHERE p.product_id = ?
  `;

  db.query(sql, [productId], callback);
};

// get products by category id
const getProductsByCategoryId = (categoryId, callback) => {
  const sql = `
    SELECT
      product_id,
      category_id,
      product_name,
      product_description,
      price,
      stock_quantity,
      product_image,
      is_available,
      created_at,
      updated_at
    FROM products
    WHERE category_id = ?
  `;

  db.query(sql, [categoryId], callback);
};

// update product
const updateProduct = (productId, product, callback) => {
  const {
    category_id,
    product_name,
    product_description,
    price,
    stock_quantity,
    product_image,
    is_available
  } = product;

  const sql = `
    UPDATE products
    SET
      category_id = ?,
      product_name = ?,
      product_description = ?,
      price = ?,
      stock_quantity = ?,
      product_image = ?,
      is_available = ?
    WHERE product_id = ?
  `;

  db.query(
    sql,
    [category_id, product_name, product_description, price, stock_quantity, product_image, is_available, productId],
    callback
  );
};

// delete product
const deleteProduct = (productId, callback) => {
  const sql = "DELETE FROM products WHERE product_id = ?";
  db.query(sql, [productId], callback);
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct
};
