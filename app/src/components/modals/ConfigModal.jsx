import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

export default function ConfigModal({ visible, onClose, tempApi, setTempApi, onSave }) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>API Server URL Settings</Text>
          <Text style={styles.modalDesc}>
            For local testing with Expo Go, configure the machine&apos;s local IP address (e.g., http://192.168.1.100:5000/api).
          </Text>
          
          <TextInput 
            value={tempApi}
            onChangeText={setTempApi}
            style={styles.pincodeInput}
          />

          <TouchableOpacity 
            style={styles.pincodeSubmitBtn}
            onPress={onSave}
          >
            <Text style={styles.pincodeSubmitText}>Save Configuration</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={onClose}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '85%',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  pincodeInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 12,
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
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});
