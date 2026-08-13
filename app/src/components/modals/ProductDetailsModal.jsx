import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  TextInput, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { getProductEmoji } from '../ProductCard';
import { getProductReviews, addProductReview, getUserAddresses, placeOrder, addOrderItem, recordCodPayment } from '../../services/api';

export default function ProductDetailsModal({
  visible,
  onClose,
  product,
  cartItem,
  onAddToCart,
  onUpdateQuantity,
  token,
  user,
  onOpenAuth,
  apiBase
}) {
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ average_rating: "0.0", review_count: 0 });
  const [hasOrdered, setHasOrdered] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviewsData = async () => {
    if (!product) return;
    setLoadingReviews(true);
    try {
      const res = await getProductReviews(apiBase, product.product_id, token);
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setRatingStats(res.data.stats || { average_rating: "0.0", review_count: 0 });
        setHasOrdered(res.data.hasOrdered || false);
      }
    } catch (err) {
      console.log('Failed to fetch reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (visible && product) {
      fetchReviewsData();
      // Reset input form
      setRatingInput(5);
      setCommentInput("");
    }
  }, [visible, product, token]);

  const handleReviewSubmit = async () => {
    if (!commentInput.trim()) {
      Alert.alert("Input Required", "Please enter a comment for your review.");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await addProductReview(apiBase, token, product.product_id, {
        rating: ratingInput,
        comment: commentInput.trim()
      });
      if (res.success) {
        setCommentInput("");
        setRatingInput(5);
        Alert.alert("Success", "Your review has been submitted successfully!");
        fetchReviewsData();
      } else {
        Alert.alert("Error", res.message || "Failed to submit review");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong while submitting your review.");
    } finally {
      setSubmittingReview(false);
    }
  };



  if (!product) return null;

  const isOut = product.stock_quantity <= 0;
  const emoji = getProductEmoji(product.product_name);
  const imageUrl = product.product_image 
    ? (product.product_image.startsWith('http') ? product.product_image : `${apiBase ? apiBase.replace('/api', '') : 'http://localhost:5000'}/${product.product_image}`)
    : null;

  const hasDiscount = product.discount_price !== null && parseFloat(product.discount_price) < parseFloat(product.price);
  const activePrice = hasDiscount ? parseFloat(product.discount_price) : parseFloat(product.price);
  const originalPrice = hasDiscount ? parseFloat(product.price) : null;

  // Calculate rating stars percentages for progress tracks
  const starCounts = [0, 0, 0, 0, 0, 0]; // Index 1 to 5
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating]++;
    }
  });
  const totalReviews = reviews.length || 1;
  const starPercentages = starCounts.map(count => Math.round((count / totalReviews) * 100));

  const averageRating = parseFloat(ratingStats.average_rating) || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Product Media Presentation card */}
          <View style={styles.mediaCard}>
            <View style={styles.imageWrapper}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" />
              ) : (
                <Text style={{ fontSize: 72 }}>{emoji}</Text>
              )}
            </View>
          </View>

          {/* Core Product Info */}
          <View style={styles.infoCard}>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryBadge}>{product.category_name || "General"}</Text>
              <View style={[
                styles.stockBadge, 
                isOut ? styles.stockBadgeOut : product.stock_quantity <= 10 ? styles.stockBadgeLow : styles.stockBadgeIn
              ]}>
                <Text style={[
                  styles.stockBadgeText,
                  isOut ? styles.stockBadgeOutText : product.stock_quantity <= 10 ? styles.stockBadgeLowText : styles.stockBadgeInText
                ]}>
                  {isOut ? "OUT OF STOCK" : product.stock_quantity <= 10 ? `${product.stock_quantity} left` : "AVAILABLE"}
                </Text>
              </View>
            </View>

            <Text style={styles.productName}>{product.product_name}</Text>
            <Text style={styles.productDescription}>
              {product.product_description || "Indulge in our carefully selected snacks, guaranteed to deliver high-quality taste and freshness directly to your doorstep in minutes."}
            </Text>

            <View style={styles.purchaseRow}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.productPrice}>₹{activePrice}</Text>
                {originalPrice ? (
                  <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                ) : null}
              </View>

              {/* Cart Controls */}
              {isOut ? (
                <Text style={styles.soldOutText}>Unavailable</Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 20 }}>
                  {cartItem ? (
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity 
                        onPress={() => onUpdateQuantity(product.product_id, -1)}
                        style={styles.qtyBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyVal}>{cartItem.quantity}</Text>
                      <TouchableOpacity 
                        onPress={() => onUpdateQuantity(product.product_id, 1)}
                        style={[styles.qtyBtn, cartItem.quantity >= 4 && styles.qtyBtnDisabled]}
                        disabled={cartItem.quantity >= 4}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.qtyBtnText, cartItem.quantity >= 4 && styles.qtyBtnTextDisabled]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => onAddToCart(product)}
                      style={styles.addBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addBtnText}>ADD TO CART</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Ratings & Reviews Section */}
          <View style={styles.reviewsCard}>
            <Text style={styles.sectionTitle}>Ratings & Reviews</Text>

            {/* Average Ratings Summary block */}
            <View style={styles.ratingSummaryRow}>
              <View style={styles.avgContainer}>
                <Text style={styles.avgValue}>{ratingStats.average_rating}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons 
                      key={star} 
                      name={star <= Math.round(averageRating) ? "star" : "star-outline"} 
                      size={14} 
                      color="#f59e0b" 
                    />
                  ))}
                </View>
                <Text style={styles.totalRatingsCount}>{ratingStats.review_count} reviews</Text>
              </View>

              {/* Progress bars metrics */}
              <View style={styles.progressBarsCol}>
                {[5, 4, 3, 2, 1].map((starNum) => (
                  <View key={starNum} style={styles.progressBarRow}>
                    <Text style={styles.barLabel}>{starNum} ★</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${starPercentages[starNum] || 0}%` }]} />
                    </View>
                    <Text style={styles.barPercent}>{starPercentages[starNum] || 0}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Write a review section */}
            <View style={styles.writeReviewSection}>
              <Text style={styles.subSectionTitle}>Share your feedback</Text>
              
              {!token ? (
                <View style={styles.guardBox}>
                  <Text style={styles.guardText}>You must be logged in to leave a review.</Text>
                  <TouchableOpacity style={styles.authLinkBtn} onPress={onOpenAuth}>
                    <Text style={styles.authLinkText}>Log In Now</Text>
                  </TouchableOpacity>
                </View>
              ) : !hasOrdered ? (
                <View style={styles.guardBox}>
                  <Text style={styles.guardTextWarning}>
                    ⚠️ Only customers who have purchased this product can leave a rating or review.
                  </Text>
                </View>
              ) : (
                <View style={styles.writeForm}>
                  {/* Rating Selector */}
                  <View style={styles.ratingSelectRow}>
                    <Text style={styles.ratingSelectLabel}>Your Rating:</Text>
                    <View style={styles.ratingStarsSelector}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRatingInput(star)} style={{ padding: 4 }}>
                          <Ionicons 
                            name={star <= ratingInput ? "star" : "star-outline"} 
                            size={28} 
                            color="#f59e0b" 
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Comment TextInput */}
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write your review here... How did it taste? Was it fresh?"
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={4}
                    value={commentInput}
                    onChangeText={setCommentInput}
                  />

                  {/* Submit Button */}
                  <TouchableOpacity 
                    style={styles.submitReviewBtn} 
                    onPress={handleReviewSubmit}
                    disabled={submittingReview}
                    activeOpacity={0.8}
                  >
                    {submittingReview ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.submitReviewText}>Submit Review</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Reviews List */}
            <View style={styles.reviewsListSection}>
              <Text style={styles.subSectionTitle}>Customer Reviews</Text>

              {loadingReviews ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
              ) : reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>No reviews yet. Be the first to write a review!</Text>
              ) : (
                <View style={{ gap: 12, marginTop: 8 }}>
                  {reviews.map((rev) => {
                    const initials = rev.user_name ? rev.user_name.slice(0, 2).toUpperCase() : "US";
                    return (
                      <View key={rev.id} style={styles.reviewItemCard}>
                        <View style={styles.reviewHeader}>
                          <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initials}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.reviewerName}>{rev.user_name}</Text>
                            <View style={styles.reviewerStars}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons 
                                  key={star} 
                                  name={star <= rev.rating ? "star" : "star-outline"} 
                                  size={10} 
                                  color="#f59e0b" 
                                />
                              ))}
                            </View>
                          </View>
                          <Text style={styles.reviewDate}>
                            {new Date(rev.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        {rev.comment ? (
                          <Text style={styles.reviewComment}>{rev.comment}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3', // Cream background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7', // Soft border
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDF8F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3A2318', // Brown text
  },
  scrollContainer: {
    flex: 1,
  },
  mediaCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7',
  },
  imageWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6E4C3A', // Soft brown
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeIn: {
    backgroundColor: '#f0fdf4',
  },
  stockBadgeLow: {
    backgroundColor: '#fffbeb',
  },
  stockBadgeOut: {
    backgroundColor: '#fef2f2',
  },
  stockBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  stockBadgeInText: {
    color: '#7CB342', // Green success
  },
  stockBadgeLowText: {
    color: '#D8690F', // Warm orange-brown
  },
  stockBadgeOutText: {
    color: '#ef4444',
  },
  productName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3A2318',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 12,
    color: '#6E4C3A',
    lineHeight: 18,
    marginBottom: 20,
  },
  purchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EAD9C7',
    paddingTop: 16,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3A2318',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    color: '#6E4C3A',
    marginLeft: 6,
    fontWeight: '600',
  },
  soldOutText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  qtyBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  qtyVal: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  reviewsCard: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAD9C7',
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A2318',
    marginBottom: 16,
  },
  ratingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FDF8F3',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAD9C7',
  },
  avgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 85,
    marginRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#EAD9C7',
    paddingRight: 16,
  },
  avgValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3A2318',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1.5,
    marginVertical: 4,
  },
  totalRatingsCount: {
    fontSize: 10,
    color: '#6E4C3A',
    fontWeight: '600',
  },
  progressBarsCol: {
    flex: 1,
    gap: 3,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 10,
    width: 25,
    color: '#6E4C3A',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#EAD9C7',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  barPercent: {
    fontSize: 9,
    width: 28,
    color: '#6E4C3A',
    textAlign: 'right',
    fontWeight: '600',
  },
  writeReviewSection: {
    borderTopWidth: 1,
    borderTopColor: '#EAD9C7',
    paddingTop: 16,
    marginBottom: 24,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3A2318',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  guardBox: {
    backgroundColor: '#FDF8F3',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAD9C7',
    alignItems: 'center',
  },
  guardText: {
    fontSize: 12,
    color: '#6E4C3A',
    fontWeight: '500',
  },
  guardTextWarning: {
    fontSize: 11,
    color: '#D8690F',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  authLinkBtn: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  authLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  writeForm: {
    gap: 12,
  },
  ratingSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingSelectLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E4C3A',
  },
  ratingStarsSelector: {
    flexDirection: 'row',
  },
  commentInput: {
    borderWidth: 1.5,
    borderColor: '#EAD9C7',
    borderRadius: 12,
    backgroundColor: '#FDF8F3',
    padding: 10,
    fontSize: 12,
    color: '#3A2318',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitReviewText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  reviewsListSection: {
    borderTopWidth: 1,
    borderTopColor: '#EAD9C7',
    paddingTop: 16,
  },
  noReviewsText: {
    fontSize: 12,
    color: '#6E4C3A',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  reviewItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAD9C7',
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EAD9C7',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3A2318',
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2318',
  },
  reviewerStars: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 10,
    color: '#6E4C3A',
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 12,
    color: '#3A2318',
    lineHeight: 18,
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyBtnTextDisabled: {
    color: '#cbd5e1',
  },
});
