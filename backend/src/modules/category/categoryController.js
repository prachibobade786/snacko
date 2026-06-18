const categoryService = require("./categoryService");

// POST /categories
const addCategory = (req, res) => {
  const { category_name, category_description, category_image, is_active } = req.body;

  if (!category_name) {
    return res.status(400).json({
      success: false,
      message: "category_name is required"
    });
  }

  const categoryData = {
    category_name,
    category_description: category_description || null,
    category_image: category_image || null,
    is_active: is_active === undefined ? true : is_active
  };

  categoryService.addCategory(categoryData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to add category"
      });
    }

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category_id: result.insertId
    });
  });
};

// GET /categories
const getAllCategories = (req, res) => {
  categoryService.getAllCategories((err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories"
      });
    }

    res.json({
      success: true,
      message: "Categories fetched successfully",
      data: result
    });
  });
};

// GET /categories/:id
const getCategoryById = (req, res) => {
  const categoryId = req.params.id;

  categoryService.getCategoryById(categoryId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch category"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category fetched successfully",
      data: result[0]
    });
  });
};

// PUT /categories/:id
const updateCategory = (req, res) => {
  const categoryId = req.params.id;
  const { category_name, category_description, category_image, is_active } = req.body;

  if (!category_name) {
    return res.status(400).json({
      success: false,
      message: "category_name is required"
    });
  }

  const categoryData = {
    category_name,
    category_description: category_description || null,
    category_image: category_image || null,
    is_active: is_active === undefined ? true : is_active
  };

  categoryService.updateCategory(categoryId, categoryData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to update category"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully"
    });
  });
};

// DELETE /categories/:id
const deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  categoryService.deleteCategory(categoryId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete category"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  });
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
