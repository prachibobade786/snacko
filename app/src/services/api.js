
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
