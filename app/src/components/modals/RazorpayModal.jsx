import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function RazorpayModal({
  visible,
  onClose,
  totalAmount,
  onPaymentSuccess
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [processing, setProcessing] = useState(false);

  const handlePayNow = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const paymentId = 'pay_' + Date.now().toString().slice(-8);
      onPaymentSuccess({
        razorpay_payment_id: paymentId,
        razorpay_signature: 'rzp_sig_' + Date.now()
      });
    }, 1500);
  };

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
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.rzpBadge}>
                <Text style={styles.rzpBadgeText}>R</Text>
              </View>
              <View>
                <Text style={styles.title}>Razorpay Trusted Checkout</Text>
                <Text style={styles.subtitle}>🔒 256-Bit SSL Encrypted</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Amount Box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Total Amount Payable</Text>
            <Text style={styles.amountValue}>₹{totalAmount}</Text>
          </View>

          {/* Payment Method Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'upi' && styles.tabActive]}
              onPress={() => setActiveTab('upi')}
            >
              <Ionicons name="qr-code-outline" size={16} color={activeTab === 'upi' ? Colors.primary : "#64748b"} />
              <Text style={[styles.tabText, activeTab === 'upi' && styles.tabTextActive]}>UPI / QR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'card' && styles.tabActive]}
              onPress={() => setActiveTab('card')}
            >
              <Ionicons name="card-outline" size={16} color={activeTab === 'card' ? Colors.primary : "#64748b"} />
              <Text style={[styles.tabText, activeTab === 'card' && styles.tabTextActive]}>Cards</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'netbanking' && styles.tabActive]}
              onPress={() => setActiveTab('netbanking')}
            >
              <Ionicons name="business-outline" size={16} color={activeTab === 'netbanking' ? Colors.primary : "#64748b"} />
              <Text style={[styles.tabText, activeTab === 'netbanking' && styles.tabTextActive]}>NetBanking</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            {/* UPI Option */}
            {activeTab === 'upi' && (
              <View style={styles.pane}>
                <Text style={styles.paneTitle}>Fast UPI Payment</Text>
                
                <View style={styles.upiAppsRow}>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(appName => (
                    <TouchableOpacity 
                      key={appName}
                      style={styles.upiAppChip}
                      onPress={() => setUpiId(`user@${appName.toLowerCase().replace(' ', '')}`)}
                    >
                      <Text style={styles.upiAppText}>{appName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  placeholder="Enter UPI ID (e.g. mobile@upi)"
                  placeholderTextColor="#94a3b8"
                  value={upiId}
                  onChangeText={setUpiId}
                  style={styles.input}
                />
              </View>
            )}

            {/* Cards Option */}
            {activeTab === 'card' && (
              <View style={styles.pane}>
                <Text style={styles.paneTitle}>Credit or Debit Card</Text>
                <TextInput
                  placeholder="Card Number (e.g. 4532 •••• •••• 8901)"
                  placeholderTextColor="#94a3b8"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="number-pad"
                  style={styles.input}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    placeholder="MM/YY"
                    placeholderTextColor="#94a3b8"
                    value={cardExp}
                    onChangeText={setCardExp}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TextInput
                    placeholder="CVV"
                    placeholderTextColor="#94a3b8"
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>
                <TextInput
                  placeholder="Cardholder Name"
                  placeholderTextColor="#94a3b8"
                  value={cardName}
                  onChangeText={setCardName}
                  style={styles.input}
                />
              </View>
            )}

            {/* NetBanking Option */}
            {activeTab === 'netbanking' && (
              <View style={styles.pane}>
                <Text style={styles.paneTitle}>Select Bank</Text>
                <View style={styles.banksGrid}>
                  {['HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank', 'Kotak Bank'].map(bank => (
                    <TouchableOpacity
                      key={bank}
                      style={[styles.bankChip, selectedBank === bank && styles.bankChipSelected]}
                      onPress={() => setSelectedBank(bank)}
                    >
                      <Text style={[styles.bankText, selectedBank === bank && styles.bankTextSelected]}>{bank}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payBtn, processing && styles.payBtnDisabled]}
            disabled={processing}
            onPress={handlePayNow}
            activeOpacity={0.85}
          >
            {processing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.payBtnText}>Pay ₹{totalAmount} via Razorpay</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rzpBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0c2340',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rzpBadgeText: {
    color: '#0284c7',
    fontWeight: '900',
    fontSize: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '700',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0284c7',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  pane: {
    gap: 8,
    paddingVertical: 4,
  },
  paneTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  upiAppsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  upiAppChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upiAppText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    backgroundColor: '#ffffff',
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankChip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  bankChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#fff3eb',
  },
  bankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  bankTextSelected: {
    color: Colors.primary,
  },
  payBtn: {
    backgroundColor: '#0c2340',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  payBtnDisabled: {
    opacity: 0.7,
  },
  payBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
});
