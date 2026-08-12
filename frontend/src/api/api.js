// 3. Addresses
export const fetchAddresses = async (token) => {
  const res = await fetch(`${API_BASE}/address`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const createAddress = async (token, addressData) => {
  const res = await fetch(`${API_BASE}/address`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(addressData)
  });
  return await res.json();
};

export const deleteAddress = async (token, addressId) => {
  const res = await fetch(`${API_BASE}/address/${addressId}`, {
    method: "DELETE",
    headers: getHeaders(token)
  });
  return await res.json();
};

export const updateAddress = async (token, addressId, addressData) => {
  const res = await fetch(`${API_BASE}/address/${addressId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(addressData)
  });
  return await res.json();
};


// 4. Orders & Checkout
export const placeOrder = async (token, orderData) => {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(orderData)
  });
  return await res.json();
};

export const createOrderItem = async (token, itemData) => {
  const res = await fetch(`${API_BASE}/order-items`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(itemData)
  });
  return await res.json();
};

export const createPayment = async (token, paymentData) => {
  const res = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(paymentData)
  });
  return await res.json();
};

export const createRazorpayOrder = async (token, orderId, amount) => {
  const res = await fetch(`${API_BASE}/payments/razorpay/create-order`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ order_id: orderId, amount })
  });
  return await res.json();
};

export const verifyRazorpayPayment = async (token, paymentDetails) => {
  const res = await fetch(`${API_BASE}/payments/razorpay/verify`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(paymentDetails)
  });
  return await res.json();
};

export const recordCodPayment = async (token, codData) => {
  const res = await fetch(`${API_BASE}/payments/cod`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(codData)
  });
  return await res.json();
};


export const fetchOrders = async (token) => {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const fetchAiResponse = async (token, text, userId = null) => {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ text, userId })
  });
  return await res.json();
};

export const fetchOrderItems = async (token, orderId) => {
  const res = await fetch(`${API_BASE}/order-items/order/${orderId}`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const cancelOrder = async (token, orderId) => {
  const res = await fetch(`${API_BASE}/orders/cancel/${orderId}`, {
    method: "PATCH",
    headers: getHeaders(token)
  });
  return await res.json();
};

// 5. Admin Warehouses & Stocks
export const fetchAdminWarehouses = async (token) => {
  const res = await fetch(`${API_BASE}/admin/warehouses`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const fetchWarehousePincodes = async (token, whId) => {
  const res = await fetch(`${API_BASE}/admin/warehouses/${whId}/pincodes`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const fetchWarehouseInventory = async (token, whId) => {
  const res = await fetch(`${API_BASE}/admin/warehouses/${whId}/products`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const createWarehouse = async (token, whData) => {
  const res = await fetch(`${API_BASE}/admin/warehouses`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(whData)
  });
  return await res.json();
};

export const updateWarehouse = async (token, whId, whData) => {
  const res = await fetch(`${API_BASE}/admin/warehouses/${whId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(whData)
  });
  return await res.json();
};

export const addPincodeMapping = async (token, whId, pincode) => {
  const res = await fetch(`${API_BASE}/admin/warehouses/${whId}/pincodes`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ pincode })
  });
  return await res.json();
};

export const removePincodeMapping = async (token, whId, pincode) => {
  const res = await fetch(`${API_BASE}/admin/warehouses/${whId}/pincodes/${pincode}`, {
    method: "DELETE",
    headers: getHeaders(token)
  });
  return await res.json();
};

export const updateWarehouseStock = async (token, whId, productId, qty) => {
  const res = await fetch(`${API_BASE}/admin/warehouses/${whId}/products`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ product_id: productId, stock_quantity: qty })
  });
  return await res.json();
};

// 6. Admin Dashboard, Users & Orders APIs
export const fetchAdminDashboardStats = async (token) => {
  const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const fetchAdminUsers = async (token, page = 1, limit = 10, search = "") => {
  const query = `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
  const res = await fetch(`${API_BASE}/admin/users${query}`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const updateUserRole = async (token, userId, role) => {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify({ role })
  });
  return await res.json();
};

export const deleteUser = async (token, userId) => {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: getHeaders(token)
  });
  return await res.json();
};

export const createWarehouseUser = async (token, userData) => {
  const res = await fetch(`${API_BASE}/admin/users/warehouse`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(userData)
  });
  return await res.json();
};

export const fetchAdminOrders = async (token) => {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const updateOrderStatus = async (token, orderId, status, trackingData = {}) => {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify({ status, ...trackingData })
  });
  return await res.json();
};

export const fetchWarehouseOrders = async (token, warehouseId) => {
  const res = await fetch(`${API_BASE}/admin/warehouses/${warehouseId}/orders`, {
    headers: getHeaders(token)
  });
  return await res.json();
};
