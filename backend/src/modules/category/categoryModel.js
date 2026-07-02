const db = require("../../config/db");

// add category
const addCategory = async (category) => {
  const { category_name, category_description, category_image, is_active } = category;

  const sql = `
    INSERT INTO categories
    (category_name, category_description, category_image, is_active)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql, [
    category_name,
    category_description,
    category_image,
    is_active
  ]);

  return result;
};

// get all categories
const getAllCategories = async () => {
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
    ORDER BY category_id DESC
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

// get category by id
const getCategoryById = async (categoryId) => {
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

  const [rows] = await db.execute(sql, [categoryId]);
  return rows[0];
};

// update category
const updateCategory = async (categoryId, category) => {
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

  const [result] = await db.execute(sql, [
    category_name,
    category_description,
    category_image,
    is_active,
    categoryId
  ]);

  return result;
};

// delete category
const deleteCategory = async (categoryId) => {
  const sql = "DELETE FROM categories WHERE category_id = ?";
  const [result] = await db.execute(sql, [categoryId]);
  return result;
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
