const cartItemService = require("./cartItemService");

// POST /cart-items
const addCartItem = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "user_id, product_id and quantity are required"
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be greater than 0"
      });
    }

    const cartItemData = { user_id, product_id, quantity };
    const result = await cartItemService.addCartItem(cartItemData);

    return res.status(201).json({
      success: true,
      message: "Cart item added successfully",
      cart_item_id: result.insertId
    });
  } catch (error) {
    console.log("Add Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add cart item"
    });
  }
};

// GET /cart-items
const getAllCartItems = async (req, res) => {
  try {
    const cartItems = await cartItemService.getAllCartItems();

    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      data: cartItems
    });
  } catch (error) {
    console.log("Get Cart Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart items"
    });
  }
};

// GET /cart-items/:id
const getCartItemById = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const cartItem = await cartItemService.getCartItemById(cartItemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item fetched successfully",
      data: cartItem
    });
  } catch (error) {
    console.log("Get Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart item"
    });
  }
};

// GET /users/:userId/cart-items
const getCartItemsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await cartItemService.getCartItemsByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "User cart items fetched successfully",
      data: cartItems
    });
  } catch (error) {
    console.log("Get User Cart Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user cart items"
    });
  }
};

// PUT /cart-items/:id
const updateCartItem = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "quantity is required"
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be greater than 0"
      });
    }

    const result = await cartItemService.updateCartItem(cartItemId, { quantity });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully"
    });
  } catch (error) {
    console.log("Update Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item"
    });
  }
};

// DELETE /cart-items/:id
const deleteCartItem = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const result = await cartItemService.deleteCartItem(cartItemId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item deleted successfully"
    });
  } catch (error) {
    console.log("Delete Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete cart item"
    });
  }
};

module.exports = {
  addCartItem,
  getAllCartItems,
  getCartItemById,
  getCartItemsByUserId,
  updateCartItem,
  deleteCartItem
};
