import React, { useState } from "react";
import { X, ShieldCheck, QrCode, CreditCard, Landmark, CheckCircle, Loader2 } from "lucide-react";
import "./RazorpayModal.css";

export default function RazorpayModal({ isOpen, onClose, totalAmount, onPaymentSuccess }) {
  const [activeTab, setActiveTab] = useState("upi"); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  // Premium Micro-interaction: Detect card brand based on card number prefix
  const getCardBrand = (num) => {
    const cleanNum = num.replace(/\s+/g, "");
    if (cleanNum.startsWith("4")) return "visa";
    if (cleanNum.startsWith("5")) return "mastercard";
    if (cleanNum.startsWith("9") || cleanNum.startsWith("6")) return "rupay";
    return null;
  };

  const currentBrand = getCardBrand(cardNumber);

  // Format card number to add spaces every 4 digits
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formattedValue.slice(0, 19)); // 16 digits + 3 spaces
  };

  // Format expiry MM/YY
  const handleCardExpChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setCardExp(value.slice(0, 5));
  };

  const handlePayNow = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const paymentId = "pay_" + Date.now().toString().slice(-8);
      onPaymentSuccess({
        razorpay_payment_id: paymentId,
        razorpay_signature: "rzp_sig_" + Date.now()
      });
    }, 1800); // 1.8s mock processing animation
  };

  return (
    <div className="rzp-overlay">
      <div className="rzp-card">
        
        {/* Header */}
        <header className="rzp-header">
          <div className="rzp-header-left">
            <div className="rzp-merchant-logo">R</div>
            <div className="rzp-merchant-info">
              <h3>Razorpay Secure Checkout</h3>
              <span className="rzp-security-tag">
                <ShieldCheck size={12} /> SECURED BY RAZORPAY
              </span>
            </div>
          </div>
          <div className="rzp-header-right">
            <span className="rzp-header-amount-label">Amount Payable</span>
            <span className="rzp-header-amount-val">₹{totalAmount}</span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="rzp-close-btn" 
            aria-label="Close Payment Modal"
          >
            <X size={16} />
          </button>
        </header>

        {/* Form Body Layout */}
        <div className="rzp-grid">
          
          {/* Sidebar Navigation */}
          <nav className="rzp-sidebar">
            <button
              type="button"
              onClick={() => setActiveTab("upi")}
              className={`rzp-tab-button ${activeTab === "upi" ? "active" : ""}`}
            >
              <span className="rzp-tab-icon"><QrCode size={16} /></span>
              <span>UPI / QR Code</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab("card")}
              className={`rzp-tab-button ${activeTab === "card" ? "active" : ""}`}
            >
              <span className="rzp-tab-icon"><CreditCard size={16} /></span>
              <span>Cards (Credit/Debit)</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab("netbanking")}
              className={`rzp-tab-button ${activeTab === "netbanking" ? "active" : ""}`}
            >
              <span className="rzp-tab-icon"><Landmark size={16} /></span>
              <span>NetBanking</span>
            </button>
          </nav>

          {/* Form Content Panel */}
          <form onSubmit={handlePayNow} className="rzp-content">
            <div>
              {/* Tab 1: UPI / QR */}
              {activeTab === "upi" && (
                <div className="animate-fade-in">
                  <h4 className="rzp-tab-title">Pay via UPI Apps or QR Code</h4>
                  
                  {/* Interactive QR Code Simulator */}
                  <div className="rzp-qr-layout mb-6">
                    <div className="rzp-qr-box">
                      <div className="rzp-qr-image-placeholder">
                        <QrCode size={56} className="text-slate-800" />
                      </div>
                      <div className="rzp-qr-laser-line"></div>
                    </div>
                    <div className="rzp-qr-info">
                      <h5 className="font-extrabold text-xs text-slate-800">Scan QR to pay</h5>
                      <p className="rzp-qr-instructions">
                        Open Google Pay, PhonePe, Paytm or Bhim App and scan this QR code instantly.
                      </p>
                    </div>
                  </div>

                  <div className="rzp-input-group">
                    <label className="rzp-input-label">Or enter UPI ID / VPA</label>
                    <input
                      type="text"
                      placeholder="e.g. johndoe@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="rzp-input"
                      required={activeTab === "upi" && !upiId}
                    />
                  </div>

                  <div className="rzp-brand-row">
                    {["Google Pay", "PhonePe", "Paytm", "BHIM"].map(app => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId(`user@${app.toLowerCase().replace(" ", "")}`)}
                        className="rzp-brand-badge"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Credit / Debit Cards */}
              {activeTab === "card" && (
                <div className="animate-fade-in">
                  <h4 className="rzp-tab-title">Enter Card Details</h4>
                  
                  <div className="rzp-input-group">
                    <label className="rzp-input-label">Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 8901 2345 6789"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="rzp-input"
                      required={activeTab === "card"}
                    />
                    
                    {/* Premium Card brand highlighting */}
                    <div className="rzp-brand-row">
                      <span className={`rzp-brand-badge ${currentBrand === "visa" ? "active" : ""}`}>Visa</span>
                      <span className={`rzp-brand-badge ${currentBrand === "mastercard" ? "active" : ""}`}>Mastercard</span>
                      <span className={`rzp-brand-badge ${currentBrand === "rupay" ? "active" : ""}`}>RuPay</span>
                    </div>
                  </div>

                  <div className="rzp-grid-2col">
                    <div className="rzp-input-group">
                      <label className="rzp-input-label">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExp}
                        onChange={handleCardExpChange}
                        className="rzp-input"
                        required={activeTab === "card"}
                      />
                    </div>
                    <div className="rzp-input-group">
                      <label className="rzp-input-label">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="rzp-input"
                        required={activeTab === "card"}
                      />
                    </div>
                  </div>

                  <div className="rzp-input-group">
                    <label className="rzp-input-label">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="rzp-input"
                      required={activeTab === "card"}
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: NetBanking */}
              {activeTab === "netbanking" && (
                <div className="animate-fade-in">
                  <h4 className="rzp-tab-title">Popular Indian Banks</h4>
                  
                  <div className="rzp-bank-list">
                    {["HDFC Bank", "ICICI Bank", "SBI Bank", "Axis Bank", "Kotak Bank", "Yes Bank"].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`rzp-bank-option ${selectedBank === bank ? "active" : ""}`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div className="rzp-footer">
              <button
                type="submit"
                disabled={processing}
                className="rzp-submit-btn"
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authorizing transaction...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount}</span>
                  </>
                )}
              </button>
              
              <div className="rzp-secured-info">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>256-bit Secure transaction by Razorpay</span>
              </div>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
