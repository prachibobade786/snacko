const db = require("../../config/db");

// Create a new review
const createReview = async (review) => {
  const query = `
    INSERT INTO reviews (product_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      rating = VALUES(rating),
      comment = VALUES(comment),
      updated_at = CURRENT_TIMESTAMP
  `;

  const [result] = await db.execute(query, [
    review.product_id,
    review.user_id,
    review.rating,
    review.comment || null
  ]);

  return result;
};

// Get all reviews for a product (joined with user to get names)
const getReviewsByProductId = async (productId) => {
  const query = `
    SELECT 
      r.id,
      r.product_id,
      r.user_id,
      u.name AS user_name,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;

  const [rows] = await db.execute(query, [productId]);
  return rows;
};

// Calculate average rating and count for a product
const getAverageRatingAndCount = async (productId) => {
  const query = `
    SELECT 
      COALESCE(AVG(rating), 0) AS average_rating,
      COUNT(rating) AS review_count
    FROM reviews
    WHERE product_id = ?
  `;

  const [rows] = await db.execute(query, [productId]);
  return {
    average_rating: parseFloat(rows[0].average_rating).toFixed(1),
    review_count: parseInt(rows[0].review_count, 10)
  };
};

// Delete a review by ID
const deleteReview = async (id) => {
  const query = "DELETE FROM reviews WHERE id = ?";
  const [result] = await db.execute(query, [id]);
  return result;
};

// Check if user has ordered a specific product in any order
const hasUserOrderedProduct = async (userId, productId) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ? AND oi.product_id = ?
  `;
  const [rows] = await db.execute(query, [userId, productId]);
  return rows[0].count > 0;
};

module.exports = {
  createReview,
  getReviewsByProductId,
  getAverageRatingAndCount,
  deleteReview,
  hasUserOrderedProduct
};
