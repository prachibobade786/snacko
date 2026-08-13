import React, { useState, useEffect } from "react";
import { User, MapPin, Package, Trash2, Plus, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, Mail, Phone, Calendar, Shield, Pencil, ClipboardList, Truck, Check, Star, Send } from "lucide-react";
import * as api from "../../api/api";
import "./UserProfile.css";

export default function UserProfile({ token, user, setUser, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState("profile"); // 'profile' | 'addresses' | 'orders'
  
  // Profile edit states
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [mobileInput, setMobileInput] = useState(user?.mobile || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [newAddrLine1, setNewAddrLine1] = useState("");
  const [newAddrLine2, setNewAddrLine2] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [newCountry, setNewCountry] = useState("India");
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Orders states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null); // orderId
  const [orderItemsMap, setOrderItemsMap] = useState({}); // { orderId: [items] }
  const [ordersPage, setOrdersPage] = useState(1);

  const ordersPerPage = 10;
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (ordersPage - 1) * ordersPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  const handlePrevPage = () => {
    setOrdersPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setOrdersPage(prev => Math.min(totalPages, prev + 1));
  };

  // Inline order item rating states
  const [reviewingItemId, setReviewingItemId] = useState(null);
  const [itemRatingInput, setItemRatingInput] = useState(5);
  const [itemCommentInput, setItemCommentInput] = useState("");
  const [submittingItemReview, setSubmittingItemReview] = useState(false);
  const [submittedReviewsMap, setSubmittedReviewsMap] = useState({});

  const handleItemReviewSubmit = async (e, productId, itemId) => {
    e.preventDefault();
    setSubmittingItemReview(true);
    try {
      const res = await api.createProductReview(token, productId, {
        rating: itemRatingInput,
        comment: itemCommentInput
      });

      if (res.success) {
        setSubmittedReviewsMap(prev => ({
          ...prev,
          [itemId]: true
        }));
        setReviewingItemId(null);
        setItemCommentInput("");
        setItemRatingInput(5);
        showToast("Review submitted successfully!");
      } else {
        showToast(res.message || "Failed to submit review", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error submitting review", "error");
    } finally {
      setSubmittingItemReview(false);
    }
  };

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setNameInput(user.name || "");
      setEmailInput(user.email || "");
      setMobileInput(user.mobile || "");
    }
  }, [user]);

  // Load addresses when switching to addresses tab
  useEffect(() => {
    if (activeSubTab === "addresses" && token) {
      fetchAddresses();
    } else if (activeSubTab === "orders" && token) {
      fetchOrders();
    }
  }, [activeSubTab]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await api.fetchAddresses(token);
      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch address list", "error");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.fetchOrders(token);
      if (data.success) {
        setOrders(data.data || []);
        setOrdersPage(1);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch orders history", "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItemsMap[orderId]) return; // already loaded
    try {
      const data = await api.fetchOrderItems(token, orderId);
      if (data.success) {
        setOrderItemsMap(prev => ({
          ...prev,
          [orderId]: data.data || []
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await api.updateProfile(token, {
        name: nameInput,
        email: emailInput,
        mobile: mobileInput
      });
      if (data.success) {
        setUser(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
        showToast("Profile details updated successfully!");
      } else {
        showToast(data.message || "Failed to update profile", "error");
      }
    } catch (err) {
      showToast("Error updating profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const startEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setNewAddrLine1(addr.address_line1 || "");
    setNewAddrLine2(addr.address_line2 || "");
    setNewCity(addr.city || "");
    setNewState(addr.state || "");
    setNewPincode(addr.pincode || "");
    setNewCountry(addr.country || "India");

    const formEl = document.getElementById("address-form-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setNewAddrLine1("");
    setNewAddrLine2("");
    setNewCity("");
    setNewState("");
    setNewPincode("");
    setNewCountry("India");
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setAddingAddress(true);
    try {
      const addressData = {
        address_line1: newAddrLine1,
        address_line2: newAddrLine2,
        city: newCity,
        state: newState,
        pincode: newPincode,
        country: newCountry,
        is_default: addresses.find(a => a.id === editingAddressId)?.is_default || (addresses.length === 0 ? 1 : 0)
      };

      let data;
      if (editingAddressId) {
        data = await api.updateAddress(token, editingAddressId, addressData);
      } else {
        data = await api.createAddress(token, addressData);
      }

      if (data.success) {
        showToast(editingAddressId ? "Address updated successfully!" : "Address added!");
        cancelEditAddress();
        fetchAddresses();
      }
    } catch (err) {
      showToast(editingAddressId ? "Failed to update address" : "Failed to add address", "error");
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const data = await api.deleteAddress(token, addressId);
      if (data.success) {
        showToast("Address deleted");
        if (editingAddressId === addressId) {
          cancelEditAddress();
        }
        fetchAddresses();
      }
    } catch (err) {
      showToast("Failed to delete address", "error");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const data = await api.cancelOrder(token, orderId);
      if (data.success) {
        showToast("Order cancelled successfully");
        fetchOrders();
      }
    } catch (err) {
      showToast("Failed to cancel order", "error");
    }
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  return (
    <div className="profile-dashboard-container">
      {/* Side Tabs */}
      <div className="profile-sidebar">
        
        {/* User Card */}
        <div className="profile-user-card">
          <div className="profile-avatar-circle">
            {user?.name?.slice(0, 2) || "JD"}
          </div>
          <div className="profile-user-details">
            <h4>{user?.name || "Customer"}</h4>
            <span>{user?.role === "admin" ? "Administrator" : "Customer"}</span>
          </div>
        </div>

        <button 
          onClick={() => setActiveSubTab("profile")}
          className={`profile-sidebar-tab ${activeSubTab === "profile" ? "active" : ""}`}
        >
          <User size={16} />
          Profile Details
        </button>
        <button 
          onClick={() => setActiveSubTab("addresses")}
          className={`profile-sidebar-tab ${activeSubTab === "addresses" ? "active" : ""}`}
        >
          <MapPin size={16} />
          My Addresses
        </button>
        <button 
          onClick={() => setActiveSubTab("orders")}
          className={`profile-sidebar-tab ${activeSubTab === "orders" ? "active" : ""}`}
        >
          <Package size={16} />
          My Orders
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-grow-1 min-w-0" style={{ flex: "1" }}>
        
        {/* PANEL 1: UPDATE PROFILE DETAILS */}
        {activeSubTab === "profile" && (
          <div className="animate-fade-in">
            <div className="panel-header">
              <h3 className="panel-title">Edit Profile Details</h3>
              <p className="panel-subtitle">Manage your credentials and personal contact settings</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form-grid">
              <div className="input-group-custom">
                <label className="input-label-custom">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="input-field-custom"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div className="input-group-custom">
                <label className="input-label-custom">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="input-field-custom"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>

              <div className="input-group-custom">
                <label className="input-label-custom">Mobile Number</label>
                <input 
                  type="text" 
                  required
                  className="input-field-custom"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={savingProfile}
                className="btn btn-primary mt-2 self-start px-6 rounded-xl flex items-center gap-2"
                style={{ width: "fit-content" }}
              >
                {savingProfile ? <RefreshCw size={14} className="animate-spin" /> : <User size={14} />}
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* PANEL 2: MY ADDRESSES */}
        {activeSubTab === "addresses" && (
          <div className="animate-fade-in">
            <div className="panel-header">
              <h3 className="panel-title">Saved Locations</h3>
              <p className="panel-subtitle">Manage shipping addresses where we deliver your snacks</p>
            </div>

            {loadingAddresses ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-8">
                <RefreshCw size={16} className="animate-spin" /> Fetching address list...
              </div>
            ) : (
              <div className="addresses-grid">
                {addresses.map(addr => (
                  <div key={addr.id} className="address-card-custom">
                    <div>
                      <span className={`address-badge ${addr.is_default ? "default" : "regular"}`}>
                        {addr.is_default ? "Default Hub" : "Alternative"}
                      </span>
                      <p className="address-line-primary">{addr.address_line1}</p>
                      {addr.address_line2 && <p className="address-line-secondary">{addr.address_line2}</p>}
                      <p className="address-city-state">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="address-country">{addr.country}</p>
                    </div>
                    <div className="flex gap-1.5 self-start">
                      <button 
                        onClick={() => startEditAddress(addr)}
                        className="address-delete-btn hover:!bg-orange-50 hover:!text-orange-600"
                        title="Edit address"
                        style={{ border: "none" }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="address-delete-btn"
                        title="Delete address"
                        style={{ border: "none" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {addresses.length === 0 && (
                  <div className="sm:col-span-2 text-center py-12 text-slate-400 italic text-xs bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    No addresses added yet. Create a new shipping location below!
                  </div>
                )}
              </div>
            )}

            {/* Create/Edit Address Form */}
            <div id="address-form-section" className="border-t border-slate-100 pt-6 mt-6">
              <h4 className="font-bold text-slate-800 text-sm mb-4">
                {editingAddressId ? "Edit Address Location" : "Add New Location"}
              </h4>
              <form onSubmit={handleCreateAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div className="sm:col-span-2 input-group-custom">
                  <input 
                    type="text" 
                    placeholder="Address Line 1 (Flat, House No, Building)" 
                    required
                    className="input-field-custom"
                    value={newAddrLine1}
                    onChange={(e) => setNewAddrLine1(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 input-group-custom">
                  <input 
                    type="text" 
                    placeholder="Address Line 2 (Area, Landmark)" 
                    className="input-field-custom"
                    value={newAddrLine2}
                    onChange={(e) => setNewAddrLine2(e.target.value)}
                  />
                </div>
                <div className="input-group-custom">
                  <input 
                    type="text" 
                    placeholder="City" 
                    required
                    className="input-field-custom"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <div className="input-group-custom">
                  <input 
                    type="text" 
                    placeholder="State" 
                    required
                    className="input-field-custom"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                  />
                </div>
                <div className="input-group-custom">
                  <input 
                    type="text" 
                    placeholder="Pincode" 
                    maxLength={6}
                    required
                    className="input-field-custom"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                  />
                </div>
                <div className="input-group-custom">
                  <input 
                    type="text" 
                    placeholder="Country" 
                    required
                    className="input-field-custom"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2 mt-2">
                  <button 
                    type="submit" 
                    disabled={addingAddress}
                    className="btn btn-primary text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 flex-1"
                  >
                    {addingAddress ? <RefreshCw size={14} className="animate-spin" /> : editingAddressId ? <Pencil size={14} /> : <Plus size={14} />}
                    {editingAddressId ? "Update Location Address" : "Add Address Location"}
                  </button>
                  {editingAddressId && (
                    <button 
                      type="button"
                      onClick={cancelEditAddress}
                      className="btn btn-secondary text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 flex-1"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PANEL 3: MY ORDERS */}
        {activeSubTab === "orders" && (
          <div className="animate-fade-in">
            <div className="panel-header">
              <h3 className="panel-title">Order History</h3>
              <p className="panel-subtitle">Track your delivery statuses and past shopping invoices</p>
            </div>

            {loadingOrders ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-8">
                <RefreshCw size={16} className="animate-spin" /> Fetching orders...
              </div>
            ) : (
              <div className="orders-list">
                {paginatedOrders.map(ord => {
                  const isCompleted = ord.status === "completed" || ord.status === "delivered";
                  const isCancelled = ord.status === "cancelled";
                  const isPending = ord.status === "pending";
                  const isProcessing = ord.status === "processing";
                  const isShipped = ord.status === "shipped";
                  
                  let pulseColor = "";
                  if (isPending) pulseColor = "amber";
                  else if (isProcessing) pulseColor = "blue";
                  else if (isCompleted) pulseColor = "emerald";
                  
                  return (
                    <div key={ord.id} className="order-card-custom">
                      {/* Header */}
                      <div className="order-card-header">
                        <div className="order-header-meta">
                          <div className="order-meta-item">
                            <span className="order-meta-label">Order Reference</span>
                            <span className="order-meta-value">#SNK-{ord.id}</span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Placed On</span>
                            <span className="order-meta-value">{new Date(ord.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Paid Amount</span>
                            <span className="order-meta-value price">₹{ord.total_amount}</span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Payment Method</span>
                            <span className="order-meta-value font-bold text-slate-700 flex items-center gap-1">
                              {ord.payment_method === 'RAZORPAY' ? '💳 Razorpay' : '💵 COD'}
                              <span className="text-[10px] font-semibold text-slate-400">({ord.payment_status || 'Pending'})</span>
                            </span>
                          </div>
                        </div>


                        <div className="order-header-actions">
                          <span className={`order-status-badge ${isCompleted ? "completed" : isCancelled ? "cancelled" : "pending"}`}>
                            {pulseColor && <span className={`pulse-dot ${pulseColor}`}></span>}
                            {ord.status}
                          </span>

                          <button 
                            onClick={() => toggleOrderExpand(ord.id)}
                            className="order-toggle-btn"
                            title={expandedOrder === ord.id ? "Hide Details" : "Show Details"}
                            style={{ border: "none" }}
                          >
                            {expandedOrder === ord.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Details Receipt */}
                      {expandedOrder === ord.id && (
                        <div className="order-details-pane">
                          {/* Order Tracking Timeline */}
                          {!isCancelled && (
                            <>
                              <div className="order-tracker-timeline">
                                {/* Step 1: Placed */}
                                <div className={`tracker-step ${
                                  ord.status !== 'cancelled' ? 'completed' : ''
                                }`}>
                                  <div className="tracker-circle">
                                    {ord.status !== 'cancelled' && ord.status !== 'pending' ? <Check size={16} /> : <ClipboardList size={16} />}
                                  </div>
                                  <div className="tracker-label-container">
                                    <span className="tracker-label-title">Placed</span>
                                    <span className="tracker-label-desc">Confirmed</span>
                                  </div>
                                  <div className="tracker-line-connector"></div>
                                </div>

                                {/* Step 2: Processing */}
                                <div className={`tracker-step ${
                                  ['processing', 'shipped', 'delivered'].includes(ord.status) ? 'completed' : 
                                  ord.status === 'pending' ? 'active' : ''
                                }`}>
                                  <div className="tracker-circle">
                                    {['shipped', 'delivered'].includes(ord.status) ? <Check size={16} /> : <Package size={16} />}
                                  </div>
                                  <div className="tracker-label-container">
                                    <span className="tracker-label-title">Packing</span>
                                    <span className="tracker-label-desc">Snacks Prepared</span>
                                  </div>
                                  <div className="tracker-line-connector"></div>
                                </div>

                                {/* Step 3: Out for Delivery */}
                                <div className={`tracker-step ${
                                  ['shipped', 'delivered'].includes(ord.status) ? 'completed' :
                                  ord.status === 'processing' ? 'active' : ''
                                }`}>
                                  <div className="tracker-circle">
                                    {ord.status === 'delivered' ? <Check size={16} /> : <Truck size={16} />}
                                  </div>
                                  <div className="tracker-label-container">
                                    <span className="tracker-label-title">On the Way</span>
                                    <span className="tracker-label-desc">Rider Dispatched</span>
                                  </div>
                                  <div className="tracker-line-connector"></div>
                                </div>

                                {/* Step 4: Delivered */}
                                <div className={`tracker-step ${
                                  ord.status === 'delivered' ? 'completed' :
                                  ord.status === 'shipped' ? 'active' : ''
                                }`}>
                                  <div className="tracker-circle">
                                    {ord.status === 'delivered' ? <Check size={16} /> : <MapPin size={16} />}
                                  </div>
                                  <div className="tracker-label-container">
                                    <span className="tracker-label-title">Delivered</span>
                                    <span className="tracker-label-desc">Snacks Received</span>
                                  </div>
                                </div>
                              </div>

                              {/* Delivery Partner Assigned Banner */}
                              {ord.delivery_partner_name && (
                                <div className="delivery-partner-banner">
                                  <div className="delivery-partner-info">
                                    <div className="delivery-partner-avatar">
                                      {ord.delivery_partner_name.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="delivery-partner-details">
                                      <h5>{ord.delivery_partner_name}</h5>
                                      <p>
                                        🛵 <a href={`tel:${ord.delivery_partner_phone}`} className="delivery-partner-phone-link">{ord.delivery_partner_phone}</a> (Delivery Executive)
                                      </p>
                                    </div>
                                  </div>
                                  <div className="delivery-eta-block">
                                    <span className="delivery-eta-label">Estimated Delivery</span>
                                    <span className="delivery-eta-time">{ord.estimated_delivery_minutes || 15} Mins</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          <div className="receipt-header">Items Billing Summary</div>
                          {!orderItemsMap[ord.id] ? (
                            <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
                              <RefreshCw size={14} className="animate-spin" /> Fetching invoice details...
                            </div>
                          ) : (
                            <div>
                              <div className="receipt-invoice-list">
                                {orderItemsMap[ord.id].map(item => (
                                  <div key={item.id} className="flex flex-col border-b border-slate-100/50 py-2.5 last:border-0">
                                    <div className="receipt-item-row" style={{ border: "none", padding: "0" }}>
                                      <div className="receipt-item-info">
                                        <span className="receipt-item-name">{item.product_name}</span>
                                        <span className="receipt-item-qty">
                                          × {item.quantity}{" "}
                                          <span className="text-slate-400 font-normal">(@ ₹{item.price}/unit)</span>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="receipt-item-subtotal">₹{parseFloat(item.price) * item.quantity}</span>
                                        {item.product_id && (
                                          <button
                                            onClick={() => {
                                              if (reviewingItemId === item.id) {
                                                setReviewingItemId(null);
                                              } else {
                                                setReviewingItemId(item.id);
                                                setItemRatingInput(5);
                                                setItemCommentInput("");
                                              }
                                            }}
                                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/80 px-2 py-1 rounded-md transition-all"
                                            style={{ border: "none", cursor: "pointer" }}
                                          >
                                            {submittedReviewsMap[item.id] ? "Reviewed ✓" : reviewingItemId === item.id ? "Cancel" : "Rate & Review"}
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Inline review form */}
                                    {reviewingItemId === item.id && !submittedReviewsMap[item.id] && (
                                      <form 
                                        onSubmit={(e) => handleItemReviewSubmit(e, item.product_id, item.id)}
                                        className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5 animate-fade-in"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-bold text-slate-600">Your Rating:</span>
                                          <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                              <button
                                                type="button"
                                                key={star}
                                                onClick={() => setItemRatingInput(star)}
                                                className="star-input-btn p-0 bg-transparent border-0 cursor-pointer"
                                              >
                                                <Star
                                                  size={16}
                                                  className={star <= itemRatingInput ? "star-gold filled interactive" : "star-gold interactive"}
                                                />
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={itemCommentInput}
                                            onChange={(e) => setItemCommentInput(e.target.value)}
                                            placeholder="Write a quick comment..."
                                            required
                                            className="input-field-custom flex-grow text-xs py-1.5 px-3 rounded-lg"
                                            style={{ minHeight: "auto" }}
                                          />
                                          <button
                                            type="submit"
                                            disabled={submittingItemReview}
                                            className="btn btn-primary text-xs py-1.5 px-4 rounded-lg flex items-center justify-center gap-1 font-bold"
                                            style={{ width: "fit-content" }}
                                          >
                                            {submittingItemReview ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                                            Submit
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {ord.status === "pending" && (
                                <div className="order-receipt-footer">
                                  <button 
                                    onClick={() => handleCancelOrder(ord.id)}
                                    className="order-cancel-btn"
                                  >
                                    <AlertTriangle size={14} />
                                    Cancel Order
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className="orders-pagination-container">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={ordersPage === 1}
                      className="pagination-arrow-btn"
                    >
                      Previous
                    </button>
                    <span className="pagination-pages-indicator">
                      Page <strong>{ordersPage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <button 
                      onClick={handleNextPage} 
                      disabled={ordersPage === totalPages}
                      className="pagination-arrow-btn"
                    >
                      Next
                    </button>
                  </div>
                )}

                {orders.length === 0 && (
                  <div className="text-center py-12 text-slate-400 italic text-xs bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    No orders placed yet. Check out our catalog and place your first order!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
