import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { checkWarehousePincode, applyCoupon } from '../../services/api';
import * as Location from 'expo-location';

export default function AddressConfirmModal({
  visible,
  onClose,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  onConfirmOrder,
  onCreateAddress,
  totalAmount,
  apiBase,
  activePincode,
  token
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [serviceabilityMap, setServiceabilityMap] = useState({});
  const [checkingMap, setCheckingMap] = useState(false);
  
  // Coupon States
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Add new address state
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const detectCurrentAddress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const { latitude, longitude } = loc.coords;
      
      let resolvedLine1 = '';
      let resolvedLine2 = '';
      let resolvedCity = '';
      let resolvedState = '';
      let resolvedPincode = '';

      try {
        const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocoded && geocoded.length > 0) {
          const info = geocoded[0];
          resolvedLine1 = `${info.name || ''} ${info.street || ''}`.trim();
          resolvedLine2 = info.subregion || info.district || '';
          resolvedCity = info.city || info.subregion || '';
          resolvedState = info.region || '';
          resolvedPincode = info.postalCode ? info.postalCode.replace(/\s/g, '') : '';
        }
      } catch (nativeErr) {
        console.log('Native reverse geocoding fallback in checkout modal:', nativeErr);
      }

      if (!resolvedPincode) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
              'User-Agent': 'SnackoInstantDeliveryApp/1.0'
            }
          });
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.suburb || addr.neighbourhood || '';
            const neighbourhood = addr.neighbourhood || addr.suburb || '';
            resolvedLine1 = addr.house_number ? `${addr.house_number}, ${road}`.trim() : road;
            resolvedLine2 = neighbourhood !== road ? neighbourhood : '';
            resolvedCity = addr.city || addr.town || addr.village || addr.county || '';
            resolvedState = addr.state || '';
            resolvedPincode = addr.postcode ? addr.postcode.replace(/\s/g, '') : '';
          }
        } catch (fetchErr) {
          console.log('Nominatim lookup error in checkout modal:', fetchErr);
        }
      }

      if (resolvedLine1) setLine1(resolvedLine1);
      if (resolvedLine2) setLine2(resolvedLine2);
      if (resolvedCity) setCity(resolvedCity);
      if (resolvedState) setState(resolvedState);
      if (resolvedPincode) setPincode(resolvedPincode);

    } catch (err) {
      console.log('Error detecting current address:', err);
    }
  };

  useEffect(() => {
    if (visible && addresses.length > 0) {
      checkAddressesServiceability();
    }
  }, [visible, addresses]);

  const checkAddressesServiceability = async () => {
    setCheckingMap(true);
    const map = {};
    const uniquePincodes = [...new Set(addresses.map(a => a.pincode))];
    await Promise.all(
      uniquePincodes.map(async (p) => {
        if (!p) return;
        try {
          const res = await checkWarehousePincode(apiBase, p);
          map[p] = !!(res.success && res.serviceable);
        } catch (e) {
          map[p] = false;
        }
      })
    );
    setServiceabilityMap(map);
    setCheckingMap(false);
  };

  const activeAddr = addresses.find(a => (a.id || a.address_id) === selectedAddressId) || addresses[0];
  const isSelectedAddrPincodeMatch = activeAddr && activePincode ? String(activeAddr.pincode).trim() === String(activePincode).trim() : true;
  const isSelectedAddrServiceable = activeAddr 
    ? (serviceabilityMap[activeAddr.pincode] !== false && isSelectedAddrPincodeMatch) 
    : true;

  useEffect(() => {
    if (showAddForm && activePincode && !pincode) {
      setPincode(activePincode);
    }
  }, [showAddForm, activePincode]);

  useEffect(() => {
    if (!visible) {
      setCouponCodeInput('');
      setAppliedCoupon('');
      setCouponDiscount(0);
      setCouponError('');
      setCouponSuccess('');
    }
  }, [visible]);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    setApplyingCoupon(true);
    try {
      const cartSubtotal = totalAmount - 15;
      const res = await applyCoupon(apiBase, token, couponCodeInput.toUpperCase().trim(), cartSubtotal);
      if (res.success && res.data) {
        const discountVal = parseFloat(res.data.discount_amount) || 0;
        setCouponDiscount(discountVal);
        setAppliedCoupon(couponCodeInput.toUpperCase().trim());
        setCouponSuccess(`Coupon applied! You saved ₹${discountVal}.`);
      } else {
        setCouponDiscount(0);
        setAppliedCoupon('');
        setCouponError(res.message || 'Failed to apply coupon.');
      }
    } catch (err) {
      console.log('Error applying coupon:', err);
      setCouponDiscount(0);
      setAppliedCoupon('');
      setCouponError('Invalid coupon or network error.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!line1 || !city || !state || !pincode) return;
    const targetPin = pincode.trim() || activePincode;
    await onCreateAddress({
      address_line1: line1,
      address_line2: line2,
      city,
      state,
      pincode: targetPin,
      country: 'India',
      is_default: 1
    });
    setLine1('');
    setLine2('');
    setCity('');
    setState('');
    setPincode('');
    setShowAddForm(false);
  };

  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'RAZORPAY'

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.modalTitle}>Confirm Order & Payment</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 390 }} showsVerticalScrollIndicator={false}>
            {/* Address Selection List */}
            <Text style={styles.sectionLabel}>1. Select Delivery Location</Text>
            
            {addresses.map(addr => {
              const addrId = addr.id || addr.address_id;
              const isSelected = (selectedAddressId || activeAddr?.id || activeAddr?.address_id) === addrId;
              const isPincodeMatch = activePincode ? String(addr.pincode).trim() === String(activePincode).trim() : true;
              const isServ = serviceabilityMap[addr.pincode] !== false && isPincodeMatch;

              return (
                <TouchableOpacity
                  key={addrId}
                  style={[
                    styles.addressCard, 
                    isSelected && (isServ ? styles.addressCardSelected : styles.addressCardUnserviceable),
                    !isServ && !isSelected && { borderColor: '#fca5a5' }
                  ]}
                  onPress={() => setSelectedAddressId(addrId)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.radioCircle,
                    !isServ && { borderColor: '#ef4444' }
                  ]}>
                    {isSelected && <View style={[styles.radioInner, !isServ && { backgroundColor: '#ef4444' }]} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={styles.addressLine1}>{addr.address_line1}</Text>
                      {!checkingMap && (
                        !isPincodeMatch ? (
                          <View style={styles.badgeUnserviceable}>
                            <Text style={styles.badgeTextUnserviceable}>Mismatched Pincode</Text>
                          </View>
                        ) : isServ ? (
                          <View style={styles.badgeServiceable}>
                            <Text style={styles.badgeTextServiceable}>Serviceable</Text>
                          </View>
                        ) : (
                          <View style={styles.badgeUnserviceable}>
                            <Text style={styles.badgeTextUnserviceable}>Outside Delivery Area</Text>
                          </View>
                        )
                      )}
                    </View>
                    {addr.address_line2 ? <Text style={styles.addressLine2}>{addr.address_line2}</Text> : null}
                    <Text style={styles.addressCity}>
                      {addr.city}, {addr.state} - <Text style={{ fontWeight: '800' }}>{addr.pincode}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {addresses.length === 0 && !showAddForm && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No saved delivery addresses found.</Text>
              </View>
            )}

            {/* Add New Address Form Toggle */}
            {!showAddForm ? (
              <TouchableOpacity 
                style={styles.addAddrToggleBtn}
                onPress={() => setShowAddForm(true)}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.addAddrToggleText}>Add New Delivery Address</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addForm}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.formTitle}>New Delivery Address</Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3eb', borderWidth: 1, borderColor: '#ffdcd0', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 }}
                    onPress={detectCurrentAddress}
                  >
                    <Ionicons name="location" size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: Colors.primary }}>Auto-Fill Location</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="Address Line 1"
                  placeholderTextColor="#94a3b8"
                  value={line1}
                  onChangeText={setLine1}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Address Line 2 (Optional)"
                  placeholderTextColor="#94a3b8"
                  value={line2}
                  onChangeText={setLine2}
                  style={styles.input}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    placeholder="City"
                    placeholderTextColor="#94a3b8"
                    value={city}
                    onChangeText={setCity}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TextInput
                    placeholder="State"
                    placeholderTextColor="#94a3b8"
                    value={state}
                    onChangeText={setState}
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>
                <TextInput
                  placeholder="Pincode"
                  placeholderTextColor="#94a3b8"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity 
                    style={[styles.formBtn, { backgroundColor: '#f1f5f9' }]}
                    onPress={() => setShowAddForm(false)}
                  >
                    <Text style={{ color: '#475569', fontWeight: '700', fontSize: 12 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.formBtn, { backgroundColor: Colors.primary, flex: 1 }]}
                    onPress={handleAddSubmit}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>Save Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Payment Method Selection */}
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>2. Select Payment Method</Text>

            <View style={{ gap: 8, marginBottom: 12 }}>
              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  paymentMethod === 'COD' && styles.paymentOptionCardSelected
                ]}
                onPress={() => setPaymentMethod('COD')}
                activeOpacity={0.85}
              >
                <View style={[styles.radioCircle, paymentMethod === 'COD' && { borderColor: Colors.primary }]}>
                  {paymentMethod === 'COD' && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="cash" size={16} color={paymentMethod === 'COD' ? Colors.primary : "#475569"} />
                    <Text style={[styles.paymentTitle, paymentMethod === 'COD' && { color: Colors.primary }]}>
                      Cash on Delivery (COD)
                    </Text>
                  </View>
                  <Text style={styles.paymentSubtext}>Pay with cash or UPI when your order is delivered</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  paymentMethod === 'RAZORPAY' && styles.paymentOptionCardSelected
                ]}
                onPress={() => setPaymentMethod('RAZORPAY')}
                activeOpacity={0.85}
              >
                <View style={[styles.radioCircle, paymentMethod === 'RAZORPAY' && { borderColor: Colors.primary }]}>
                  {paymentMethod === 'RAZORPAY' && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="card" size={16} color={paymentMethod === 'RAZORPAY' ? Colors.primary : "#475569"} />
                    <Text style={[styles.paymentTitle, paymentMethod === 'RAZORPAY' && { color: Colors.primary }]}>
                      Razorpay Online Payment
                    </Text>
                  </View>
                  <Text style={styles.paymentSubtext}>Instant & secure pay via UPI, Credit/Debit Cards & NetBanking</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Coupon Code Input */}
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>3. Apply Promo Code / Coupon</Text>
            <View style={styles.couponContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code (e.g. WELCOME10)"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                value={couponCodeInput}
                onChangeText={setCouponCodeInput}
              />
              <TouchableOpacity 
                style={styles.couponApplyBtn}
                onPress={handleApplyCoupon}
                disabled={applyingCoupon}
                activeOpacity={0.8}
              >
                {applyingCoupon ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.couponApplyText}>APPLY</Text>
                )}
              </TouchableOpacity>
            </View>
            {couponError ? (
              <Text style={styles.couponErrorMsg}>{couponError}</Text>
            ) : null}
            {couponSuccess ? (
              <Text style={styles.couponSuccessMsg}>{couponSuccess}</Text>
            ) : null}
          </ScrollView>

          {/* Unserviceable Warning Box */}
          {!isSelectedAddrServiceable && (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.warningText}>
                {!isSelectedAddrPincodeMatch 
                  ? `Selected address (pincode: ${activeAddr?.pincode}) does not match active location (${activePincode}).`
                  : `Delivery unavailable for pincode ${activeAddr?.pincode}. Please select a location inside warehouse coverage.`
                }
              </Text>
            </View>
          )}

          {/* Action Footer */}
          <View style={styles.modalFooter}>
            {couponDiscount > 0 ? (
              <View style={styles.appliedDiscountRow}>
                <Text style={styles.appliedDiscountLabel}>Coupon "{appliedCoupon}" Applied:</Text>
                <Text style={styles.appliedDiscountVal}>-₹{couponDiscount}</Text>
              </View>
            ) : null}
            <TouchableOpacity 
              style={[
                styles.confirmOrderBtn,
                !isSelectedAddrServiceable && styles.confirmOrderBtnDisabled
              ]}
              disabled={!isSelectedAddrServiceable}
              onPress={() => onConfirmOrder(
                selectedAddressId || activeAddr?.id || activeAddr?.address_id,
                paymentMethod,
                appliedCoupon || null,
                couponDiscount || 0
              )}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmOrderText}>
                {isSelectedAddrServiceable 
                  ? `Pay & Place Order (₹${Math.max(0, totalAmount - couponDiscount)}) • ${paymentMethod === 'COD' ? 'COD' : 'Razorpay'}` 
                  : 'Delivery Not Available'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF8F3', // Cream Card
    borderWidth: 1.5,
    borderColor: '#EAD9C7', // Soft border
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  paymentOptionCardSelected: {
    backgroundColor: '#FDEBD9', // Tint
    borderColor: Colors.primary,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A2318', // Brown text
  },
  paymentSubtext: {
    fontSize: 10,
    color: '#6E4C3A', // Soft brown text
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 35, 24, 0.4)', // Warm overlay
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAD9C7',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3A2318',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDF8F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAD9C7',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6E4C3A',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF8F3',
    borderWidth: 1.5,
    borderColor: '#EAD9C7',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },
  addressCardSelected: {
    backgroundColor: '#FDEBD9',
    borderColor: Colors.primary,
  },
  addressCardUnserviceable: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  addressLine1: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A2318',
  },
  addressLine2: {
    fontSize: 11,
    color: '#6E4C3A',
    marginTop: 2,
  },
  addressCity: {
    fontSize: 11,
    color: '#6E4C3A',
    marginTop: 2,
  },
  badgeServiceable: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTextServiceable: {
    color: '#047857',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  badgeUnserviceable: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTextUnserviceable: {
    color: '#b91c1c',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 11,
    color: '#991b1b',
    fontWeight: '600',
    flex: 1,
  },
  emptyBox: {
    padding: 16,
    backgroundColor: '#FDF8F3',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAD9C7',
  },
  emptyText: {
    fontSize: 12,
    color: '#6E4C3A',
    textAlign: 'center',
  },
  addAddrToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#EAD9C7',
    borderRadius: 14,
    backgroundColor: '#FDEBD9',
    marginTop: 4,
    marginBottom: 10,
  },
  addAddrToggleText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  addForm: {
    backgroundColor: '#FDF8F3',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAD9C7',
    gap: 8,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A2318',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAD9C7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    backgroundColor: '#ffffff',
    color: '#3A2318',
  },
  formBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAD9C7',
    marginTop: 8,
  },
  confirmOrderBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmOrderBtnDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmOrderText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  // Coupon styles
  couponContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#EAD9C7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    backgroundColor: '#ffffff',
    color: '#3A2318',
    fontWeight: '700',
  },
  couponApplyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponApplyText: {
    color: '#ffffff',
    fontWeight: '950',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  couponErrorMsg: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 2,
  },
  couponSuccessMsg: {
    color: '#7CB342', // green
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 2,
  },
  appliedDiscountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  appliedDiscountLabel: {
    fontSize: 12,
    color: '#7CB342', // Green
    fontWeight: '750',
  },
  appliedDiscountVal: {
    fontSize: 12,
    color: '#7CB342', // Green
    fontWeight: '800',
  },
});

