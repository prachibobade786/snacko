import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function OrderSuccessModal({ visible, onClose, warehouse }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="checkmark-circle" size={56} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Order Confirmed!</Text>
          <Text style={[styles.modalDesc, { textAlign: 'center', marginBottom: 20 }]}>
            Your grocery request has been accepted. Items are being packed at {warehouse?.name || 'Local'} dark store for immediate delivery.
          </Text>

          <TouchableOpacity 
            style={styles.pincodeSubmitBtn}
            onPress={onClose}
          >
            <Text style={styles.pincodeSubmitText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 35, 24, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '85%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAD9C7',
    shadowColor: '#3A2318',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A2318',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 12,
    color: '#6E4C3A',
    lineHeight: 18,
    marginBottom: 16,
  },
  pincodeSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pincodeSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
