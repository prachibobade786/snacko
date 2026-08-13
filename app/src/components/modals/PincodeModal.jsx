import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function PincodeModal({ 
  visible, 
  pincodeInput, 
  setPincodeInput, 
  pincode, 
  checkingPincode, 
  onCheckPincode, 
  onDetectLocation, 
  onClose 
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => { if (pincode) onClose(); }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="location-sharp" size={32} color={Colors.primary} />
          </View>

          <Text style={styles.modalTitle}>Set Delivery Location</Text>
          <Text style={styles.modalDesc}>
            Enter your 6-digit pincode to check instant 15-minute grocery availability from nearby dark stores.
          </Text>
          
          <TextInput 
            placeholder="Enter Pincode (e.g. 122003, 110001)"
            placeholderTextColor="#94a3b8"
            value={pincodeInput}
            onChangeText={setPincodeInput}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.pincodeInput}
          />

          {checkingPincode ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 14 }} />
          ) : (
            <View style={{ gap: 10 }}>
              <TouchableOpacity 
                style={styles.pincodeSubmitBtn}
                onPress={onCheckPincode}
                activeOpacity={0.8}
              >
                <Text style={styles.pincodeSubmitText}>Check Serviceability</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gpsBtn}
                onPress={onDetectLocation}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.gpsBtnText}>Use Current Location (GPS)</Text>
              </TouchableOpacity>
            </View>
          )}

          {pincode ? (
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>
                Supported Demo Pincodes: <Text style={{ fontWeight: '800' }}>122003, 122001, 110017, 110001</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 35, 24, 0.4)', // Warm overlay
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EAD9C7', // Soft border
    shadowColor: '#3A2318',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'stretch',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDEBD9', // primaryLight / Tint
    borderWidth: 1,
    borderColor: '#EAD9C7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3A2318', // textDark
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 12,
    color: '#6E4C3A', // textMuted
    lineHeight: 18,
    marginBottom: 18,
    textAlign: 'center',
  },
  pincodeInput: {
    borderWidth: 1.5,
    borderColor: '#EAD9C7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#3A2318',
    marginBottom: 14,
    textAlign: 'center',
    backgroundColor: '#FDF8F3', // Cream background
  },
  pincodeSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  pincodeSubmitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDEBD9',
    borderWidth: 1.5,
    borderColor: '#EAD9C7',
    paddingVertical: 12,
    borderRadius: 14,
  },
  gpsBtnText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#6E4C3A',
    fontSize: 13,
    fontWeight: '700',
  },
  demoBadge: {
    marginTop: 16,
    backgroundColor: '#FDF8F3',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAD9C7',
  },
  demoBadgeText: {
    fontSize: 10,
    color: '#6E4C3A',
    textAlign: 'center',
    lineHeight: 15,
  },
});
