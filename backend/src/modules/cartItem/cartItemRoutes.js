const express = require("express");

const {
  addCartItem,
  getAllCartItems,
  getCartItemById,
  getCartItemsByUserId,
  updateCartItem,
  deleteCartItem
} = require("./cartItemController");

const router = express.Router();

// cart item APIs
router.post("/cart-items", addCartItem);
router.get("/cart-items", getAllCartItems);
router.get("/cart-items/:id", getCartItemById);
router.get("/users/:userId/cart-items", getCartItemsByUserId);
router.put("/cart-items/:id", updateCartItem);
router.delete("/cart-items/:id", deleteCartItem);

module.exports = router;
