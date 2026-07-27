import React, { useState, useEffect } from "react";
import { MapPin, X, Plus, Check, AlertTriangle, Banknote, CreditCard } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function AddressConfirmModal({ isOpen, onClose, onConfirmOrder }) {
  const { userAddresses, selectedAddrId, setSelectedAddrId, token, getCartTotal, pincode } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "RAZORPAY"
  const [serviceabilityMap, setServiceabilityMap] = useState({});
  const [checkingMap, setCheckingMap] = useState(true);

  // New address states
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState(pincode || "");

  // Check serviceability for all address pincodes when modal opens
  useEffect(() => {
    if (isOpen && userAddresses.length > 0) {
      checkAddressesServiceability();
    }
  }, [isOpen, userAddresses]);

  const checkAddressesServiceability = async () => {
    setCheckingMap(true);
    try {
      const api = await import("../../api/api");
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
      console.error("Error checking serviceability for addresses:", err);
    } finally {
      setCheckingMap(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = getCartTotal() + 15;
  const activeAddress = userAddresses.find(a => a.id === selectedAddrId) || userAddresses[0];
  const isSelectedAddrPincodeMatch = activeAddress && pincode ? String(activeAddress.pincode).trim() === String(pincode).trim() : true;
  const isSelectedAddrServiceable = activeAddress 
    ? (serviceabilityMap[activeAddress.pincode] !== false && isSelectedAddrPincodeMatch) 
    : true;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!line1 || !city || !state || !pin) return;
    try {
      const api = await import("../../api/api");
      const res = await api.createAddress(token, {
        address_line1: line1,
        address_line2: line2,
        city,
        state,
        pincode: pin,
        country: "India",
        is_default: 1
      });
      if (res.success) {
        const addrRes = await api.fetchAddresses(token);
        if (addrRes.success && addrRes.data) {
          const newAddr = addrRes.data.find(a => a.address_line1 === line1) || addrRes.data[addrRes.data.length - 1];
          if (newAddr) setSelectedAddrId(newAddr.id);
        }
        setShowAddForm(false);
        setLine1("");
        setLine2("");
        setCity("");
        setState("");
      }
    } catch (err) {
      console.error("Error adding address:", err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
    >
      {/* Compact Popup Container */}
      <div 
        className="bg-white rounded-2xl w-full max-w-[420px] p-5 shadow-2xl transition-all border border-slate-100 flex flex-col max-h-[85vh]"
        style={{ animation: "modalSlideUp 0.25s ease-out" }}
      >
        {/* Compact Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <MapPin size={18} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Confirm Order & Payment</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Address & Payment Selection List (Scrollable inside max 320px) */}
        <div className="overflow-y-auto pr-1 mb-3 space-y-3 flex-1 max-h-[320px]">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">1. Select Delivery Address</span>
          
          <div className="space-y-2">
            {userAddresses.map((addr, idx) => {
              const isSelected = (selectedAddrId || activeAddress?.id) === addr.id;
              const isPincodeMatch = pincode ? String(addr.pincode).trim() === String(pincode).trim() : true;
              const isServ = serviceabilityMap[addr.pincode] !== false && isPincodeMatch;

              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddrId(addr.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected 
                      ? isServ ? "bg-orange-50/70 border-orange-500" : "bg-red-50/70 border-red-500"
                      : isServ ? "bg-slate-50 border-slate-200 hover:border-slate-300" : "bg-slate-50 border-red-200 hover:border-red-300"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected 
                      ? isServ ? "border-orange-500 bg-orange-500" : "border-red-500 bg-red-500"
                      : "border-slate-300"
                  }`}>
                    {isSelected && <Check size={10} className="text-white stroke-[3]" />}
                  </div>

                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      {idx === 0 ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-700 uppercase">
                          Default
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 uppercase">
                          Saved
                        </span>
                      )}

                      {!checkingMap && (
                        !isPincodeMatch ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 uppercase">
                            Mismatched Pincode
                          </span>
                        ) : isServ ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 uppercase">
                            Serviceable
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 uppercase">
                            Outside Delivery Area
                          </span>
                        )
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 leading-snug">{addr.address_line1}</h4>
                    {addr.address_line2 && <p className="text-slate-500 text-[11px] mt-0.5">{addr.address_line2}</p>}
                    <p className="text-slate-600 font-semibold text-[11px] mt-0.5">
                      {addr.city}, {addr.state} • <span className="font-bold text-slate-900">{addr.pincode}</span>
                    </p>
                  </div>
                </div>
              );
            })}

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-orange-300 bg-orange-50/40 text-orange-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-orange-50 transition-all"
              >
                <Plus size={14} /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddSubmit} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[11px] text-slate-700 uppercase">New Address</span>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="House / Flat No. *"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-orange-500 bg-white"
                />
                <input
                  type="text"
                  placeholder="Street / Area (Optional)"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-orange-500 bg-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City *"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-orange-500 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Pincode *"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-orange-500 bg-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Location
                </button>
              </form>
            )}
          </div>

          {/* Payment Option Selector */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">2. Select Payment Method</span>
            <div className="space-y-2">
              <div 
                onClick={() => setPaymentMethod("COD")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  paymentMethod === "COD" ? "bg-orange-50/70 border-orange-500" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === "COD" ? "border-orange-500 bg-orange-500" : "border-slate-300"
                }`}>
                  {paymentMethod === "COD" && <Check size={10} className="text-white stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Banknote size={15} className="text-orange-500" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Pay with cash or UPI upon delivery</p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod("RAZORPAY")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  paymentMethod === "RAZORPAY" ? "bg-orange-50/70 border-orange-500" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === "RAZORPAY" ? "border-orange-500 bg-orange-500" : "border-slate-300"
                }`}>
                  {paymentMethod === "RAZORPAY" && <Check size={10} className="text-white stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <CreditCard size={15} className="text-emerald-600" />
                    <span>Razorpay Online Payment</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Pay via UPI, Cards, or NetBanking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unserviceable or Mismatched Warning Banner */}
        {!isSelectedAddrServiceable && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-red-500" />
            <span>
              {!isSelectedAddrPincodeMatch ? (
                <>Selected address (pincode: <strong>{activeAddress?.pincode}</strong>) does not match active delivery location (<strong>{pincode}</strong>).</>
              ) : (
                <>Delivery is unavailable for pincode <strong>{activeAddress?.pincode}</strong>. Please select or add a location inside warehouse coverage.</>
              )}
            </span>
          </div>
        )}

        {/* Compact Action Footer & Sleek Button */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={() => onConfirmOrder(paymentMethod)}
            disabled={!isSelectedAddrServiceable}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white text-xs flex items-center justify-between transition-all ${
              isSelectedAddrServiceable 
                ? "bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 active:scale-[0.99]" 
                : "bg-slate-300 cursor-not-allowed opacity-70"
            }`}
          >
            <span>{isSelectedAddrServiceable ? `Pay via ${paymentMethod === "COD" ? "COD" : "Razorpay"} & Place Order` : "Delivery Not Available"}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg font-extrabold text-xs">₹{totalAmount}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


