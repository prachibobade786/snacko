const db = require("../../config/db");

// add category
const addCategory = (category, callback) => {
  const { category_name, category_description, category_image, is_active } = category;

  const sql = `
    INSERT INTO categories
    (category_name, category_description, category_image, is_active)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [category_name, category_description, category_image, is_active],
    callback
  );
};

// get all categories
const getAllCategories = (callback) => {
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
  `;

  db.query(sql, callback);
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
