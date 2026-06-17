const productService = require("./productService");

// POST /products
const addProduct = (req, res) => {
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

  productService.addProduct(productData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to add product"
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product_id: result.insertId
    });
  });
};

// GET /products
const getAllProducts = (req, res) => {
  productService.getAllProducts((err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products"
      });
    }

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: result
    });
  });
};

// GET /products/:id
const getProductById = (req, res) => {
  const productId = req.params.id;

  productService.getProductById(productId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch product"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product fetched successfully",
      data: result[0]
    });
  });
};

// GET /categories/:categoryId/products
const getProductsByCategoryId = (req, res) => {
  const categoryId = req.params.categoryId;

  productService.getProductsByCategoryId(categoryId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch category products"
      });
    }

    res.json({
      success: true,
      message: "Category products fetched successfully",
      data: result
    });
  });
};

// PUT /products/:id
const updateProduct = (req, res) => {
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

  productService.updateProduct(productId, productData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to update product"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully"
    });
  });
};

// DELETE /products/:id
const deleteProduct = (req, res) => {
  const productId = req.params.id;

  productService.deleteProduct(productId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete product"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  });
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct
};
