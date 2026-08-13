const reviewModel = require("./reviewModel");

const addReview = async (reviewData) => {
  if (!reviewData.product_id || !reviewData.user_id || !reviewData.rating) {
    throw new Error("Product ID, User ID, and Rating (1-5) are required.");
  }
  
  const ratingNum = parseInt(reviewData.rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  // Verify the user has ordered this product
  const hasOrdered = await reviewModel.hasUserOrderedProduct(reviewData.user_id, reviewData.product_id);
  if (!hasOrdered) {
    throw new Error("You can only review products that you have purchased.");
  }

  return await reviewModel.createReview({
    ...reviewData,
    rating: ratingNum
  });
};

const getReviewsForProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required.");
  }
  return await reviewModel.getReviewsByProductId(productId);
};

const getRatingStatsForProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required.");
  }
  return await reviewModel.getAverageRatingAndCount(productId);
};

const checkUserPurchase = async (userId, productId) => {
  if (!userId || !productId) return false;
  return await reviewModel.hasUserOrderedProduct(userId, productId);
};

const removeReview = async (id) => {
  return await reviewModel.deleteReview(id);
};

module.exports = {
  addReview,
  getReviewsForProduct,
  getRatingStatsForProduct,
  checkUserPurchase,
  removeReview
};
