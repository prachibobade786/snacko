import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { loginUser, registerUser, forgotPassword, resetPassword } from '../../services/api';
import logoImg from '../../../assets/images/snackologo.png';

export default function AuthModal({
  visible,
  onClose,
  apiBase,
  onLoginSuccess,
  showToastMsg
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMobile, setRegMobile] = useState('');

  // Forgot Password Form States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: send code, 2: reset password
  const [otpInput, setOtpInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');

  const handleLoginSubmit = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await loginUser(apiBase, loginEmail.trim(), loginPassword.trim());
      if (data.success && data.data?.token) {
        if (showToastMsg) showToastMsg('Welcome back! Logged in successfully.');
        onLoginSuccess(data.data.token, data.data);
        onClose();
      } else {
        setErrorMsg(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMsg('Network error. Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in name, email, and password');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await registerUser(apiBase, {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        mobile: regMobile.trim()
      });

      if (data.success) {
        if (showToastMsg) showToastMsg('Account created! Logging you in...');
        const loginData = await loginUser(apiBase, regEmail.trim(), regPassword.trim());
        if (loginData.success && loginData.data?.token) {
          onLoginSuccess(loginData.data.token, loginData.data);
          onClose();
        } else {
          setAuthMode('login');
          setLoginEmail(regEmail);
        }
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Server connection failed during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await forgotPassword(apiBase, forgotEmail.trim());
      if (data.success) {
        if (showToastMsg) showToastMsg('Verification code sent to your email!');
        setForgotStep(2);
      } else {
        setErrorMsg(data.message || 'Failed to send verification code');
      }
    } catch (err) {
      setErrorMsg('Network error. Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    if (!otpInput.trim() || !newPassInput.trim()) {
      setErrorMsg('Please enter the verification code and new password');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await resetPassword(apiBase, forgotEmail.trim(), otpInput.trim(), newPassInput.trim());
      if (data.success) {
        if (showToastMsg) showToastMsg('Password reset successful! Please sign in.');
        setAuthMode('login');
        setLoginEmail(forgotEmail);
        setForgotStep(1);
        setForgotEmail('');
        setOtpInput('');
        setNewPassInput('');
      } else {
        setErrorMsg(data.message || 'Password reset failed. Invalid code.');
      }
    } catch (err) {
      setErrorMsg('Network error. Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBadge}>
            <Image
              source={logoImg}
              style={{ width: 140, height: 140, resizeMode: 'contain' }}
            />
          </View>
          <Text style={styles.welcomeTitle}>
            {authMode === 'login' && 'Welcome Back!'}
            {authMode === 'register' && 'Create New Account'}
            {authMode === 'forgot' && 'Reset Password'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {authMode === 'login' && 'Sign in to access your orders & saved addresses'}
            {authMode === 'register' && 'Sign up to place 15-minute grocery orders'}
            {authMode === 'forgot' && (forgotStep === 1 ? 'Enter your registered email address to receive a verification code' : 'Check your inbox for the 6-digit verification code')}
          </Text>

          {/* Mode Switcher Pills */}
          {authMode !== 'forgot' && (
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
                onPress={() => { setAuthMode('login'); setErrorMsg(''); }}
              >
                <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
                onPress={() => { setAuthMode('register'); setErrorMsg(''); }}
              >
                <Text style={[styles.tabText, authMode === 'register' && styles.tabTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Feedback */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  placeholder="e.g. john@gmail.com"
                  placeholderTextColor="#94a3b8"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                onPress={() => { setAuthMode('forgot'); setForgotStep(1); setErrorMsg(''); }}
                style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 8 }}
              >
                <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: '700' }}>Forgot Password?</Text>
              </TouchableOpacity>

              {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 14 }} />
              ) : (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleLoginSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* REGISTER FORM */}
          {authMode === 'register' && (
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#94a3b8"
                  value={regName}
                  onChangeText={setRegName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  placeholder="e.g. john@gmail.com"
                  placeholderTextColor="#94a3b8"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  placeholder="Create password"
                  placeholderTextColor="#94a3b8"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Mobile Number (Optional)</Text>
                <TextInput
                  placeholder="10-digit mobile"
                  placeholderTextColor="#94a3b8"
                  value={regMobile}
                  onChangeText={setRegMobile}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>

              {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 14 }} />
              ) : (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleRegisterSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <View style={styles.formContainer}>
              {forgotStep === 1 ? (
                // Step 1: Request Reset OTP Email
                <View style={{ gap: 12 }}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      placeholder="e.g. john@gmail.com"
                      placeholderTextColor="#94a3b8"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>

                  {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 14 }} />
                  ) : (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={handleForgotSubmit}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                // Step 2: Validate Reset Code & Save Password
                <View style={{ gap: 12 }}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      value={forgotEmail}
                      editable={false}
                      style={[styles.input, { color: '#64748b', backgroundColor: '#f1f5f9' }]}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Verification Code</Text>
                    <TextInput
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#94a3b8"
                      value={otpInput}
                      onChangeText={setOtpInput}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <TextInput
                      placeholder="Enter new password"
                      placeholderTextColor="#94a3b8"
                      value={newPassInput}
                      onChangeText={setNewPassInput}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>

                  {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 14 }} />
                  ) : (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={handleResetSubmit}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryBtnText}>Reset Password</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={() => { setAuthMode('login'); setForgotStep(1); setErrorMsg(''); }}
                style={{ alignSelf: 'center', marginTop: 16 }}
              >
                <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '800' }}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoBadge: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 4,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '600',
    flex: 1,
  },
  formContainer: {
    gap: 12,
  },
  inputWrapper: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },
});
