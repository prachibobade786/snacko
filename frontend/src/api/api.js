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

