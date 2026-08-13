import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export const getProductEmoji = (name = '') => {
  const emojiMap = {
    "Coca Cola 250ml": "🥤",
    "Orange Juice 1L": "🍊",
    "Potato Chips Classic Salted": "🥔",
    "Chocolate Cookies": "🍪",
    "Organic Whole Milk 1L": "🥛",
    "Sourdough Bread 400g": "🍞"
  };
  if (emojiMap[name]) return emojiMap[name];

  const lower = name.toLowerCase();
  if (lower.includes('coca') || lower.includes('cola') || lower.includes('soda') || lower.includes('drink')) return '🥤';
  if (lower.includes('juice') || lower.includes('orange')) return '🍊';
  if (lower.includes('chips') || lower.includes('snack') || lower.includes('wafer') || lower.includes('potato')) return '🥔';
  if (lower.includes('cookie') || lower.includes('biscuit') || lower.includes('chocolate')) return '🍪';
  if (lower.includes('milk') || lower.includes('dairy') || lower.includes('cheese')) return '🥛';
  if (lower.includes('bread') || lower.includes('bakery') || lower.includes('sourdough')) return '🍞';
  if (lower.includes('apple') || lower.includes('fruit')) return '🍎';
  return '📦';
};

export default function ProductCard({ item, cartItem, onAddToCart, onUpdateQuantity, cardWidth, apiBase, onPress }) {
  const isOut = item.stock_quantity <= 0;
  const emoji = getProductEmoji(item.product_name);

  // Discount / offer calculations
  const hasDiscount = item.discount_price !== null && parseFloat(item.discount_price) < parseFloat(item.price);
  const isBogo = item.product_id % 5 === 0;
  const activePrice = hasDiscount ? parseFloat(item.discount_price) : parseFloat(item.price);
  const originalPrice = hasDiscount ? parseFloat(item.price) : null;
  const discountPercent = hasDiscount ? Math.round(((parseFloat(item.price) - parseFloat(item.discount_price)) / parseFloat(item.price)) * 100) : 0;
  const estDeliveryTime = `${8 + (item.product_id % 5)} MINS`;

  return (
    <View style={[styles.productCard, cardWidth ? { width: cardWidth } : null]}>
      {/* Blinkit Delivery ETA Badge */}
      <View style={styles.etaBadge}>
        <Ionicons name="stopwatch" size={10} color={Colors.textDark} />
        <Text style={styles.etaText}>{estDeliveryTime}</Text>
      </View>

      {/* Discount / BOGO Badge */}
      {isBogo ? (
        <View style={styles.offBadge}>
          <Text style={styles.offBadgeText}>BUY 1 GET 1</Text>
        </View>
      ) : hasDiscount ? (
        <View style={styles.offBadge}>
          <Text style={styles.offBadgeText}>{discountPercent}% OFF</Text>
        </View>
      ) : null}

      {/* Stock Status Badge */}
      {isOut ? (
        <View style={[styles.stockBadge, styles.stockBadgeOut]}>
          <Text style={styles.stockBadgeOutText}>OUT OF STOCK</Text>
        </View>
      ) : item.stock_quantity <= 10 ? (
        <View style={[styles.stockBadge, styles.stockBadgeLow]}>
          <Text style={styles.stockBadgeLowText}>{item.stock_quantity} left</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flex: 1 }}>
        {/* Product Image */}
        <View style={styles.productImagePlaceholder}>
          {item.product_image ? (
            <Image 
              source={{ uri: item.product_image.startsWith('http') ? item.product_image : `${apiBase ? apiBase.replace('/api', '') : 'http://localhost:5000'}/${item.product_image}` }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 38 }}>{emoji}</Text>
          )}
        </View>

        {/* Details Container */}
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
        </View>
      </TouchableOpacity>

      {/* Footer Container */}
      <View style={[styles.productFooter, { paddingHorizontal: 10, paddingBottom: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', flex: 1, marginRight: 4 }}>
          <Text style={styles.productPrice}>₹{activePrice}</Text>
          {originalPrice ? (
            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
          ) : null}
        </View>
        
        {isOut ? (
          <Text style={styles.soldOutText}>Unavailable</Text>
        ) : cartItem ? (
          <View style={styles.qtyContainer}>
            <TouchableOpacity 
              onPress={() => onUpdateQuantity(item.product_id, -1)}
              style={styles.qtyBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{cartItem.quantity}</Text>
            <TouchableOpacity 
              onPress={() => onUpdateQuantity(item.product_id, 1)}
              style={[styles.qtyBtn, cartItem.quantity >= 4 && styles.qtyBtnDisabled]}
              disabled={cartItem.quantity >= 4}
              activeOpacity={0.7}
            >
              <Text style={[styles.qtyBtnText, cartItem.quantity >= 4 && styles.qtyBtnTextDisabled]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => onAddToCart(item)}
            style={styles.addBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#ffffff',
    margin: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  etaBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
    gap: 3,
  },
  etaText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0f172a',
  },
  productImagePlaceholder: {
    height: 110,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingTop: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 16,
  },
  productUnit: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  addBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  soldOutText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '700',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  qtyBtn: {
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  qtyBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  qtyVal: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 5,
  },
  stockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  stockBadgeOut: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  stockBadgeOutText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#991b1b',
  },
  stockBadgeLow: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  stockBadgeLowText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#92400e',
  },
  offBadge: {
    position: 'absolute',
    top: 26,
    left: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    zIndex: 2,
  },
  offBadgeText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  originalPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
    marginLeft: 4,
    fontWeight: '600',
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyBtnTextDisabled: {
    color: '#cbd5e1',
  },
});
