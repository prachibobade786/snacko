const cartItemService = require("./cartItemService");

// POST /cart-items
const addCartItem = (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({
      success: false,
      message: "user_id, product_id and quantity are required"
    });
  }

  const cartItemData = {
    user_id,
    product_id,
    quantity
  };

  cartItemService.addCartItem(cartItemData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to add cart item"
      });
    }

    res.status(201).json({
      success: true,
      message: "Cart item added successfully",
      cart_item_id: result.insertId
    });
  });
};

// GET /cart-items
const getAllCartItems = (req, res) => {
  cartItemService.getAllCartItems((err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart items"
      });
    }

    res.json({
      success: true,
      message: "Cart items fetched successfully",
      data: result
    });
  });
};

// GET /cart-items/:id
const getCartItemById = (req, res) => {
  const cartItemId = req.params.id;

  cartItemService.getCartItemById(cartItemId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart item"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    res.json({
      success: true,
      message: "Cart item fetched successfully",
      data: result[0]
    });
  });
};

// GET /users/:userId/cart-items
const getCartItemsByUserId = (req, res) => {
  const userId = req.params.userId;

  cartItemService.getCartItemsByUserId(userId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user cart items"
      });
    }

    res.json({
      success: true,
      message: "User cart items fetched successfully",
      data: result
    });
  });
};

// PUT /cart-items/:id
const updateCartItem = (req, res) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({
      success: false,
      message: "quantity is required"
    });
  }

  const cartItemData = {
    quantity
  };

  cartItemService.updateCartItem(cartItemId, cartItemData, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to update cart item"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    res.json({
      success: true,
      message: "Cart item updated successfully"
    });
  });
};

// DELETE /cart-items/:id
const deleteCartItem = (req, res) => {
  const cartItemId = req.params.id;

  cartItemService.deleteCartItem(cartItemId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete cart item"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    res.json({
      success: true,
      message: "Cart item deleted successfully"
    });
  });
};

module.exports = {
  addCartItem,
  getAllCartItems,
  getCartItemById,
  getCartItemsByUserId,
  updateCartItem,
  deleteCartItem
};
