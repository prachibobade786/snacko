import React, { useState, useEffect } from "react";
import { 
  MapPin, Plus, Check, AlertTriangle, Banknote, CreditCard, 
  ChevronLeft, Trash2, Edit3, ShoppingCart, ShieldCheck, 
  ShoppingBag, Loader2 
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import * as api from "../../api/api";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { 
    token, 
    cart, 
    getCartTotal, 
    pincode, 
    warehouse, 
    setMode, 
    userAddresses, 
    setUserAddresses, 
    selectedAddrId, 
    setSelectedAddrId, 
    executeOrderPlacement 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "RAZORPAY"
  const [serviceabilityMap, setServiceabilityMap] = useState({});
  const [checkingMap, setCheckingMap] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Address Forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);

  // Form Fields
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState(pincode || "");

  // Load addresses on mount
  useEffect(() => {
    if (token) {
      fetchAddressesList();
    }
  }, [token]);

  // Check serviceability whenever addresses list changes
  useEffect(() => {
    if (userAddresses.length > 0) {
      checkAddressesServiceability();
    } else {
      setCheckingMap(false);
    }
  }, [userAddresses]);

  const fetchAddressesList = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.fetchAddresses(token);
      let addrs = (res.success && res.data) ? res.data : [];
      setUserAddresses(addrs);

      // Auto-select default or first address if none selected
      if (addrs.length > 0) {
        const hasSelected = addrs.some(a => a.id === selectedAddrId);
        if (!hasSelected) {
          const defaultAddr = addrs.find(a => a.is_default === 1 || a.is_default === true) || addrs[0];
          setSelectedAddrId(defaultAddr.id);
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const checkAddressesServiceability = async () => {
    setCheckingMap(true);
    try {
      const map = {};
      const uniquePincodes = [...new Set(userAddresses.map(a => a.pincode))];
      
      await Promise.all(
        uniquePincodes.map(async (p) => {
          if (!p) return;
          try {
            const res = await api.checkPincodeService(p);
            map[p] = !!(res.success && res.serviceable);
          } catch (e) {
            map[p] = false;
          }
        })
      );
      
      setServiceabilityMap(map);
    } catch (err) {
      console.error("Error checking serviceability:", err);
    } finally {
      setCheckingMap(false);
    }
  };

  const clearForm = () => {
    setLine1("");
    setLine2("");
    setCity("");
    setState("");
    setPin(pincode || "");
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!line1 || !city || !state || !pin) return;

    try {
      const res = await api.createAddress(token, {
        address_line1: line1,
        address_line2: line2,
        city,
        state,
        pincode: pin,
        country: "India",
        is_default: userAddresses.length === 0 ? 1 : 0
      });

      if (res.success) {
        setShowAddForm(false);
        clearForm();
        await fetchAddressesList();
      }
    } catch (err) {
      console.error("Error creating address:", err);
    }
  };

  const handleEditSubmit = async (e, addrId) => {
    e.preventDefault();
    if (!line1 || !city || !state || !pin) return;

    try {
      const res = await api.updateAddress(token, addrId, {
        address_line1: line1,
        address_line2: line2,
        city,
        state,
        pincode: pin,
        country: "India"
      });

      if (res.success) {
        setEditingAddrId(null);
        clearForm();
        await fetchAddressesList();
      }
    } catch (err) {
      console.error("Error updating address:", err);
    }
  };

  const handleDeleteAddress = async (e, addrId) => {
    e.stopPropagation(); // Avoid selecting the card
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await api.deleteAddress(token, addrId);
      if (res.success) {
        // If the deleted address was selected, reset selection
        if (selectedAddrId === addrId) {
          setSelectedAddrId(null);
        }
        await fetchAddressesList();
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const startEdit = (addr) => {
    setEditingAddrId(addr.id);
    setShowAddForm(false);
    setLine1(addr.address_line1);
    setLine2(addr.address_line2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPin(addr.pincode);
  };

  const cancelEdit = () => {
    setEditingAddrId(null);
    clearForm();
  };

  const handlePlaceOrder = async () => {
    if (!activeAddress) return;
    setPlacingOrder(true);
    try {
      await executeOrderPlacement(paymentMethod);
    } catch (err) {
      console.error("Checkout order placement error:", err);
    } finally {
      setPlacingOrder(false);
    }
  };

  const cartTotal = getCartTotal();
  const deliveryFee = 15;
  const grandTotal = cartTotal + deliveryFee;

  const activeAddress = userAddresses.find(a => a.id === selectedAddrId) || userAddresses[0];
  const isSelectedAddrPincodeMatch = activeAddress && pincode ? String(activeAddress.pincode).trim() === String(pincode).trim() : true;
  const isSelectedAddrServiceable = activeAddress 
    ? (serviceabilityMap[activeAddress.pincode] !== false && isSelectedAddrPincodeMatch) 
    : false;

  // Empty Cart View
  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <ShoppingBag size={64} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-slate-800 mb-2">Your Cart is Empty</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            You cannot proceed to checkout without adding products to your shopping cart.
          </p>
          <button 
            onClick={() => setMode("customer")}
            className="btn btn-primary px-8 py-3 rounded-xl font-bold text-xs inline-flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Back to Shop Link */}
      <span onClick={() => setMode("customer")} className="checkout-back-link">
        <ChevronLeft size={16} />
        <span>Return to Storefront</span>
      </span>

      {/* Progress Breadcrumbs */}
      <div className="checkout-progress">
        <div className="progress-step completed">
          <div className="progress-number">✓</div>
          <span>Shopping Cart</span>
        </div>
        <div className="progress-line completed"></div>
        <div className="progress-step active">
          <div className="progress-number">2</div>
          <span>Checkout Details</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <div className="progress-number">3</div>
          <span>Order Complete</span>
        </div>
      </div>

      {/* Checkout Content Grid */}
      <div className="checkout-grid">
        {/* Left Column: Form details */}
        <div className="checkout-main-col">
          
          {/* Address Card Section */}
          <div className="checkout-section-card">
            <h3 className="checkout-section-title">
              <MapPin size={20} className="text-orange-500" />
              <span>1. Shipping & Delivery Address</span>
            </h3>

            {loadingAddresses ? (
              <div className="text-center py-6">
                <Loader2 className="animate-spin text-orange-500 mx-auto mb-2" size={24} />
                <p className="text-xs text-slate-400 font-bold">Loading saved addresses...</p>
              </div>
            ) : (
              <div>
                {userAddresses.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    No saved addresses found. Please add an address to deliver your order.
                  </p>
                ) : (
                  <div className="address-grid">
                    {userAddresses.map((addr, idx) => {
                      const isSelected = selectedAddrId === addr.id;
                      const isPincodeMatch = pincode ? String(addr.pincode).trim() === String(pincode).trim() : true;
                      const isServ = serviceabilityMap[addr.pincode] !== false && isPincodeMatch;
                      
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddrId(addr.id)}
                          className={`address-item-card ${isSelected ? "selected" : ""} ${!isServ ? "unserviceable" : ""}`}
                        >
                          <div>
                            <div className="address-badge-row">
                              {addr.is_default === 1 || idx === 0 ? (
                                <span className="address-badge default">Default</span>
                              ) : (
                                <span className="address-badge saved">Saved</span>
                              )}

                              {!checkingMap && (
                                !isPincodeMatch ? (
                                  <span className="address-badge mismatch">Mismatch Pincode</span>
                                ) : isServ ? (
                                  <span className="address-badge serviceable">Serviceable</span>
                                ) : (
                                  <span className="address-badge unserviceable">Outside Delivery</span>
                                )
                              )}
                            </div>

                            <div className="address-details">
                              <p className="font-extrabold text-slate-900 text-sm mb-1">{addr.address_line1}</p>
                              {addr.address_line2 && <p className="text-slate-500 text-xs">{addr.address_line2}</p>}
                              <p className="text-slate-600 text-xs font-semibold mt-1">
                                {addr.city}, {addr.state} • <span className="font-bold text-slate-900">{addr.pincode}</span>
                              </p>
                            </div>
                          </div>

                          <div className="address-actions">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(addr);
                              }}
                              className="address-action-btn"
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(e, addr.id)}
                              className="address-action-btn delete"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>

                          <div className="address-card-selector">
                            {isSelected && <Check size={12} className="stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Edit inline address form */}
                {editingAddrId && (
                  <form onSubmit={(e) => handleEditSubmit(e, editingAddrId)} className="address-form-box">
                    <h4 className="font-bold text-xs text-slate-800 uppercase mb-4">Edit Address</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="form-input-label">Address Line 1 *</label>
                        <input
                          type="text"
                          required
                          value={line1}
                          onChange={(e) => setLine1(e.target.value)}
                          className="form-input-text"
                          placeholder="House No, Apartment, Suite"
                        />
                      </div>
                      <div>
                        <label className="form-input-label">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={line2}
                          onChange={(e) => setLine2(e.target.value)}
                          className="form-input-text"
                          placeholder="Street, Landmark"
                        />
                      </div>
                      <div className="form-group-grid">
                        <div>
                          <label className="form-input-label">City *</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="form-input-text"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="form-input-label">State *</label>
                          <input
                            type="text"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="form-input-text"
                            placeholder="State"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="form-input-label">Pincode *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className="form-input-text"
                          placeholder="6-digit ZIP code"
                        />
                      </div>
                      <div className="form-actions-row">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="btn btn-outline text-xs rounded-lg py-2 px-4"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-dark text-xs rounded-lg py-2 px-4"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Add new address inline */}
                {!showAddForm && !editingAddrId && (
                  <button
                    onClick={() => {
                      clearForm();
                      setShowAddForm(true);
                    }}
                    className="py-3 px-4 rounded-xl border border-dashed border-orange-300 bg-orange-50/40 text-orange-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-orange-50 transition-all w-full"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                )}

                {showAddForm && (
                  <form onSubmit={handleAddSubmit} className="address-form-box">
                    <h4 className="font-bold text-xs text-slate-800 uppercase mb-4 font-black">Add New Shipping Address</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="form-input-label">Address Line 1 *</label>
                        <input
                          type="text"
                          required
                          value={line1}
                          onChange={(e) => setLine1(e.target.value)}
                          className="form-input-text"
                          placeholder="House No, Apartment, Suite"
                        />
                      </div>
                      <div>
                        <label className="form-input-label">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={line2}
                          onChange={(e) => setLine2(e.target.value)}
                          className="form-input-text"
                          placeholder="Street, Landmark"
                        />
                      </div>
                      <div className="form-group-grid">
                        <div>
                          <label className="form-input-label">City *</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="form-input-text"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="form-input-label">State *</label>
                          <input
                            type="text"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="form-input-text"
                            placeholder="State"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="form-input-label">Pincode *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className="form-input-text"
                          placeholder="6-digit ZIP code"
                        />
                      </div>
                      <div className="form-actions-row">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            clearForm();
                          }}
                          className="btn btn-outline text-xs rounded-lg py-2 px-4"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-dark text-xs rounded-lg py-2 px-4"
                        >
                          Add Address
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Payment Card Section */}
          <div className="checkout-section-card">
            <h3 className="checkout-section-title">
              <CreditCard size={20} className="text-orange-500" />
              <span>2. Choose Payment Method</span>
            </h3>

            <div className="payment-methods-list">
              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`payment-method-card ${paymentMethod === "COD" ? "selected" : ""}`}
              >
                <div className="payment-radio-indicator">
                  {paymentMethod === "COD" && <Check size={10} className="stroke-[3]" />}
                </div>
                <div className="payment-method-content">
                  <div className="payment-method-title">
                    <Banknote size={18} className="text-orange-500" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="payment-method-desc">
                    Pay securely using cash, card, or UPI when your items are delivered to your doorstep.
                  </p>
                </div>
              </div>

              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMethod("RAZORPAY")}
                className={`payment-method-card ${paymentMethod === "RAZORPAY" ? "selected" : ""}`}
              >
                <div className="payment-radio-indicator">
                  {paymentMethod === "RAZORPAY" && <Check size={10} className="stroke-[3]" />}
                </div>
                <div className="payment-method-content">
                  <div className="payment-method-title">
                    <CreditCard size={18} className="text-emerald-600" />
                    <span>Razorpay Secure Online Checkout</span>
                  </div>
                  <p className="payment-method-desc">
                    Pay instantly via Razorpay online portal using UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or Netbanking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order summary and CTA button */}
        <div className="checkout-sidebar-col">
          <div className="order-sidebar-card">
            <h3 className="checkout-section-title mb-4 pb-2 !border-none">
              <ShoppingCart size={18} className="text-slate-800" />
              <span>Your Order</span>
            </h3>

            {/* Products Table */}
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product.product_id} className="order-item-tr">
                    <td className="order-item-info-col">
                      <div className="order-item-image">
                        {item.product.product_image ? (
                          <img 
                            src={item.product.product_image.startsWith("http://") || item.product.product_image.startsWith("https://") ? item.product.product_image : `/${item.product.product_image}`} 
                            alt={item.product.product_name} 
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.style.display = 'none';
                              const emojiMap = {
                                "Coca Cola 250ml": "🥤",
                                "Orange Juice 1L": "🍊",
                                "Potato Chips Classic Salted": "🥔",
                                "Chocolate Cookies": "🍪",
                                "Organic Whole Milk 1L": "🥛",
                                "Sourdough Bread 400g": "🍞"
                              };
                              const emoji = emojiMap[item.product.product_name] || "🍎";
                              e.target.parentNode.innerHTML = `<span>${emoji}</span>`;
                            }}
                          />
                        ) : (
                          <span>🍎</span>
                        )}
                      </div>
                      <div>
                        <p className="order-item-name">{item.product.product_name}</p>
                        <span className="order-item-qty-tag">Qty: {item.quantity}</span>
                      </div>
                    </td>
                    <td className="order-item-price-col">
                      ₹{item.product.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Delivery address details check inside sidebar */}
            {activeAddress ? (
              <div className={`sidebar-shipping-info ${!isSelectedAddrServiceable ? "shipping-info-alert" : ""}`}>
                <div className="shipping-info-title">
                  <MapPin size={12} />
                  <span>Delivery Destination</span>
                </div>
                <p className="shipping-info-text text-xs">
                  {activeAddress.address_line1}, {activeAddress.city} - {activeAddress.pincode}
                </p>
                {!checkingMap && (
                  !isSelectedAddrPincodeMatch ? (
                    <p className="text-[10px] font-bold mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={12} /> Pincode mismatch (Active delivery: {pincode})
                    </p>
                  ) : !isSelectedAddrServiceable ? (
                    <p className="text-[10px] font-bold mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={12} /> Unserviceable location (Out of range)
                    </p>
                  ) : (
                    <p className="text-[10px] font-bold text-emerald-800 mt-1.5 flex items-center gap-1">
                      <Check size={12} className="stroke-[3]" /> Serviceable via {warehouse?.name || "Local Dark Store"}
                    </p>
                  )
                )}
              </div>
            ) : (
              <div className="sidebar-shipping-info shipping-info-alert">
                <div className="shipping-info-title">
                  <AlertTriangle size={12} />
                  <span>No Destination</span>
                </div>
                <p className="shipping-info-text text-xs">Please add/select a delivery address.</p>
              </div>
            )}

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charge</span>
                <span className="font-bold text-emerald-700">₹{deliveryFee}</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!isSelectedAddrServiceable || placingOrder || cart.length === 0}
              className="place-order-btn"
            >
              {placingOrder ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {paymentMethod === "COD" ? (
                    <>
                      <Check size={16} className="stroke-[3]" />
                      <span>Place COD Order</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Proceed to Payment</span>
                    </>
                  )}
                  <span className="place-order-btn-subtext">₹{grandTotal}</span>
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="mt-4 text-[10px] text-slate-400 text-center font-semibold flex items-center justify-center gap-1">
              <ShieldCheck size={12} />
              <span>Payments verified by SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
