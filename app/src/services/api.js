import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamic API URL detection for Expo Go / Emulator / Physical Device / Web
export const getInitialApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000/api`;
    }
  }
  return Platform.select({
    android: 'http://10.0.2.2:5000/api',
    ios: 'http://localhost:5000/api',
    default: 'http://localhost:5000/api'
  }) || 'http://localhost:5000/api';
};



// ==========================================
// 1. User & Authentication APIs
// ==========================================
export const loginUser = async (apiBase, email, password) => {
  const res = await fetch(`${apiBase}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await res.json();
};

export const registerUser = async (apiBase, userData) => {
  const res = await fetch(`${apiBase}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return await res.json();
};

export const forgotPassword = async (apiBase, email) => {
  const res = await fetch(`${apiBase}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return await res.json();
};

export const resetPassword = async (apiBase, email, otp, newPassword) => {
  const res = await fetch(`${apiBase}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  return await res.json();
};

export const getUserProfile = async (apiBase, token) => {
  const res = await fetch(`${apiBase}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const updateUserProfile = async (apiBase, token, profileData) => {
  const res = await fetch(`${apiBase}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return await res.json();
};

// ==========================================
// 2. Address APIs
// ==========================================
export const getUserAddresses = async (apiBase, token) => {
  const res = await fetch(`${apiBase}/address`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const createUserAddress = async (apiBase, token, addressData) => {
  const res = await fetch(`${apiBase}/address`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(addressData)
  });
  return await res.json();
};

export const deleteUserAddress = async (apiBase, token, addressId) => {
  const res = await fetch(`${apiBase}/address/${addressId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const updateUserAddress = async (apiBase, token, addressId, addressData) => {
  const res = await fetch(`${apiBase}/address/${addressId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(addressData)
  });
  return await res.json();
};


// ==========================================
// 3. Order & Order Items APIs
// ==========================================
export const getUserOrders = async (apiBase, token, page = null, limit = null) => {
  const query = (page && limit) ? `?page=${page}&limit=${limit}` : '';
  const res = await fetch(`${apiBase}/orders${query}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const getOrderItems = async (apiBase, token, orderId) => {
  const res = await fetch(`${apiBase}/order-items/order/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const cancelOrder = async (apiBase, token, orderId) => {
  const res = await fetch(`${apiBase}/orders/cancel/${orderId}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const placeOrder = async (apiBase, token, orderData) => {
  const res = await fetch(`${apiBase}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  return await res.json();
};

export const addOrderItem = async (apiBase, token, itemData) => {
  const res = await fetch(`${apiBase}/order-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(itemData)
  });
  return await res.json();
};

// ==========================================
// 4. Payment APIs
// ==========================================
export const addPayment = async (apiBase, token, paymentData) => {
  const res = await fetch(`${apiBase}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });
  return await res.json();
};

export const createRazorpayOrder = async (apiBase, token, orderId, amount) => {
  const res = await fetch(`${apiBase}/payments/razorpay/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ order_id: orderId, amount })
  });
  return await res.json();
};

export const verifyRazorpayPayment = async (apiBase, token, paymentDetails) => {
  const res = await fetch(`${apiBase}/payments/razorpay/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentDetails)
  });
  return await res.json();
};

export const recordCodPayment = async (apiBase, token, codData) => {
  const res = await fetch(`${apiBase}/payments/cod`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(codData)
  });
  return await res.json();
};


export const getAiResponse = async (apiBase, token, text, userId = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${apiBase}/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, userId })
  });
  return await res.json();
};

// ==========================================
// 5. Catalog & Warehouse APIs
// ==========================================
export const getCategories = async (apiBase) => {
  const res = await fetch(`${apiBase}/categories`);
  return await res.json();
};

export const getProducts = async (apiBase, pincode = null) => {
  const url = pincode
    ? `${apiBase}/products?pincode=${pincode}`
    : `${apiBase}/products`;
  const res = await fetch(url);
  return await res.json();
};

export const checkWarehousePincode = async (apiBase, pincode) => {
  const res = await fetch(`${apiBase}/warehouses/check/${pincode}`);
  return await res.json();
};


// ==========================================
// 6. Ratings & Reviews APIs
// ==========================================
export const getProductReviews = async (apiBase, productId, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${apiBase}/products/${productId}/reviews`, { headers });
  return await res.json();
};

export const addProductReview = async (apiBase, token, productId, reviewData) => {
  const res = await fetch(`${apiBase}/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  return await res.json();
};

export const applyCoupon = async (apiBase, token, code, totalAmount) => {
  const res = await fetch(`${apiBase}/coupons/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code, totalAmount })
  });
  return await res.json();
};

export const getAiResponse = async (apiBase, token, text, userId = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${apiBase}/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, userId })
  });
  return await res.json();
};
