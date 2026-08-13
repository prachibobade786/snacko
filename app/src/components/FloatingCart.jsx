import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function FloatingCart({ cart, getCartTotal, onOpenCart }) {
  if (!cart || cart.length === 0) return null;

  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <TouchableOpacity 
      style={styles.floatingCart}
      onPress={onOpenCart}
      activeOpacity={0.9}
    >
      <View style={styles.floatingCartLeft}>
        <Text style={styles.countText}>{totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.floatingCartTotal}>₹{getCartTotal()}</Text>
      </View>
      
      <View style={styles.floatingCartRight}>
        <Text style={styles.viewCartText}>View Cart</Text>
        <View style={styles.arrowBg}>
          <Ionicons name="caret-forward" size={12} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dotSeparator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  floatingCartTotal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCartText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  arrowBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
});
