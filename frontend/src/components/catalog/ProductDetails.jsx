import React, { useState, useEffect } from "react";
import { Star, ArrowLeft, Send, ShoppingBag, Plus, Minus, User, RefreshCw } from "lucide-react";
import * as api from "../../api/api";
import { useApp } from "../../context/AppContext";
import "./ProductDetails.css";

export default function ProductDetails() {
  const {
    selectedProduct,
    setSelectedProduct,
    setMode,
    token,
    user,
    setIsLoginOpen,
    cart,
    addToCart,
    updateCartQuantity,
    showToast,
    warehouse,
    pincode,
    setOrderComplete,
    fetchProducts,
    products,
    setCart
  } = useApp();

  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ average_rating: "0.0", review_count: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const handleInstantOrder = async () => {
    if (!token) {
      setMode("login");
      return;
    }

    setSubmittingOrder(true);
    try {
      const addrRes = await api.fetchAddresses(token);
      let addressId = null;
      if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
        const defaultAddr = addrRes.data.find(a => a.is_default === 1 || a.is_default === true) || addrRes.data[0];
        addressId = defaultAddr.id;
      }

      if (!addressId) {
        alert("Please add a shipping address in your profile details first!");
        setMode("profile");
        return;
      }

      const orderQty = quantityInCart > 0 ? quantityInCart : 1;
      const orderTotal = (selectedProduct.price * orderQty) + 15;

      const orderData = await api.placeOrder(token, {
        address_id: addressId,
        total_amount: orderTotal
      });

      if (orderData.success) {
        const orderId = orderData.data?.insertId || orderData.order_id;
        
        await api.createOrderItem(token, {
          order_id: orderId,
          product_id: selectedProduct.product_id,
          product_name: selectedProduct.product_name,
          quantity: orderQty,
          price: selectedProduct.price,
          subtotal: orderQty * selectedProduct.price,
          warehouse_id: warehouse?.warehouse_id
        });

        await api.createPayment(token, {
          order_id: orderId,
          user_id: user.id,
          amount: orderTotal,
          payment_method: "Card",
          payment_status: "Completed",
          transaction_id: "TXN_" + Date.now()
        });

        setOrderComplete(true);
        setCart([]);
        setSelectedProduct(null);
        setMode("customer");
        if (fetchProducts) {
          fetchProducts(pincode);
        }
        if (showToast) {
          showToast("Order placed successfully!");
        } else {
          alert("Order placed successfully!");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Instant checkout failed");
    } finally {
      setSubmittingOrder(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      fetchReviewsData();
    }
  }, [selectedProduct]);

  const fetchReviewsData = async () => {
    setLoadingReviews(true);
    try {
      const res = await api.fetchProductReviews(selectedProduct.product_id, token);
      if (res.success) {
        setReviews(res.data.reviews || []);
        setRatingStats(res.data.stats || { average_rating: "0.0", review_count: 0 });
        setHasOrdered(res.data.hasOrdered || false);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.createProductReview(token, selectedProduct.product_id, {
        rating: ratingInput,
        comment: commentInput
      });

      if (res.success) {
        setCommentInput("");
        setRatingInput(5);
        fetchReviewsData();
        if (showToast) {
          showToast("Review submitted successfully!");
        } else {
          alert("Review submitted successfully!");
        }
      } else {
        alert(res.message || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!selectedProduct) return null;

  // Resolve the live product from catalog state to keep stock reactive
  const product = products.find(p => p.product_id === selectedProduct.product_id) || selectedProduct;
  const hasDiscount = product.discount_price !== null && parseFloat(product.discount_price) < parseFloat(product.price);
  const activePrice = hasDiscount ? parseFloat(product.discount_price) : parseFloat(product.price);

  // Check if item is in cart
  const cartItem = cart.find((item) => item.product.product_id === product.product_id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock_quantity <= 0;

  // Calculate star percentages for progress bars
  const starCounts = [0, 0, 0, 0, 0, 0]; // Index 1 to 5
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating]++;
    }
  });

  const totalReviews = reviews.length || 1; // Avoid divide by zero
  const starPercentages = starCounts.map((count) => Math.round((count / totalReviews) * 100));

  return (
    <div className="product-details-container animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={() => {
          setSelectedProduct(null);
          setMode("customer");
        }} 
        className="details-back-btn"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="details-grid">
        {/* LEFT COLUMN: PRODUCT PRESENTATION */}
        <div className="details-product-card">
          <div className="details-image-wrapper">
            {product.product_image ? (
              <img 
                src={product.product_image.startsWith("http://") || product.product_image.startsWith("https://") ? product.product_image : `/${product.product_image}`} 
                alt={product.product_name} 
                className="details-product-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const emojiMap = {
                    "Coca Cola 250ml": "🥤",
                    "Orange Juice 1L": "🍊",
                    "Potato Chips Classic Salted": "🥔",
                    "Chocolate Cookies": "🍪",
                    "Organic Whole Milk 1L": "🥛",
                    "Sourdough Bread 400g": "🍞"
                  };
                  const emoji = emojiMap[product.product_name] || "🍎";
                  e.target.parentNode.innerHTML = `<span class="details-emoji-fallback">${emoji}</span>`;
                }}
              />
            ) : (
              <span className="details-emoji-fallback">🍎</span>
            )}
          </div>

          <div className="details-meta-section">
            <span className="details-category-badge">{product.category_name}</span>
            <h1 className="details-product-title">{product.product_name}</h1>
            <p className="details-product-desc">
              {product.product_description || "Indulge in our carefully selected snacks, guaranteed to deliver high-quality taste and freshness directly to your doorstep in minutes."}
            </p>

             <div className="details-price-row">
               <div className="d-flex align-items-baseline gap-2">
                 <span className="details-price-val">₹{activePrice}</span>
                 {hasDiscount && (
                   <span className="text-decoration-line-through text-slate-400 font-semibold" style={{ fontSize: "16px" }}>
                     ₹{product.price}
                   </span>
                 )}
               </div>
               <span className={`details-stock-badge ${isOutOfStock ? "out" : "in"}`}>
                 {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock_quantity} units)`}
               </span>
             </div>

            {/* Cart Button Adjuster & Place Order Button */}
            <div className="details-action-row flex gap-3">
              {quantityInCart > 0 ? (
                <div className="details-quantity-adjuster" style={{ flex: "1" }}>
                  <button 
                    onClick={() => updateCartQuantity(product.product_id, -1)}
                    className="details-quantity-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="details-quantity-val">{quantityInCart}</span>
                  <button 
                    onClick={() => updateCartQuantity(product.product_id, 1)}
                    disabled={quantityInCart >= 4}
                    title={quantityInCart >= 4 ? "Maximum 4 units allowed" : ""}
                    className="details-quantity-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart(product)} 
                  disabled={isOutOfStock}
                  className="btn btn-primary details-add-cart-btn"
                  style={{ flex: "1" }}
                >
                  <ShoppingBag size={16} /> Add to Cart
                </button>
              )}

              <button
                onClick={handleInstantOrder}
                disabled={isOutOfStock || submittingOrder}
                className="btn btn-yellow details-buy-now-btn flex-1"
                style={{ flex: "1" }}
              >
                {submittingOrder ? <RefreshCw size={14} className="animate-spin" /> : <ShoppingBag size={16} />}
                Place Order
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RATING & REVIEWS */}
        <div className="details-reviews-card">
          <h2 className="reviews-section-heading">Ratings & Reviews</h2>

          {/* Rating Summary Block */}
          <div className="ratings-summary-block">
            <div className="average-rating-container">
              <span className="avg-rating-val">{ratingStats.average_rating}</span>
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    className={star <= Math.round(parseFloat(ratingStats.average_rating)) ? "star-gold filled" : "star-gold"}
                  />
                ))}
              </div>
              <span className="avg-rating-count">{ratingStats.review_count} ratings</span>
            </div>

            {/* Star progress bars */}
            <div className="star-bars-container">
              {[5, 4, 3, 2, 1].map((starNum) => (
                <div key={starNum} className="star-bar-row">
                  <span className="star-bar-label">{starNum} <Star size={10} className="inline filled star-gold" /></span>
                  <div className="star-progress-track">
                    <div 
                      className="star-progress-fill" 
                      style={{ width: `${starPercentages[starNum] || 0}%` }}
                    ></div>
                  </div>
                  <span className="star-bar-percent">{starPercentages[starNum] || 0}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Submission Block */}
          <div className="review-submit-section">
            <h3 className="submit-section-title">Share your feedback</h3>
            {!token ? (
              <div className="review-login-prompt">
                <p>You must be logged in to leave a review.</p>
                <button onClick={() => setIsLoginOpen(true)} className="btn btn-secondary text-xs rounded-xl py-2">
                  Log In Now
                </button>
              </div>
            ) : !hasOrdered ? (
              <div className="review-login-prompt verified-needed">
                <p>⚠️ Only customers who have purchased this product can leave a rating or review.</p>
                <span className="text-[11px] text-slate-400 mt-1">Verified purchases help ensure feedback is authentic.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="review-submit-form">
                <div className="rating-select-group">
                  <label className="rating-select-label">Your Rating:</label>
                  <div className="rating-stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        type="button"
                        key={star} 
                        onClick={() => setRatingInput(star)}
                        className="star-input-btn"
                      >
                        <Star 
                          size={24} 
                          className={star <= ratingInput ? "star-gold filled interactive" : "star-gold interactive"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="comment-input-group">
                  <textarea 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write your review here... How did it taste? Was the delivery fast?"
                    required
                    maxLength={500}
                    className="review-textarea"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingReview} 
                  className="btn btn-primary review-submit-btn"
                >
                  {submittingReview ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit Review
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="reviews-list-section">
            <h3 className="reviews-list-title">Customer Reviews</h3>
            {loadingReviews ? (
              <div className="reviews-loader">
                <RefreshCw size={20} className="animate-spin" /> Fetching reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="no-reviews-placeholder">
                No reviews yet. Be the first to write a review!
              </div>
            ) : (
              <div className="reviews-scroller">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-card-header">
                      <div className="review-user-info">
                        <div className="review-avatar">
                          <User size={14} />
                        </div>
                        <span className="review-user-name">{rev.user_name}</span>
                      </div>
                      <span className="review-date">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="review-card-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          className={star <= rev.rating ? "star-gold filled" : "star-gold"}
                        />
                      ))}
                    </div>

                    {rev.comment && <p className="review-card-comment">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
