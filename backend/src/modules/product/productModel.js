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
    is_available,
    warehouse_id
  } = product;

  const sql = `
    INSERT INTO products
    (category_id, product_name, product_description, price, stock_quantity, product_image, is_available, warehouse_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [category_id, product_name, product_description, price, stock_quantity, product_image, is_available, warehouse_id || null],
    (err, result) => {
      if (err) return callback(err);

      if (warehouse_id) {
        const productId = result.insertId;
        const wpSql = `
          INSERT INTO warehouse_products (warehouse_id, product_id, stock_quantity)
          VALUES (?, ?, ?)
        `;
        db.query(wpSql, [warehouse_id, productId, stock_quantity], (wpErr) => {
          if (wpErr) {
            console.error("Failed to map product to warehouse_products:", wpErr.message);
          }
          callback(null, result);
        });
      } else {
        callback(null, result);
      }
    }
  );
};

// get all products
const getAllProducts = (pincode, callback) => {
  if (typeof pincode === "function") {
    callback = pincode;
    pincode = null;
  }

  if (pincode) {
    const sql = `
      SELECT
        p.product_id,
        p.category_id,
        c.category_name,
        p.product_name,
        p.product_description,
        p.price,
        wp.stock_quantity AS stock_quantity,
        p.product_image,
        p.is_available,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      JOIN warehouse_products wp ON p.product_id = wp.product_id
      JOIN warehouse_pincodes wpin ON wp.warehouse_id = wpin.warehouse_id
      WHERE wpin.pincode = ? AND p.is_available = 1 AND (p.warehouse_id IS NULL OR p.warehouse_id = wp.warehouse_id)
    `;
    db.query(sql, [pincode], callback);
  } else {
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
      WHERE p.warehouse_id IS NULL
    `;
    db.query(sql, callback);
  }
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
const getProductsByCategoryId = (categoryId, pincode, callback) => {
  if (typeof pincode === "function") {
    callback = pincode;
    pincode = null;
  }

  if (pincode) {
    const sql = `
      SELECT
        p.product_id,
        p.category_id,
        p.product_name,
        p.product_description,
        p.price,
        wp.stock_quantity AS stock_quantity,
        p.product_image,
        p.is_available,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN warehouse_products wp ON p.product_id = wp.product_id
      JOIN warehouse_pincodes wpin ON wp.warehouse_id = wpin.warehouse_id
      WHERE p.category_id = ? AND wpin.pincode = ? AND p.is_available = 1 AND (p.warehouse_id IS NULL OR p.warehouse_id = wp.warehouse_id)
    `;
    db.query(sql, [categoryId, pincode], callback);
  } else {
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
      WHERE category_id = ? AND warehouse_id IS NULL
    `;
    db.query(sql, [categoryId], callback);
  }
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
