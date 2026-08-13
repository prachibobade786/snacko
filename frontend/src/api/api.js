const API_BASE = "http://localhost:5000/api";

const getHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// 1. Customer Catalog / Locations
export const fetchCategories = async (pincode = null, warehouseId = null) => {
  let url = `${API_BASE}/categories`;
  const params = [];
  if (pincode) params.push(`pincode=${pincode}`);
  if (warehouseId) params.push(`warehouse_id=${warehouseId}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  const res = await fetch(url);
  return await res.json();
};

export const fetchProducts = async (pincode = null) => {
  const url = pincode ? `${API_BASE}/products?pincode=${pincode}` : `${API_BASE}/products`;
  const res = await fetch(url);
  return await res.json();
};

export const checkPincodeService = async (pincode) => {
  const res = await fetch(`${API_BASE}/warehouses/check/${pincode}`);
  return await res.json();
};



// 2. Authentication / Profile
export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password })
  });
  return await res.json();
};

export const registerUser = async (name, email, password, mobile) => {
  const res = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password, mobile })
  });
  return await res.json();
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_BASE}/users/forgot-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  return await res.json();
};

export const resetPassword = async (email, code, newPassword) => {
  const res = await fetch(`${API_BASE}/users/reset-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, code, newPassword })
  });
  return await res.json();
};

export const fetchUserProfile = async (token) => {
  const res = await fetch(`${API_BASE}/users/profile`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const updateProfile = async (token, profileData) => {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(profileData)
  });
  return await res.json();
};


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

// 7. Product Ratings & Reviews
export const fetchProductReviews = async (productId, token = null) => {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const createProductReview = async (token, productId, reviewData) => {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(reviewData)
  });
  return await res.json();
};

export const createProduct = async (token, productData) => {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(productData)
  });
  return await res.json();
};

export const createCategory = async (token, categoryData) => {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(categoryData)
  });
  return await res.json();
};

// 8. Coupons
export const fetchCoupons = async (token) => {
  const res = await fetch(`${API_BASE}/coupons`, {
    headers: getHeaders(token)
  });
  return await res.json();
};

export const createCoupon = async (token, couponData) => {
  const res = await fetch(`${API_BASE}/coupons`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(couponData)
  });
  return await res.json();
};

export const updateCoupon = async (token, couponId, couponData) => {
  const res = await fetch(`${API_BASE}/coupons/${couponId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(couponData)
  });
  return await res.json();
};

export const deleteCoupon = async (token, couponId) => {
  const res = await fetch(`${API_BASE}/coupons/${couponId}`, {
    method: "DELETE",
    headers: getHeaders(token)
  });
  return await res.json();
};

export const applyCoupon = async (token, code, totalAmount) => {
  const res = await fetch(`${API_BASE}/coupons/apply`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ code, totalAmount })
  });
  return await res.json();
};

export const updateProductOffer = async (token, productId, discountPrice) => {
  const res = await fetch(`${API_BASE}/products/${productId}/offer`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ discount_price: discountPrice })
  });
  return await res.json();
};
