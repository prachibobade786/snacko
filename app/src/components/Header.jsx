import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function Header({ pincode, resolvedAddress, onOpenPincodeModal, onOpenProfileModal, searchQuery, onSearchChange }) {
  return (
    <View style={styles.header}>
      {/* Blinkit-Style Top Bar */}
      <View style={styles.headerTopRow}>
        <View style={styles.logoAndDelivery}>
          <Text style={styles.logoText}>Snacko<Text style={styles.logoYellow}>.</Text></Text>
          
          <TouchableOpacity 
            style={styles.deliveryLocationContainer} 
            onPress={onOpenPincodeModal}
            activeOpacity={0.7}
          >
            <View style={styles.deliveryTimeBadge}>
              <Ionicons name="flash" size={10} color="#ffffff" />
              <Text style={styles.deliveryTimeText}>15 MINS</Text>
            </View>
            <View style={styles.locationTextWrapper}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.locationTitle}>
                  {pincode ? `Delivering to ${pincode}` : 'Select Location'}
                </Text>
                <Ionicons name="chevron-down" size={12} color="#0f172a" style={{ marginLeft: 3 }} />
              </View>
              {resolvedAddress ? (
                <Text style={styles.locationSubtitle} numberOfLines={1}>
                  {resolvedAddress}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.profileBtn}
          onPress={onOpenProfileModal}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Blinkit-Style Wide Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput 
          placeholder="Search 'milk', 'chips', 'beverages'..." 
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={onSearchChange}
          style={styles.searchInput}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => onSearchChange('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7', // Soft border
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 10 : 6,
    paddingBottom: 10,
    shadowColor: '#3A2318',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logoAndDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
    marginRight: 12,
  },
  logoYellow: {
    color: Colors.secondary,
  },
  deliveryLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEBD9', // primaryLight / Tint
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAD9C7', // Border
    flex: 1,
  },
  deliveryTimeBadge: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginRight: 6,
    gap: 2,
  },
  deliveryTimeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  locationTextWrapper: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3A2318', // textDark
  },
  locationSubtitle: {
    fontSize: 8,
    color: '#6E4C3A', // textMuted
    fontWeight: '600',
    marginTop: 1,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDEBD9', // primaryLight / Tint
    borderWidth: 1,
    borderColor: '#EAD9C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF8F3', // Cream background
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 6,
    borderWidth: 1,
    borderColor: '#EAD9C7',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#3A2318',
    fontWeight: '500',
  },
});
