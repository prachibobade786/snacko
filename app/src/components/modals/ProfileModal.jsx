import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrdersScreen from '../../screens/OrdersScreen';
import { Colors } from '../../constants/theme';
import * as Location from 'expo-location';

export default function ProfileModal({
  visible,
  onClose,
  activeTab,
  setActiveTab,
  nameInput,
  setNameInput,
  emailInput,
  setEmailInput,
  mobileInput,
  setMobileInput,
  onUpdateProfile,
  addresses,
  onDeleteAddress,
  addrLine1,
  setAddrLine1,
  addrLine2,
  setAddrLine2,
  addrCity,
  setAddrCity,
  addrState,
  setAddrState,
  addrPincode,
  setAddrPincode,
  onCreateAddress,
  editingAddressId,
  setEditingAddressId,
  startEditingAddress,
  orders,
  expandedOrder,
  onToggleOrderExpand,
  orderItemsMap,
  onCancelOrder,
  apiBase,
  token,
  showToastMsg,
  onLogout
}) {
  const detectCurrentAddress = async () => {
    if (showToastMsg) showToastMsg('Requesting GPS location...');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (showToastMsg) showToastMsg('Permission to access location was denied');
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
        console.log('Native reverse geocoding fallback in modal:', nativeErr);
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
          console.log('Nominatim lookup error in modal:', fetchErr);
        }
      }

      if (resolvedLine1) setAddrLine1(resolvedLine1);
      if (resolvedLine2) setAddrLine2(resolvedLine2);
      if (resolvedCity) setAddrCity(resolvedCity);
      if (resolvedState) setAddrState(resolvedState);
      if (resolvedPincode) setAddrPincode(resolvedPincode);

      if (showToastMsg) showToastMsg('Address auto-filled successfully!');
    } catch (err) {
      console.log('Error detecting current address:', err);
      if (showToastMsg) showToastMsg('Failed to detect current location details');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>My Account</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Sub-Tabs Selector */}
        <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 4, marginHorizontal: 16, marginTop: 12, borderRadius: 12 }}>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'profile' ? '#ffffff' : 'transparent' }}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeTab === 'profile' ? Colors.primary : '#64748b' }}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'addresses' ? '#ffffff' : 'transparent' }}
            onPress={() => setActiveTab('addresses')}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeTab === 'addresses' ? Colors.primary : '#64748b' }}>Addresses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'orders' ? '#ffffff' : 'transparent' }}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeTab === 'orders' ? Colors.primary : '#64748b' }}>Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Panel Content */}
        <ScrollView style={{ flex: 1, padding: 16 }}>
          
          {/* PROFILE DETAILS PANEL */}
          {activeTab === 'profile' && (
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</Text>
                <TextInput 
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 14, marginTop: 4, color: '#1e293b' }}
                  value={nameInput}
                  onChangeText={setNameInput}
                />
              </View>

              <View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</Text>
                <TextInput 
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 14, marginTop: 4, color: '#1e293b' }}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Mobile Number</Text>
                <TextInput 
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 14, marginTop: 4, color: '#1e293b' }}
                  value={mobileInput}
                  onChangeText={setMobileInput}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity 
                style={{ backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 }}
                onPress={onUpdateProfile}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>Save Profile</Text>
              </TouchableOpacity>

              {/* LOGOUT BUTTON */}
              <TouchableOpacity 
                style={{ flexDirection: 'row', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 6 }}
                onPress={onLogout}
              >
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 14 }}>Logout Account</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* MY ADDRESSES PANEL */}
          {activeTab === 'addresses' && (
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>Saved Locations</Text>
              
              {addresses.map(addr => (
                <View key={addr.id} style={{ padding: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b' }}>{addr.address_line1}</Text>
                    {addr.address_line2 ? <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{addr.address_line2}</Text> : null}
                    <Text style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{addr.city}, {addr.state} - {addr.pincode}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => startEditingAddress(addr)} style={{ marginRight: 12 }}>
                      <Ionicons name="pencil" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDeleteAddress(addr.id)}>
                      <Ionicons name="trash" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {addresses.length === 0 && (
                <Text style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginVertical: 12 }}>No addresses set up yet.</Text>
              )}

               {/* Add/Edit Address Form */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16, marginTop: 8, gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </Text>
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
                  value={addrLine1}
                  onChangeText={setAddrLine1}
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 8, fontSize: 12 }}
                />
                <TextInput 
                  placeholder="Address Line 2 (Optional)" 
                  value={addrLine2}
                  onChangeText={setAddrLine2}
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 8, fontSize: 12 }}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput 
                    placeholder="City" 
                    value={addrCity}
                    onChangeText={setAddrCity}
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 8, fontSize: 12, flex: 1 }}
                  />
                  <TextInput 
                    placeholder="State" 
                    value={addrState}
                    onChangeText={setAddrState}
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 8, fontSize: 12, flex: 1 }}
                  />
                </View>
                <TextInput 
                  placeholder="Pincode" 
                  value={addrPincode}
                  onChangeText={setAddrPincode}
                  maxLength={6}
                  keyboardType="number-pad"
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 8, fontSize: 12 }}
                />
                
                <TouchableOpacity 
                  style={{ backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 4 }}
                  onPress={() => onCreateAddress()}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12 }}>
                    {editingAddressId ? 'Save Changes' : 'Add Location'}
                  </Text>
                </TouchableOpacity>

                {editingAddressId ? (
                  <TouchableOpacity 
                    style={{ backgroundColor: '#e2e8f0', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 2 }}
                    onPress={() => {
                      setEditingAddressId(null);
                      setAddrLine1('');
                      setAddrLine2('');
                      setAddrCity('');
                      setAddrState('');
                      setAddrPincode('');
                    }}
                  >
                    <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 12 }}>Cancel Edit</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}

          {/* MY ORDERS PANEL */}
          {activeTab === 'orders' && (
            <OrdersScreen 
              apiBase={apiBase} 
              token={token} 
              showToastMsg={showToastMsg} 
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
