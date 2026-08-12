const db = require("../../config/db");

// add category
const addCategory = (category, callback) => {
  const { category_name, category_description, category_image, is_active, warehouse_id } = category;

  const sql = `
    INSERT INTO categories
    (category_name, category_description, category_image, is_active, warehouse_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [category_name, category_description, category_image, is_active, warehouse_id || null],
    callback
  );
};

// get all categories
const getAllCategories = (pincode, warehouseId, callback) => {
  if (typeof pincode === "function") {
    callback = pincode;
    pincode = null;
    warehouseId = null;
  } else if (typeof warehouseId === "function") {
    callback = warehouseId;
    warehouseId = null;
  }

  if (warehouseId) {
    const sql = `
      SELECT category_id, category_name, category_description, category_image, is_active, created_at, updated_at
      FROM categories
      WHERE warehouse_id IS NULL OR warehouse_id = ?
    `;
    db.query(sql, [warehouseId], callback);
  } else if (pincode) {
    const sql = `
      SELECT DISTINCT
        c.category_id,
        c.category_name,
        c.category_description,
        c.category_image,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM categories c
      LEFT JOIN warehouse_pincodes wp ON c.warehouse_id = wp.warehouse_id
      WHERE (c.warehouse_id IS NULL OR wp.pincode = ?) AND c.is_active = 1
    `;
    db.query(sql, [pincode], callback);
  } else {
    const sql = `
      SELECT category_id, category_name, category_description, category_image, is_active, created_at, updated_at
      FROM categories
      WHERE warehouse_id IS NULL
    `;
    db.query(sql, callback);
  }
};

// get category by id
const getCategoryById = (categoryId, callback) => {
  const sql = `
    SELECT
      category_id,
      category_name,
      category_description,
      category_image,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE category_id = ?
  `;

  db.query(sql, [categoryId], callback);
};

// update category
const updateCategory = (categoryId, category, callback) => {
  const { category_name, category_description, category_image, is_active } = category;

  const sql = `
    UPDATE categories
    SET
      category_name = ?,
      category_description = ?,
      category_image = ?,
      is_active = ?
    WHERE category_id = ?
  `;

  db.query(
    sql,
    [category_name, category_description, category_image, is_active, categoryId],
    callback
  );
};

// delete category
const deleteCategory = (categoryId, callback) => {
  const sql = "DELETE FROM categories WHERE category_id = ?";
  db.query(sql, [categoryId], callback);
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
