import React, { createContext, useContext, useState, useEffect } from "react";
import * as api from "../api/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Storefront and core states
  const [pincode, setPincode] = useState(localStorage.getItem("pincode") || "");
  const [pincodeInput, setPincodeInput] = useState(pincode);
  const [warehouse, setWarehouse] = useState(null);
  const [serviceable, setServiceable] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Auth state
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Mode state: 'customer', 'admin', or 'profile'
  const [mode, setMode] = useState("customer");
  const [adminTab, setAdminTab] = useState("customer_users");

  // Admin panel states
  const [adminWarehouses, setAdminWarehouses] = useState([]);
  const [selectedAdminWH, setSelectedAdminWH] = useState(null);
  const [adminPincodes, setAdminPincodes] = useState([]);
  const [adminInventory, setAdminInventory] = useState([]);
  const [newWHName, setNewWHName] = useState("");
  const [newWHAddress, setNewWHAddress] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [stockEdits, setStockEdits] = useState({}); // { product_id: quantity }
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // New Admin Portal States
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [adminUserPage, setAdminUserPage] = useState(1);
  const [adminUserTotal, setAdminUserTotal] = useState(0);

  // Warehouse Portal States
  const [warehouseOrders, setWarehouseOrders] = useState([]);
  const [warehouseOrdersLoading, setWarehouseOrdersLoading] = useState(false);

  // App alerts
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    // No-op: Removed all toast notifications per user request
  };

  // 1. Initial Load: fetch categories & check pincode if saved
  useEffect(() => {
    fetchCategories(pincode);
    if (pincode) {
      checkPincodeService(pincode);
    } else {
      fetchProducts(); // Load all general products if no pincode is set
    }
  }, [pincode]);

  const fetchCategories = async (currPincode = null, warehouseId = null) => {
    try {
      const data = await api.fetchCategories(currPincode, warehouseId);
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProducts = async (currPincode = null) => {
    try {
      const data = await api.fetchProducts(currPincode);
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setProducts([]);
        showToast(data.message || "Failed to load products for this pincode", "error");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const checkPincodeService = async (pin) => {
    if (!pin) return;
    setCheckingPincode(true);
    try {
      const data = await api.checkPincodeService(pin);
      if (data.success) {
        setWarehouse(data.warehouse);
        setServiceable(true);
        localStorage.setItem("pincode", pin);
        fetchProducts(pin);
      } else {
        setWarehouse(null);
        setServiceable(false);
        setProducts([]);
        showToast("Service unavailable in this pincode", "error");
      }
    } catch (err) {
      console.error("Error checking pincode:", err);
      setWarehouse(null);
      setServiceable(false);
      setProducts([]);
    } finally {
      setCheckingPincode(false);
    }
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (pincodeInput.trim()) {
      setPincode(pincodeInput.trim());
    }
  };

  const detectGeoLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    showToast("Requesting GPS coordinates...", "info");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
              "User-Agent": "SnackoLocationApp/1.0"
            }
          });
          const data = await res.json();
          if (data && data.address && data.address.postcode) {
            const cleanPostcode = data.address.postcode.replace(/\s/g, "");
            setPincodeInput(cleanPostcode);
            setPincode(cleanPostcode);
            showToast(`Location resolved: Pincode ${cleanPostcode}!`);
          } else {
            showToast(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Could not resolve postal code.`, "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Reverse geocoding connection failed", "error");
        }
      },
      (error) => {
        console.error(error);
        showToast("Location access denied or unavailable", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auth Operations
  const loginDirectly = async (inputEmail, inputPassword, targetMode = null) => {
    setLoginError("");
    try {
      const data = await api.login(inputEmail, inputPassword);
      if (data.success) {
        const authToken = data.data.token;
        setToken(authToken);
        localStorage.setItem("token", authToken);
        
        const profData = await api.fetchUserProfile(authToken);
        
        if (profData.success) {
          const loggedUser = profData.data;
          setUser(loggedUser);
          localStorage.setItem("user", JSON.stringify(loggedUser));
          setIsLoginOpen(false);
          showToast(`Welcome back, ${loggedUser.name}!`);
          if (loggedUser.role === "admin") {
            if (loggedUser.warehouse_id) {
              setMode("warehouse");
            } else {
              setMode("admin");
            }
            fetchAdminWarehouses(authToken);
          } else {
            setMode("customer");
          }
        }
      } else {
        setLoginError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setLoginError("Connection failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    loginDirectly(email, password);
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMode("customer");
    
    // Clear admin/warehouse states to prevent cross-account pollution
    setAdminWarehouses([]);
    setSelectedAdminWH(null);
    setAdminPincodes([]);
    setAdminInventory([]);
    setAdminUsers([]);
    setAdminOrders([]);
    
    showToast("Logged out successfully");
  };

  const autoLoginAs = async (role) => {
    const defaultEmail = role === "admin" ? "admin@snacko.com" : "john@gmail.com";
    const defaultPassword = role === "admin" ? "admin123" : "user123";
    setEmail(defaultEmail);
    setPassword(defaultPassword);
    loginDirectly(defaultEmail, defaultPassword);
  };

  const handleRegister = async (name, email, password, mobile) => {
    setLoginError("");
    try {
      const data = await api.registerUser(name, email, password, mobile);
      if (data.success) {
        showToast("Registration successful! Logging in...");
        // Auto login after signup
        await loginDirectly(email, password);
        return { success: true };
      } else {
        setLoginError(data.message || "Registration failed");
        return { success: false, message: data.message };
      }
    } catch (err) {
      setLoginError("Connection failed");
      return { success: false, message: "Connection failed" };
    }
  };

  const handleForgotPassword = async (email) => {
    setLoginError("");
    try {
      const data = await api.forgotPassword(email);
      if (data.success) {
        showToast("Verification code generated!");
        return { success: true, code: data.data.code };
      } else {
        setLoginError(data.message || "Failed to generate code");
        return { success: false, message: data.message };
      }
    } catch (err) {
      setLoginError("Connection failed");
      return { success: false, message: "Connection failed" };
    }
  };

  const handleResetPassword = async (email, code, newPassword) => {
    setLoginError("");
    try {
      const data = await api.resetPassword(email, code, newPassword);
      if (data.success) {
        showToast("Password reset successfully! Please sign in.");
        return { success: true };
      } else {
        setLoginError(data.message || "Password reset failed");
        return { success: false, message: data.message };
      }
    } catch (err) {
      setLoginError("Connection failed");
      return { success: false, message: "Connection failed" };
    }
  };

  // Cart operations
  const addToCart = (product) => {
    if (!pincode || !serviceable) {
      showToast("Please enter a valid serviceable pincode first!", "error");
      return;
    }

    // Get live product data from state to get accurate stock
    const liveProd = products.find(p => p.product_id === product.product_id) || product;
    const currentStock = liveProd.stock_quantity;

    if (currentStock <= 0) {
      alert("Item is out of stock in your warehouse");
      return;
    }

    const existing = cart.find(item => item.product.product_id === product.product_id);
    if (existing) {
      if (existing.quantity >= currentStock) {
        alert(`Only ${currentStock} units available at this warehouse`);
        return;
      }
      setCart(cart.map(item => 
        item.product.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product: liveProd, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, change) => {
    const existing = cart.find(item => item.product.product_id === productId);
    if (!existing) return;

    const newQty = existing.quantity + change;
    if (newQty <= 0) {
      setCart(cart.filter(item => item.product.product_id !== productId));
    } else {
      // Get live product data from state to get accurate stock
      const liveProd = products.find(p => p.product_id === productId) || existing.product;
      const maxStock = liveProd.stock_quantity;

      if (newQty > maxStock) {
        alert(`Only ${maxStock} units available in stock`);
        return;
      }
      setCart(cart.map(item => 
        item.product.product_id === productId 
          ? { ...item, quantity: newQty }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const [showAddressConfirmModal, setShowAddressConfirmModal] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  // Web Razorpay Modal states
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [pendingWebCheckoutData, setPendingWebCheckoutData] = useState(null);

  const handleCheckout = async () => {
    if (!token) {
      setMode("login");
      return;
    }

    try {
      const addrRes = await api.fetchAddresses(token);
      let addrs = (addrRes.success && addrRes.data) ? addrRes.data : [];
      if (addrs.length === 0) {
        try {
          await api.createAddress(token, {
            address_line1: 'Flat 402, Sunshine Apts',
            address_line2: 'Sector 45',
            city: 'Gurugram',
            state: 'Haryana',
            pincode: pincode || '122003',
            country: 'India',
            is_default: 1
          });
          const reFetch = await api.fetchAddresses(token);
          if (reFetch.success && reFetch.data) addrs = reFetch.data;
        } catch (e) {}
      }

      setUserAddresses(addrs);
      const defaultAddr = addrs.find(a => a.is_default === 1 || a.is_default === true) || addrs[0];
      setSelectedAddrId(defaultAddr ? defaultAddr.id : null);
      setIsCartOpen(false);
      setMode("checkout");
    } catch (err) {
      console.error("Pre-checkout error:", err);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const executeOrderPlacement = async (paymentMethod = "COD") => {
    setShowAddressConfirmModal(false);

    try {
      const targetAddressId = selectedAddrId || (userAddresses[0] ? userAddresses[0].id : 1);
      const totalAmount = getCartTotal() + 15;

      const orderData = await api.placeOrder(token, {
        address_id: targetAddressId, 
        total_amount: totalAmount,
        pincode: pincode
      });

      if (!orderData.success) {
        alert(orderData.message || "Could not place order. Selected delivery location is unserviceable.");
        return;
      }

      const orderId = orderData.data?.insertId || orderData.order_id || 1;
      
      for (const item of cart) {
        await api.createOrderItem(token, {
          order_id: orderId,
          product_id: item.product.product_id,
          product_name: item.product.product_name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.quantity * item.product.price,
          warehouse_id: warehouse?.warehouse_id || 1
        });
      }

      if (paymentMethod === "COD") {
        try {
          await api.recordCodPayment(token, {
            order_id: orderId,
            user_id: user?.id || 2,
            amount: totalAmount
          });
        } catch (e) {}

        setCart([]);
        setIsCartOpen(false);
        setOrderComplete(true);
        fetchProducts(pincode);
      } else if (paymentMethod === "RAZORPAY") {
        let rzpRes;
        try {
          rzpRes = await api.createRazorpayOrder(token, orderId, totalAmount);
        } catch (err) {
          console.error("Razorpay order creation error:", err);
          alert("Failed to initialize Razorpay payment order on the server.");
          return;
        }

        const key_id = rzpRes.key_id;
        const razorpay_order_id = rzpRes.razorpay_order_id;

        if (!key_id || key_id.startsWith("rzp_test_snacko")) {
          setPendingWebCheckoutData({ orderId, totalAmount, razorpay_order_id });
          setIsRazorpayOpen(true);
          return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert("Razorpay SDK failed to load. Please check your internet connection.");
          return;
        }

        const options = {
          key: key_id,
          amount: rzpRes.amount,
          currency: rzpRes.currency || "INR",
          name: "Snacko",
          description: `Payment for Order #${orderId}`,
          order_id: razorpay_order_id,
          handler: async function (response) {
            try {
              const verifyRes = await api.verifyRazorpayPayment(token, {
                order_id: orderId,
                user_id: user?.id || 2,
                amount: totalAmount,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.success) {
                setCart([]);
                setIsCartOpen(false);
                setOrderComplete(true);
                fetchProducts(pincode);
              } else {
                alert("Payment verification failed: " + (verifyRes.message || "Invalid signature"));
              }
            } catch (verifyErr) {
              console.error("Payment verification request failed:", verifyErr);
              alert("Error verifying payment signature: " + verifyErr.message);
            }
          },
          prefill: {
            name: user?.name || "Customer",
            email: user?.email || "",
            contact: user?.mobile || ""
          },
          theme: {
            color: "#f97316"
          },
          modal: {
            ondismiss: function () {
              console.log("Razorpay Checkout closed by user");
              alert("Payment was cancelled or closed. You can retry placing your order.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Order Placement Error: " + (err.message || "Connection failed"));
    }
  };

  const completeWebRazorpayPayment = async (rzpPayload) => {
    setIsRazorpayOpen(false);
    if (!pendingWebCheckoutData) return;

    try {
      const { orderId, totalAmount, razorpay_order_id } = pendingWebCheckoutData;

      const verifyRes = await api.verifyRazorpayPayment(token, {
        order_id: orderId,
        user_id: user?.id || 2,
        amount: totalAmount,
        razorpay_order_id: razorpay_order_id || ("order_" + Date.now()),
        razorpay_payment_id: rzpPayload?.razorpay_payment_id || ("pay_" + Date.now()),
        razorpay_signature: rzpPayload?.razorpay_signature || "simulated_signature"
      });

      if (verifyRes.success) {
        setCart([]);
        setIsCartOpen(false);
        setOrderComplete(true);
        fetchProducts(pincode);
      } else {
        alert("Mock payment verification failed.");
      }
    } catch (err) {
      console.error("Mock verification error:", err);
      alert("Verification Error: " + (err.message || "Connection failed"));
    } finally {
      setPendingWebCheckoutData(null);
    }
  };



  // ADMIN OPERATIONS
  const fetchAdminWarehouses = async (customToken = null) => {
    const activeToken = customToken || token;
    if (!activeToken) return;
    setLoadingAdmin(true);
    try {
      const data = await api.fetchAdminWarehouses(activeToken);
      if (data.success) {
        const whList = data.data || [];
        setAdminWarehouses(whList);
        
        // Find if user is mapped to a specific warehouse
        const mappedWH = user?.warehouse_id 
          ? whList.find(w => w.warehouse_id === user.warehouse_id)
          : null;

        if (mappedWH) {
          selectWarehouseForAdmin(mappedWH, activeToken);
        } else if (whList.length > 0 && (!selectedAdminWH || !whList.find(w => w.warehouse_id === selectedAdminWH.warehouse_id))) {
          selectWarehouseForAdmin(whList[0], activeToken);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const selectWarehouseForAdmin = async (wh, customToken = null) => {
    const whObj = typeof wh === "object" ? wh : adminWarehouses.find(w => w.warehouse_id === wh);
    const whId = whObj ? whObj.warehouse_id : wh;
    const activeToken = customToken || token;
    setSelectedAdminWH(whObj || wh);
    fetchWarehousePincodes(whId, activeToken);
    fetchWarehouseInventory(whId, activeToken);
    fetchWarehouseOrders(whId, activeToken);
    fetchCategories(null, whId);
  };

  const fetchWarehousePincodes = async (whId, customToken = null) => {
    const activeToken = customToken || token;
    if (!activeToken) return;
    try {
      const data = await api.fetchWarehousePincodes(activeToken, whId);
      if (data.success) {
        setAdminPincodes(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWarehouseInventory = async (whId, customToken = null) => {
    const activeToken = customToken || token;
    if (!activeToken) return;
    try {
      const data = await api.fetchWarehouseInventory(activeToken, whId);
      if (data.success) {
        setAdminInventory(data.data || []);
        setStockEdits({});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWarehouseOrders = async (whId, customToken = null) => {
    const activeToken = customToken || token;
    if (!activeToken || !whId) return;
    setWarehouseOrdersLoading(true);
    try {
      const data = await api.fetchWarehouseOrders(activeToken, whId);
      if (data.success) {
        setWarehouseOrders(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch warehouse orders:", err);
    } finally {
      setWarehouseOrdersLoading(false);
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    if (!newWHName.trim()) return;

    try {
      const data = await api.createWarehouse(token, { name: newWHName, address: newWHAddress });
      if (data.success) {
        showToast("Warehouse created!");
        setNewWHName("");
        setNewWHAddress("");
        fetchAdminWarehouses();
      }
    } catch (err) {
      showToast("Failed to create warehouse", "error");
    }
  };

  const handleAddPincode = async (e) => {
    e.preventDefault();
    if (!newPincode.trim() || !selectedAdminWH) return;
    const whId = selectedAdminWH.warehouse_id || selectedAdminWH;

    try {
      const data = await api.addPincodeMapping(token, whId, newPincode.trim());
      if (data.success) {
        showToast("Pincode mapped successfully!");
        setNewPincode("");
        fetchWarehousePincodes(whId);
      } else {
        showToast(data.message || "Failed to add pincode", "error");
      }
    } catch (err) {
      showToast("Error adding pincode", "error");
    }
  };

  const handleRemovePincode = async (pin) => {
    if (!selectedAdminWH) return;
    const whId = selectedAdminWH.warehouse_id || selectedAdminWH;
    try {
      const data = await api.removePincodeMapping(token, whId, pin);
      if (data.success) {
        showToast("Pincode removed!");
        fetchWarehousePincodes(whId);
      }
    } catch (err) {
      showToast("Failed to delete pincode", "error");
    }
  };

  const handleStockChange = (productId, val) => {
    setStockEdits({
      ...stockEdits,
      [productId]: parseInt(val) || 0
    });
  };

  const handleSaveStock = async () => {
    if (!selectedAdminWH || Object.keys(stockEdits).length === 0) return;
    const whId = selectedAdminWH.warehouse_id || selectedAdminWH;

    showToast("Saving stock changes...", "info");
    try {
      for (const [prodId, qty] of Object.entries(stockEdits)) {
        await api.updateWarehouseStock(token, whId, parseInt(prodId), qty);
      }
      showToast("Inventory updated successfully!");
      fetchWarehouseInventory(whId);
      if (pincode) {
        fetchProducts(pincode);
      }
    } catch (err) {
      showToast("Failed to update stock", "error");
    }
  };

  const fetchAdminDashboardStats = async () => {
    setLoadingAdmin(true);
    try {
      const data = await api.fetchAdminDashboardStats(token);
      if (data.success) {
        setAdminStats(data.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const fetchAdminUsersList = async () => {
    setLoadingAdmin(true);
    try {
      const data = await api.fetchAdminUsers(token, adminUserPage, 10, adminUserSearch);
      if (data.success) {
        const usersData = data.data.users || data.data || [];
        const totalCount = data.data.total || (data.data.users ? data.data.users.length : 0);
        setAdminUsers(usersData);
        setAdminUserTotal(totalCount);
      }
    } catch (err) {
      console.error("Failed to load users list", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const data = await api.updateUserRole(token, userId, newRole);
      if (data.success) {
        fetchAdminUsersList();
        fetchAdminDashboardStats();
      }
    } catch (err) {
      console.error("Failed to update user role", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const data = await api.deleteUser(token, userId);
      if (data.success) {
        fetchAdminUsersList();
        fetchAdminDashboardStats();
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const handleCreateWarehouseUser = async (userData) => {
    try {
      const data = await api.createWarehouseUser(token, userData);
      if (data.success) {
        showToast("Warehouse user created successfully!");
        fetchAdminUsersList();
        return { success: true };
      } else {
        showToast(data.message || "Failed to create warehouse user", "error");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Failed to create warehouse user", err);
      showToast("Failed to create warehouse user", "error");
      return { success: false, message: err.message };
    }
  };

  const fetchAdminOrdersList = async () => {
    setLoadingAdmin(true);
    try {
      const data = await api.fetchAdminOrders(token);
      if (data.success) {
        setAdminOrders(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, trackingData = {}) => {
    try {
      const data = await api.updateOrderStatus(token, orderId, newStatus, trackingData);
      if (data.success) {
        fetchAdminOrdersList();
      }
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  // Trigger admin warehouses load when switching to admin tab or warehouse portal
  useEffect(() => {
    if ((mode === "admin" || mode === "warehouse") && token) {
      fetchAdminWarehouses();
    }
  }, [mode, token]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.product_description && product.product_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <AppContext.Provider value={{
      pincode, setPincode,
      pincodeInput, setPincodeInput,
      warehouse, setWarehouse,
      serviceable, setServiceable,
      checkingPincode, setCheckingPincode,
      categories, setCategories,
      products, setProducts,
      selectedCategory, setSelectedCategory,
      searchQuery, setSearchQuery,
      cart, setCart,
      selectedProduct, setSelectedProduct,
      isCartOpen, setIsCartOpen,
      orderComplete, setOrderComplete,
      user, setUser,
      token, setToken,
      isLoginOpen, setIsLoginOpen,
      email, setEmail,
      password, setPassword,
      loginError, setLoginError,
      mode, setMode,
      adminTab, setAdminTab,
      adminWarehouses, setAdminWarehouses,
      selectedAdminWH, setSelectedAdminWH,
      adminPincodes, setAdminPincodes,
      adminInventory, setAdminInventory,
      newWHName, setNewWHName,
      newWHAddress, setNewWHAddress,
      newPincode, setNewPincode,
      stockEdits, setStockEdits,
      loadingAdmin, setLoadingAdmin,
      toast, setToast,
      filteredProducts,
      showToast,
      handlePincodeSubmit,
      detectGeoLocation,
      handleLogin,
      handleLogout,
      autoLoginAs,
      loginDirectly,
      handleRegister,
      handleForgotPassword,
      handleResetPassword,
      addToCart,
      updateCartQuantity,
      getCartTotal,
      handleCheckout,
      showAddressConfirmModal, setShowAddressConfirmModal,
      isRazorpayOpen, setIsRazorpayOpen,
      completeWebRazorpayPayment,
      userAddresses, setUserAddresses,
      selectedAddrId, setSelectedAddrId,
      executeOrderPlacement,

      fetchProducts,
      fetchCategories,
      selectWarehouseForAdmin,
      handleCreateWarehouse,
      handleAddPincode,
      handleRemovePincode,
      handleStockChange,
      handleSaveStock,
      adminStats, setAdminStats,
      adminUsers, setAdminUsers,
      adminOrders, setAdminOrders,
      adminUserSearch, setAdminUserSearch,
      adminUserPage, setAdminUserPage,
      adminUserTotal,
      fetchAdminDashboardStats,
      fetchAdminUsersList,
      handleUpdateUserRole,
      handleDeleteUser,
      handleCreateWarehouseUser,
      fetchAdminOrdersList,
      handleUpdateOrderStatus,
      fetchAdminWarehouses,
      warehouseOrders, setWarehouseOrders,
      warehouseOrdersLoading, setWarehouseOrdersLoading,
      fetchWarehouseOrders
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
