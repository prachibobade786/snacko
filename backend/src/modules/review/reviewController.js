const jwt = require("jsonwebtoken");
const reviewServices = require("./reviewService");

// POST /products/:productId/reviews
const addProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const result = await reviewServices.addReview({
      product_id: productId,
      user_id: userId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: result
    });
  } catch (error) {
    console.error("Error adding product review:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to submit review"
    });
  }
};

// GET /products/:productId/reviews
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Silently ignore jwt decode errors
      }
    }

    const [reviews, stats, hasOrdered] = await Promise.all([
      reviewServices.getReviewsForProduct(productId),
      reviewServices.getRatingStatsForProduct(productId),
      userId ? reviewServices.checkUserPurchase(userId, productId) : Promise.resolve(false)
    ]);

    res.status(200).json({
      success: true,
      message: "Product reviews and ratings retrieved successfully",
      data: {
        reviews,
        stats,
        hasOrdered
      }
    });
  } catch (error) {
    console.error("Error retrieving reviews:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve reviews"
    });
  }
};

module.exports = {
  addProductReview,
  getProductReviews
};
