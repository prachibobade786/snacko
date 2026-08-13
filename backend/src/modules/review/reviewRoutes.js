const express = require("express");
const verifyToken = require("../../middleware/authmiddleware");
const reviewController = require("./reviewController");

const router = express.Router();

// GET /products/:productId/reviews
router.get("/products/:productId/reviews", reviewController.getProductReviews);

// POST /products/:productId/reviews
router.post("/products/:productId/reviews", verifyToken, reviewController.addProductReview);

module.exports = router;
