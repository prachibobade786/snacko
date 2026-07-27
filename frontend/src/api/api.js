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
