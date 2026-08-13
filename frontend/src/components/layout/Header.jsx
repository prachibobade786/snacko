import React from "react";
import { MapPin, Search, ShoppingCart, User, Settings, Building, LogOut, Compass, Heart, Sparkles } from "lucide-react";
import logoImg from "../../assets/snackologo.png";
import "./Header.css";

export default function Header({
  pincode,
  pincodeInput,
  setPincodeInput,
  resolvedAddress,
  detectGeoLocation,
  handlePincodeSubmit,
  mode,
  setMode,
  searchQuery,
  setSearchQuery,
  cart,
  setIsCartOpen,
  user,
  handleLogout,
  setIsLoginOpen,
  serviceable,
  categories = [],
  selectedCategory = null,
  setSelectedCategory = () => { }
}) {
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="storefront-header">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div
            className="cursor-pointer logo-mark"
            onClick={() => { setMode("customer"); }}
            aria-label="Snacko home"
          >
            <img src={logoImg} alt="Snacko" className="box-icon" style={{ height: "34px", width: "auto", objectFit: "contain" }} />
          </div>

          {/* Pincode selector styled as delivery pill */}
          <form
            onSubmit={handlePincodeSubmit}
            className="delivery-pill"
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <span className="label">Delivering to</span>
            <span className="value">
              <input
                type="text"
                placeholder="Enter pincode..."
                className="header-pincode-input"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
              />
              <button
                type="button"
                onClick={detectGeoLocation}
                className="header-location-btn"
                title="Detect current location"
              >
                <Compass size={24} />
              </button>
              <button type="submit" style={{ display: "none" }}></button>
            </span>
            {resolvedAddress && (
              <span
                className="text-[9px] text-slate-500 font-bold truncate max-w-[140px] block leading-none pt-1"
                title={resolvedAddress}
              >
                {resolvedAddress}
              </span>
            )}
          </form>
        </div>

        {/* Search bar */}
        {mode === "customer" && (
          <div className="search-wrap">
            <div className="search-box">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#B08A6B" stroke-width="2"></circle><path d="M21 21L16.65 16.65" stroke="#B08A6B" stroke-width="2" stroke-linecap="round"></path></svg>
              <input
                type="text"
                placeholder="Search for chips, cola, chocolate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="header-actions">
          {user?.role === "admin" && (
            <div className="flex gap-2">
              {!user.warehouse_id ? (
                <button
                  onClick={() => setMode(mode === "admin" ? "customer" : "admin")}
                  className={`btn text-sm ${mode === "admin" ? "btn-dark" : "btn-secondary"}`}
                >
                  <Settings size={16} />
                  <span>{mode === "admin" ? "Storefront" : "Admin Panel"}</span>
                </button>
              ) : (
                <button
                  onClick={() => setMode(mode === "warehouse" ? "customer" : "warehouse")}
                  className={`btn text-sm ${mode === "warehouse" ? "btn-dark" : "btn-primary"}`}
                >
                  <Building size={16} />
                  <span>{mode === "warehouse" ? "Storefront" : "Warehouse Portal"}</span>
                </button>
              )}
            </div>
          )}

          {(mode === "customer" || mode === "ai-assistant") && (
            <>
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="icon-btn"
                aria-label={`Cart, ${cartItemCount} items`}
                style={{ border: "none" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.4 12.4a2 2 0 002 1.6h7.6a2 2 0 002-1.6L21 8H6" stroke="#F5811F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="10" cy="21" r="1.4" fill="#F5811F"></circle><circle cx="17" cy="21" r="1.4" fill="#F5811F"></circle></svg>
                {cartItemCount > 0 && (
                  <span className="badge">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode(mode === "profile" ? "customer" : "profile")}
                className={`btn !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 ${mode === "profile" ? "btn-dark" : "btn-secondary"
                  }`}
              >
                <User size={14} />
                <span className="hidden sm:inline">{user.name}</span>
              </button>
              <button onClick={handleLogout} className="btn btn-secondary !p-2 rounded-full" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMode("login")}
              className="cta-login"
            >
              Log in
            </button>
          )}
        </div>
      </div>

      {/* Category chip strip */}
      {mode === "customer" && pincode && serviceable !== false && categories.length > 0 && (
        <nav className="cat-strip" aria-label="Categories">
          <div className="max-w-7xl mx-auto flex gap-2.5 overflow-x-auto py-2 scrollbar-none">
            <button
              className={`cat-chip ${selectedCategory === null ? "active" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.category_id}
                className={`cat-chip ${selectedCategory === cat.category_id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.category_id)}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
