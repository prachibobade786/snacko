import React from "react";
import { MapPin, Search, ShoppingCart, User, Settings, Building, LogOut, Compass } from "lucide-react";
import logoImg from "../../assets/snackologo.png";
import "./Header.css";

export default function Header({
  pincode,
  pincodeInput,
  setPincodeInput,
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
  serviceable
}) {
  return (
    <header className="storefront-header">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div 
            className="cursor-pointer flex items-center" 
            onClick={() => { setMode("customer"); }}
          >
            <img src={logoImg} alt="Snacko" style={{ height: "42px", objectFit: "contain" }} />
          </div>

          {/* Pincode selector */}
          <form 
            onSubmit={handlePincodeSubmit} 
            className="header-pincode-form"
          >
            <MapPin size={18} className="header-pincode-icon" />
            <input 
              type="text" 
              placeholder="Enter pincode (e.g. 122003)" 
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
              <Compass size={16} />
            </button>
            <button type="submit" className="btn btn-primary text-xs !py-1 !px-3 rounded-full pulsing-btn">
              Set
            </button>
          </form>
        </div>

        {/* Search bar */}
        {mode === "customer" && (
          <div className="header-search-bar">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search soft drinks, chips, bread..." 
              className="header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <div className="flex gap-2">
              <button 
                onClick={() => setMode(mode === "admin" ? "customer" : "admin")} 
                className={`btn text-sm ${mode === "admin" ? "btn-dark" : "btn-outline"}`}
              >
                <Settings size={16} />
                <span>{mode === "admin" ? "Storefront" : "Admin Panel"}</span>
              </button>
              <button 
                onClick={() => setMode(mode === "warehouse" ? "customer" : "warehouse")} 
                className={`btn text-sm ${mode === "warehouse" ? "btn-dark" : "btn-yellow"}`}
              >
                <Building size={16} />
                <span>{mode === "warehouse" ? "Storefront" : "Warehouse Portal"}</span>
              </button>
            </div>
          )}

          {mode === "customer" && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn btn-yellow relative !py-2 !px-4"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="header-cart-badge">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMode(mode === "profile" ? "customer" : "profile")}
                className={`btn !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 ${
                  mode === "profile" ? "btn-dark" : "btn-secondary"
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
              className="btn btn-primary !py-2 !px-4"
            >
              <User size={18} />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
