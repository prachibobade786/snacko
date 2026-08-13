import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function WarehouseBanner({ warehouse }) {
  if (!warehouse) return null;

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
  const active = warehouse.is_active !== 0;

  return (
    <View style={[styles.warehouseBanner, !open && styles.warehouseBannerClosed]}>
      <View style={styles.textContainer}>
        <View style={styles.headerTagRow}>
          <View style={styles.instantTag}>
            <Ionicons name={open ? "flash" : "time-outline"} size={12} color="#ffffff" />
            <Text style={styles.instantTagText}>{open ? "SNACKO FAST" : !active ? "INACTIVE" : "OFFLINE"}</Text>
          </View>
          <Text style={styles.warehouseTitle} numberOfLines={1}>
            {warehouse.name}
          </Text>
        </View>
        <Text style={styles.warehouseSubtitle} numberOfLines={1}>
          {warehouse.address}
        </Text>
        {warehouse.delivery_start_time && (
          <Text style={styles.warehouseTimings} numberOfLines={1}>
            {!active
              ? `⚠️ Store Temporarily Inactive`
              : open 
                ? `⏰ Operational Hours: ${formatTime(warehouse.delivery_start_time)} - ${formatTime(warehouse.delivery_end_time)}`
                : `⚠️ Operating Hours: ${formatTime(warehouse.delivery_start_time)} - ${formatTime(warehouse.delivery_end_time)}`}
          </Text>
        )}
      </View>
      <View style={styles.deliveryBadge}>
        <Text style={[styles.deliveryTimeText, !open && styles.deliveryTimeClosed]}>
          {open ? '15-20' : 'CLOSED'}
        </Text>
        {open && <Text style={styles.deliveryMinText}>MINS</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warehouseBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 6,
    padding: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  warehouseBannerClosed: {
    backgroundColor: '#475569', // Slate gray for closed
    shadowColor: '#475569',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instantTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  instantTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  warehouseTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  warehouseSubtitle: {
    color: '#ffe3d1',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  warehouseTimings: {
    color: '#f8fafc',
    fontSize: 9,
    marginTop: 5,
    fontWeight: '700',
    opacity: 0.9,
  },
  deliveryBadge: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deliveryTimeText: {
    color: Colors.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  deliveryTimeClosed: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
  },
  deliveryMinText: {
    color: '#0f172a',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
