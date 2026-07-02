const productService = require("./productService");

// POST /products
const addProduct = async (req, res) => {
  try {
    const {
      category_id,
      product_name,
      product_description,
      price,
      stock_quantity,
      product_image,
      is_available
    } = req.body;

    if (!category_id || !product_name || !price) {
      return res.status(400).json({
        success: false,
        message: "category_id, product_name and price are required"
      });
    }

    const productData = {
      category_id,
      product_name,
      product_description: product_description || null,
      price,
      stock_quantity: stock_quantity || 0,
      product_image: product_image || null,
      is_available: is_available === undefined ? true : is_available
    };

    const result = await productService.addProduct(productData);

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product_id: result.insertId
    });
  } catch (error) {
    console.log("Add Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product"
    });
  }
};

// GET /products
const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    console.log("Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};

// GET /products/:id
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product
    });
  } catch (error) {
    console.log("Get Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    });
  }
};

// GET /categories/:categoryId/products
const getProductsByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const products = await productService.getProductsByCategoryId(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category products fetched successfully",
      data: products
    });
  } catch (error) {
    console.log("Get Products By Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category products"
    });
  }
};

// PUT /products/:id
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      category_id,
      product_name,
      product_description,
      price,
      stock_quantity,
      product_image,
      is_available
    } = req.body;

    if (!category_id || !product_name || !price) {
      return res.status(400).json({
        success: false,
        message: "category_id, product_name and price are required"
      });
    }

    const productData = {
      category_id,
      product_name,
      product_description: product_description || null,
      price,
      stock_quantity: stock_quantity || 0,
      product_image: product_image || null,
      is_available: is_available === undefined ? true : is_available
    };

    const result = await productService.updateProduct(productId, productData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully"
    });
  } catch (error) {
    console.log("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
};

// DELETE /products/:id
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await productService.deleteProduct(productId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.log("Delete Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct
};
