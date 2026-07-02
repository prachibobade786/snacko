const categoryService = require("./categoryService");

// POST /categories
const addCategory = async (req, res) => {
  try {
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

    const result = await categoryService.addCategory(categoryData);

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category_id: result.insertId
    });
  } catch (error) {
    console.log("Add Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add category"
    });
  }
};

// GET /categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories
    });
  } catch (error) {
    console.log("Get Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
};

// GET /categories/:id
const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryService.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category
    });
  } catch (error) {
    console.log("Get Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category"
    });
  }
};

// PUT /categories/:id
const updateCategory = async (req, res) => {
  try {
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

    const result = await categoryService.updateCategory(categoryId, categoryData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully"
    });
  } catch (error) {
    console.log("Update Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category"
    });
  }
};

// DELETE /categories/:id
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const result = await categoryService.deleteCategory(categoryId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.log("Delete Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
