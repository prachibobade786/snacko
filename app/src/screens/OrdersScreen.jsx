// React Native Grocery Store App - Orders Screen
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserOrders, getOrderItems, cancelOrder } from '../services/api';
import { Colors } from '../constants/theme';
import { getProductEmoji } from '../components/ProductCard';

export default function OrdersScreen({ apiBase, token, onBack, showToastMsg }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItemsMap, setOrderItemsMap] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (orders.length > 0) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [orders]);

  const formatTimeLeft = (ms) => {
    if (ms <= 0) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchOrders = async (pageToFetch = currentPage) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getUserOrders(apiBase, token, pageToFetch, pageSize);
      if (data.success) {
        if (data.totalPages !== undefined) {
          // Server-side paginated response
          setOrders(data.data || []);
          setTotalOrders(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(pageToFetch);
        } else {
          // Fallback client-side pagination for raw arrays
          const fullList = data.data || [];
          const count = fullList.length;
          const calculatedPages = Math.max(1, Math.ceil(count / pageSize));
          const validatedPage = Math.min(pageToFetch, calculatedPages);
          const startIndex = (validatedPage - 1) * pageSize;

          setOrders(fullList.slice(startIndex, startIndex + pageSize));
          setTotalOrders(count);
          setTotalPages(calculatedPages);
          setCurrentPage(validatedPage);
        }
      }
    } catch (err) {
      console.log('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setExpandedOrder(null);
    fetchOrders(newPage);
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItemsMap[orderId] || !token) return;
    try {
      const data = await getOrderItems(apiBase, token, orderId);
      if (data.success) {
        setOrderItemsMap(prev => ({
          ...prev,
          [orderId]: data.data || []
        }));
      }
    } catch (err) {
      console.log('Error fetching items:', err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!token) return;
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              const data = await cancelOrder(apiBase, token, orderId);
              if (data.success) {
                if (showToastMsg) showToastMsg('Order cancelled');
                fetchOrders(currentPage);
              } else {
                if (showToastMsg) showToastMsg(data.message || 'Failed to cancel order');
              }
            } catch (err) {
              if (showToastMsg) showToastMsg('Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [token, apiBase]);

  const startOrderIndex = totalOrders === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endOrderIndex = Math.min(currentPage * pageSize, totalOrders);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity onPress={() => fetchOrders(currentPage)} style={{ padding: 4 }}>
          <Ionicons name="refresh" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-handle-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
            <Text style={styles.emptySubtitle}>Your order history will appear here once you place an order.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {orders.map(ord => {
              const timePassed = currentTime - new Date(ord.created_at).getTime();
              const timeLeftMs = 120000 - timePassed;
              const isCancelable = timeLeftMs > 0;
              const timeElapsedMs = currentTime - new Date(ord.created_at).getTime();
              const isDelayed = ord.status === 'pending' && timeElapsedMs > 180000;
              const delaySeconds = isDelayed ? Math.floor((timeElapsedMs - 180000) / 1000) : 0;
              return (
                <View key={ord.id} style={styles.orderCard}>
                {/* Order Summary Header */}
                <View style={styles.orderCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.orderIdText}>Order #SNK-{ord.id}</Text>
                      <View style={[
                        styles.statusBadge, 
                        ord.status === 'cancelled' ? styles.statusCancelled : styles.statusPending
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          ord.status === 'cancelled' ? styles.statusCancelledText : styles.statusPendingText
                        ]}>
                          {ord.status.toUpperCase()}
                        </Text>
                      </View>
                      {isDelayed && (
                        <View style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}>
                          <Text style={{ color: '#ef4444', fontSize: 9, fontWeight: 'bold' }}>
                            ⚠️ Delayed: {delaySeconds}s
                          </Text>
                        </View>
                      )}
                      <View style={styles.paymentBadge}>
                        <Ionicons 
                          name={ord.payment_method === 'RAZORPAY' ? "card" : "cash"} 
                          size={10} 
                          color={ord.payment_method === 'RAZORPAY' ? "#0284c7" : "#d97706"} 
                        />
                        <Text style={[
                          styles.paymentBadgeText,
                          { color: ord.payment_method === 'RAZORPAY' ? "#0369a1" : "#b45309" }
                        ]}>
                          {ord.payment_method || 'COD'} ({ord.payment_status || 'PENDING'})
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderDateText}>
                      {new Date(ord.created_at).toLocaleDateString()} at {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>

                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.orderTotalText}>₹{ord.total_amount}</Text>
                    <TouchableOpacity onPress={() => toggleOrderExpand(ord.id)}>
                      <Ionicons 
                        name={expandedOrder === ord.id ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        color="#64748b" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Expandable Items List */}
                {expandedOrder === ord.id && (
                  <View style={styles.orderItemsContainer}>
                    <Text style={styles.itemsSectionTitle}>Order Items</Text>
                    {!orderItemsMap[ord.id] ? (
                      <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 8 }} />
                    ) : (
                      <View style={{ gap: 8 }}>
                        {orderItemsMap[ord.id].map((item) => (
                          <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemNameText} numberOfLines={1}>
                              {getProductEmoji(item.product_name)} {item.product_name} <Text style={{ color: '#94a3b8' }}>x{item.quantity}</Text>
                            </Text>
                            <Text style={styles.itemPriceText}>₹{item.subtotal}</Text>
                          </View>
                        ))}

                        {ord.status === 'pending' && (
                          <View style={{ gap: 4 }}>
                            <TouchableOpacity 
                              style={[styles.cancelBtn, !isCancelable && styles.cancelBtnDisabled]}
                              onPress={() => isCancelable && handleCancelOrder(ord.id)}
                              disabled={!isCancelable}
                            >
                              <Text style={[styles.cancelBtnText, !isCancelable && styles.cancelBtnTextDisabled]}>
                                {isCancelable ? `Cancel Order (Ends in ${formatTimeLeft(timeLeftMs)})` : 'Cancel Order (Expired)'}
                              </Text>
                            </TouchableOpacity>
                            {isCancelable && (
                              <Text style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
                                Orders can only be cancelled within 2 minutes of placement.
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                </View>
              )}
            </View>
          );
        })}

            {/* Pagination Controls Footer */}
            <View style={styles.paginationCard}>
              <Text style={styles.paginationSummary}>
                Showing <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{startOrderIndex}-{endOrderIndex}</Text> of <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{totalOrders}</Text> orders
              </Text>

              <View style={styles.paginationControls}>
                <TouchableOpacity 
                  style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
                  disabled={currentPage <= 1}
                  onPress={() => handlePageChange(currentPage - 1)}
                >
                  <Ionicons name="chevron-back" size={16} color={currentPage <= 1 ? '#cbd5e1' : '#475569'} />
                  <Text style={[styles.pageBtnText, currentPage <= 1 && styles.pageBtnTextDisabled]}>Prev</Text>
                </TouchableOpacity>

                <View style={styles.pageBadge}>
                  <Text style={styles.pageBadgeText}>Page {currentPage} of {totalPages}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
                  disabled={currentPage >= totalPages}
                  onPress={() => handlePageChange(currentPage + 1)}
                >
                  <Text style={[styles.pageBtnText, currentPage >= totalPages && styles.pageBtnTextDisabled]}>Next</Text>
                  <Ionicons name="chevron-forward" size={16} color={currentPage >= totalPages ? '#cbd5e1' : '#475569'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3', // Cream background
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7', // Soft border
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A2318', // Brown text
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A2318',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6E4C3A',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EAD9C7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderCardHeader: {
    padding: 14,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3A2318',
  },
  orderDateText: {
    fontSize: 11,
    color: '#6E4C3A',
    marginTop: 2,
  },
  orderTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#FDEBD9',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusPendingText: {
    color: Colors.primary,
  },
  statusCancelledText: {
    color: '#b91c1c',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FDF8F3',
    borderWidth: 1,
    borderColor: '#EAD9C7',
  },
  paymentBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  orderItemsContainer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#EAD9C7',
    backgroundColor: '#ffffff',
  },
  itemsSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6E4C3A',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNameText: {
    fontSize: 12,
    color: '#3A2318',
    flex: 1,
    marginRight: 10,
  },
  itemPriceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6E4C3A',
  },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
  },
  cancelBtnText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  paginationCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EAD9C7',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    alignItems: 'center',
    gap: 10,
  },
  paginationSummary: {
    fontSize: 11,
    color: '#6E4C3A',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FDEBD9',
  },
  pageBtnDisabled: {
    backgroundColor: '#FDF8F3',
    opacity: 0.6,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3A2318',
  },
  pageBtnTextDisabled: {
    color: '#EAD9C7',
  },
  pageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FDEBD9',
  },
  pageBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cancelBtnDisabled: {
    borderColor: '#cbd5e1',
    backgroundColor: '#FDF8F3',
  },
  cancelBtnTextDisabled: {
    color: '#6E4C3A',
  },
});
