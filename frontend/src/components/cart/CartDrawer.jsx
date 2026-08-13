import React from "react";
import { ShoppingCart, ChevronRight } from "lucide-react";
import "./CartDrawer.css";

export default function CartDrawer({ isOpen, onClose, cart, updateCartQuantity, clearCart, getCartTotal, handleCheckout }) {
  const handlePay = () => {
    onClose();
    if (handleCheckout) {
      handleCheckout();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header-container">
          <div className="flex items-center gap-3">
            <div className="cart-icon-wrapper">
              <ShoppingCart size={20} className="cart-icon-svg" />
              {cart.length > 0 && (
                <span className="cart-badge-indicator">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>

            <div>
              <h3 className="cart-header-title">My Cart</h3>
              <span className="cart-header-subtitle">
                {cart.length === 0 ? "Empty" : `${cart.length} unique item${cart.length > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button 
                onClick={clearCart} 
                className="clear-cart-btn"
                title="Remove all items from cart"
              >
                Clear Cart
              </button>
            )}
            <button onClick={onClose} className="cart-close-btn" aria-label="Close cart">✕</button>
          </div>
        </div>

        {/* REGULAR CART ITEMS VIEW INSIDE DRAWER */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <ShoppingCart size={48} className="mx-auto mb-2 text-slate-200" />
              Your cart is empty
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.product_id} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-sm overflow-hidden p-1">
                  {item.product.product_image ? (
                    <img 
                      src={item.product.product_image.startsWith("http://") || item.product.product_image.startsWith("https://") ? item.product.product_image : `/${item.product.product_image}`} 
                      alt={item.product.product_name} 
                      className="w-full h-full" 
                      style={{ objectFit: "contain" }}
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
                        e.target.parentNode.innerHTML = `<span style="font-size: 20px;">${emoji}</span>`;
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "20px" }}>🍎</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-slate-800 leading-tight">{item.product.product_name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">₹{item.product.price} / unit</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="card-quantity-adjuster">
                      <button 
                        onClick={() => updateCartQuantity(item.product.product_id, -1)}
                        className="card-quantity-btn"
                        style={{ padding: "3px 10px" }}
                      >
                        -
                      </button>
                      <span className="card-quantity-val" style={{ minWidth: "16px", fontSize: "11px" }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.product_id, 1)}
                        className="card-quantity-btn"
                        style={{ padding: "3px 10px" }}
                        disabled={item.quantity >= 4}
                        title={item.quantity >= 4 ? "Maximum 4 units allowed" : ""}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-xs text-slate-800">₹{item.product.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BILL SUMMARY & CHECKOUT ACTIONS (INSIDE DRAWER) */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Bill Summary */}
            <div className="space-y-1 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-emerald-700 font-bold">₹15</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span>₹{getCartTotal() + 15}</span>
              </div>
            </div>

            {/* Direct Pay Button */}
            <button 
              onClick={handlePay}
              className="btn btn-primary w-full py-3.5 rounded-xl flex items-center justify-between font-extrabold text-sm shadow-lg shadow-orange-500/20"
            >
              <span>Proceed to Checkout</span>
              <span className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-lg text-xs">
                ₹{getCartTotal() + 15} <ChevronRight size={14} />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
