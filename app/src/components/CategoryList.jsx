import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

export default function CategoryList({ categories, selectedCategory, onSelectCategory }) {
  return (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Explore Categories</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
        <TouchableOpacity 
          style={[styles.categoryCard, selectedCategory === null && styles.categoryCardActive]}
          onPress={() => onSelectCategory(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.categoryText, selectedCategory === null && styles.categoryTextActive]}>
            🛍️ All Products
          </Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity 
            key={cat.category_id}
            style={[styles.categoryCard, selectedCategory === cat.category_id && styles.categoryCardActive]}
            onPress={() => onSelectCategory(cat.category_id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.category_id && styles.categoryTextActive]}>
              {cat.category_name === 'Beverages' ? '🍹 ' : cat.category_name === 'Snacks & Chips' ? '🍟 ' : cat.category_name === 'Dairy & Bread' ? '🥛 ' : '🛒 '}
              {cat.category_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesSection: {
    marginVertical: 10,
  },
  sectionHeaderRow: {
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark, // Brown
    letterSpacing: -0.3,
  },
  categoriesScroll: {
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.border, // Soft border
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted, // Soft Brown
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
