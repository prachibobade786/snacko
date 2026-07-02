const db = require("../../config/db");

// add product
const addProduct = async (product) => {
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

  const [result] = await db.execute(sql, [
    category_id,
    product_name,
    product_description,
    price,
    stock_quantity,
    product_image,
    is_available
  ]);

  return result;
};

// get all products
const getAllProducts = async () => {
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
    ORDER BY p.product_id DESC
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

// get product by id
const getProductById = async (productId) => {
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

  const [rows] = await db.execute(sql, [productId]);
  return rows[0];
};

// get products by category id
const getProductsByCategoryId = async (categoryId) => {
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
    ORDER BY price ASC
  `;

  const [rows] = await db.execute(sql, [categoryId]);
  return rows;
};

// update product
const updateProduct = async (productId, product) => {
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

  const [result] = await db.execute(sql, [
    category_id,
    product_name,
    product_description,
    price,
    stock_quantity,
    product_image,
    is_available,
    productId
  ]);

  return result;
};

// delete product
const deleteProduct = async (productId) => {
  const sql = "DELETE FROM products WHERE product_id = ?";
  const [result] = await db.execute(sql, [productId]);
  return result;
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct
};
