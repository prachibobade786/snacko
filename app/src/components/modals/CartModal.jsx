import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { getProductEmoji } from '../ProductCard';

export default function CartModal({
  visible,
  onClose,
  cart,
  onUpdateCartQuantity,
  onClearCart,
  getCartTotal,
  pincode,
  warehouse,
  onCheckout,
  apiBase
}) {
  const isCartEmpty = !cart || cart.length === 0;

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0], 10);
    const min = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min} ${ampm}`;
  };

  const isDeliveryOpen = () => {
    if (!warehouse) return true;
    if (warehouse.is_active === 0) return false;
    if (!warehouse.delivery_start_time || !warehouse.delivery_end_time) return true;
    const start = warehouse.delivery_start_time;
    const end = warehouse.delivery_end_time;
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentSec = String(now.getSeconds()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}:${currentSec}`;

    if (start <= end) {
      return (currentTimeStr >= start && currentTimeStr <= end);
    } else {
      return (currentTimeStr >= start || currentTimeStr <= end);
    }
  };

  const open = isDeliveryOpen();
  const active = warehouse?.is_active !== 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.cartDrawerContainer}>
        {/* Header */}
        <View style={styles.cartHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.cartTitle}>Cart Checkout</Text>
          {!isCartEmpty ? (
            <TouchableOpacity onPress={onClearCart} style={styles.clearCartBtn} activeOpacity={0.7}>
              <Text style={styles.clearCartText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {isCartEmpty ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="basket-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyCartSubtitle}>
              Explore our 15-minute grocery catalog and add your favorite snacks, drinks & fresh items.
            </Text>
            <TouchableOpacity 
              style={styles.browseProductsBtn} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.browseProductsText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>Items ({cart.length})</Text>

              {cart.map(item => {
                const hasDiscount = item.product.discount_price !== null && parseFloat(item.product.discount_price) < parseFloat(item.product.price);
                const activePrice = hasDiscount ? parseFloat(item.product.discount_price) : parseFloat(item.product.price);

                return (
                  <View key={item.product.product_id} style={styles.cartItemRow}>
                    <View style={styles.itemEmojiContainer}>
                      {item.product.product_image ? (
                        <Image 
                          source={{ uri: item.product.product_image.startsWith('http') ? item.product.product_image : `${apiBase ? apiBase.replace('/api', '') : 'http://localhost:5000'}/${item.product.product_image}` }} 
                          style={styles.itemImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={{ fontSize: 26 }}>{getProductEmoji(item.product.product_name)}</Text>
                      )}
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text style={styles.cartItemName} numberOfLines={1}>{item.product.product_name}</Text>
                      <Text style={styles.cartItemPrice}>₹{activePrice} / unit</Text>
                    </View>

                    <View style={styles.qtyContainer}>
                      <TouchableOpacity 
                        onPress={() => onUpdateCartQuantity(item.product.product_id, -1)}
                        style={styles.qtyBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyVal}>{item.quantity}</Text>
                      <TouchableOpacity 
                        onPress={() => onUpdateCartQuantity(item.product.product_id, 1)}
                        style={[styles.qtyBtn, item.quantity >= 4 && styles.qtyBtnDisabled]}
                        disabled={item.quantity >= 4}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.qtyBtnText, item.quantity >= 4 && styles.qtyBtnTextDisabled]}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.cartItemSubtotal}>₹{activePrice * item.quantity}</Text>
                  </View>
                );
              })}

              {/* Bill Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.billHeader}>Bill Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{getCartTotal()}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Instant Delivery Fee</Text>
                  <Text style={styles.summaryValue}>₹15</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>To Pay</Text>
                  <Text style={styles.totalValue}>₹{getCartTotal() + 15}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Delivery operational timings warning */}
            {!open && warehouse && (
              <View style={styles.timingWarningBox}>
                <Ionicons name="warning" size={16} color="#ef4444" />
                <Text style={styles.timingWarningText}>
                  {warehouse.is_active === 0 
                    ? `Delivery services for ${warehouse.name} are temporarily inactive.`
                    : `Delivery is CLOSED for this location. Service hours: ${formatTime(warehouse.delivery_start_time)} to ${formatTime(warehouse.delivery_end_time)}.`}
                </Text>
              </View>
            )}

            <View style={styles.checkoutFooter}>
              <TouchableOpacity 
                style={[styles.payBtn, !open && styles.payBtnDisabled]}
                onPress={onCheckout}
                disabled={!open}
                activeOpacity={0.85}
              >
                <Text style={[styles.payBtnText, !open && styles.payBtnTextDisabled]}>
                  {open 
                    ? `Pay & Place Order (₹${getCartTotal() + 15})` 
                    : warehouse.is_active === 0 
                      ? 'Store Inactive' 
                      : 'Delivery Closed'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cartDrawerContainer: {
    flex: 1,
    backgroundColor: '#FDF8F3', // Cream background
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7', // Soft border
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDF8F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3A2318', // Brown text
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3A2318',
    marginTop: 14,
  },
  emptyCartSubtitle: {
    fontSize: 12,
    color: '#6E4C3A',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 24,
  },
  browseProductsBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  browseProductsText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  cartScroll: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6E4C3A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EAD9C7',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#6E4C3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FDF8F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2318',
  },
  cartItemPrice: {
    fontSize: 11,
    color: '#6E4C3A',
    marginTop: 2,
    fontWeight: '600',
  },
  cartItemSubtotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3A2318',
    width: 65,
    textAlign: 'right',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  qtyVal: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 6,
  },
  deliveryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEBD9',
    borderWidth: 1,
    borderColor: '#EAD9C7',
    borderRadius: 16,
    padding: 14,
    marginVertical: 14,
  },
  timeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDEBD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deliveryInfoText: {
    fontSize: 11,
    color: '#D8690F',
    flex: 1,
    lineHeight: 16,
    fontWeight: '700',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EAD9C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },
  billHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A2318',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6E4C3A',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    color: '#3A2318',
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EAD9C7',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3A2318',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  checkoutFooter: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  payBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  timingWarningBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timingWarningText: {
    color: '#991b1b',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  payBtnDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  payBtnTextDisabled: {
    color: '#64748b',
  },
  clearCartBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  clearCartText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '800',
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyBtnTextDisabled: {
    color: '#cbd5e1',
  },
});
