import React from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import ProductCard from "./components/catalog/ProductCard";
import LocationSelector from "./components/catalog/LocationSelector";
import CartDrawer from "./components/cart/CartDrawer";
import OrderSuccessModal from "./components/cart/OrderSuccessModal";
import AddressConfirmModal from "./components/cart/AddressConfirmModal";
import RazorpayModal from "./components/cart/RazorpayModal";
import CheckoutPage from "./components/cart/CheckoutPage";
import LoginPage from "./components/auth/LoginPage";
import AdminPanel from "./components/admin/AdminPanel";
import UserProfile from "./components/profile/UserProfile";
import ProductDetails from "./components/catalog/ProductDetails";
import WarehousePortal from "./components/warehouse/WarehousePortal";
import PartnerLoginPage from "./components/auth/PartnerLoginPage";
import AiAssistant from "./components/assistant/AiAssistant";
import { Sparkles } from "lucide-react";

// Import custom hook service layer and context provider
import useAppServices from "./hooks/useAppServices";
import { AppProvider } from "./context/AppContext";

function StorefrontContent() {
  const {
    pincode,
    pincodeInput,
    setPincodeInput,
    resolvedAddress,
    warehouse,
    serviceable,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cart,
    isCartOpen,
    setIsCartOpen,
    orderComplete,
    setOrderComplete,
    showAddressConfirmModal,
    setShowAddressConfirmModal,
    isRazorpayOpen,
    setIsRazorpayOpen,
    completeWebRazorpayPayment,
    executeOrderPlacement,

    user,
    setUser,
    token,
    isLoginOpen,
    setIsLoginOpen,
    email,
    setEmail,
    password,
    setPassword,
    loginError,
    mode,
    setMode,
    adminTab,
    setAdminTab,
    adminWarehouses,
    selectedAdminWH,
    adminPincodes,
    adminInventory,
    newWHName,
    setNewWHName,
    newWHAddress,
    setNewWHAddress,
    newPincode,
    setNewPincode,
    stockEdits,
    loadingAdmin,
    toast,
    filteredProducts,
    showToast,
    formatTimeStr,
    isDeliveryOpen,
    handlePincodeSubmit,
    detectGeoLocation,
    handleLogin,
    handleLogout,
    autoLoginAs,
    addToCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    handleCheckout,
    selectWarehouseForAdmin,
    handleCreateWarehouse,
    handleAddPincode,
    handleRemovePincode,
    handleStockChange,
    handleSaveStock,
    geolocationLoading,
    geolocationMessage
  } = useAppServices();

  if (mode === "login") {
    return <LoginPage />;
  }

  if (mode === "partner-login") {
    return <PartnerLoginPage />;
  }

  if (mode === "admin") {
    return <AdminPanel />;
  }

  if (mode === "warehouse") {
    return <WarehousePortal />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">


      {/* Header bar component */}
      <Header
        pincode={pincode}
        pincodeInput={pincodeInput}
        setPincodeInput={setPincodeInput}
        resolvedAddress={resolvedAddress}
        detectGeoLocation={detectGeoLocation}
        handlePincodeSubmit={handlePincodeSubmit}
        mode={mode}
        setMode={setMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        user={user}
        handleLogout={handleLogout}
        setIsLoginOpen={setIsLoginOpen}
        serviceable={serviceable}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main className="max-w-7xl w-full mx-auto px-6 py-6 flex-grow flex flex-col justify-start">
        {mode === "customer" ? (
          /* CUSTOMER VIEW */
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Location Checking overlay/banner */}
            {!pincode || serviceable === false ? (
              <div className="flex flex-col gap-6">
                <LocationSelector
                  pincode={pincode}
                  pincodeInput={pincodeInput}
                  setPincodeInput={setPincodeInput}
                  serviceable={serviceable}
                  handlePincodeSubmit={handlePincodeSubmit}
                  detectGeoLocation={detectGeoLocation}
                />

                {/* Trending right now section */}
                {filteredProducts.length > 0 && (
                  <section className="section animate-fade-in">
                    <div className="section-head">
                      <div>
                        <h2>Trending right now</h2>
                        <p>Most-ordered snacks in your area this week</p>
                      </div>
                      <a href="#" className="see-all" onClick={(e) => e.preventDefault()}>
                        See all
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}><path d="M5 12h14M13 6l6 6-6 6" stroke="#F5811F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredProducts.slice(0, 10).map((product) => {
                        const cartItem = cart.find(item => item.product.product_id === product.product_id);
                        return (
                          <ProductCard
                            key={product.product_id}
                            product={product}
                            cartItem={cartItem}
                            addToCart={addToCart}
                            updateCartQuantity={updateCartQuantity}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                <ValueStrip />
              </div>
            ) : (
              // Serviceable Location Storefront
              <div className="flex flex-col gap-6">
                {/* Active Warehouse Banner styled as Hero Inner */}
                <div className="hero-inner !p-8 !mb-2 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                  <div className="hero-text !max-w-xl text-left">
                    <span className="eyebrow">
                      Servicing Pincode {pincode} &bull; {isDeliveryOpen() ? "🟢 Delivery Open" : "🔴 Delivery Closed"}
                    </span>
                    <h1 className="text-3xl font-extrabold text-white font-baloo mt-1 mb-1 leading-tight">
                      Crave it. <span className="text-[var(--orange)]">Get it.</span>
                    </h1>
                    <h2 className="text-lg font-bold text-white opacity-95 mb-2">
                      Delivering from {warehouse?.name || "Local Pune Hub"}
                    </h2>
                    <p style={{ color: "#DDC9B8", fontSize: "13px", lineHeight: "1.4" }} className="mb-4">
                      {warehouse?.address || "Maan, Pune, Maharashtra"}
                    </p>
                    
                    <div className="hero-stats flex flex-wrap gap-6 mt-4">
                      <div className="text-left">
                        <strong className="block text-white text-xl font-bold font-baloo">{isDeliveryOpen() ? "15 - 20 Mins" : "Closed"}</strong>
                        <span className="text-[#DDC9B8] text-xs">Est. Delivery</span>
                      </div>
                      {warehouse?.delivery_start_time && (
                        <div className="text-left">
                          <strong className="block text-white text-xl font-bold font-baloo">
                            {formatTimeStr(warehouse.delivery_start_time)} - {formatTimeStr(warehouse.delivery_end_time)}
                          </strong>
                          <span className="text-[#DDC9B8] text-xs">Operational Hours</span>
                        </div>
                      )}
                      <div className="text-left">
                        <strong className="block text-white text-xl font-bold font-baloo">100% Fresh</strong>
                        <span className="text-[#DDC9B8] text-xs">Quality Cravings</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hero-visual w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of an open Snacko delivery box">
                      <ellipse cx="100" cy="176" rx="60" ry="10" fill="#000000" opacity="0.15"></ellipse>
                      <path d="M40 90L100 68L160 90L100 112L40 90Z" fill="#F5811F"></path>
                      <path d="M40 90V150L100 172V112L40 90Z" fill="#D8690F"></path>
                      <path d="M160 90V150L100 172V112L160 90Z" fill="#F5811F"></path>
                      <path d="M62 100C68 108 132 108 138 100" stroke="#FDF8F3" stroke-width="4" stroke-linecap="round"></path>
                      <rect x="72" y="30" width="30" height="46" rx="6" transform="rotate(-8 72 30)" fill="#E8A33D"></rect>
                      <rect x="72" y="30" width="30" height="46" rx="6" transform="rotate(-8 72 30)" fill="#F0B85B" opacity="0.5"></rect>
                      <rect x="108" y="20" width="20" height="52" rx="8" fill="#D85A30"></rect>
                      <rect x="112" y="14" width="12" height="10" rx="2" fill="#8A2E14"></rect>
                      <circle cx="34" cy="52" r="4" fill="#7CB342"></circle>
                      <circle cx="168" cy="58" r="4" fill="#7CB342"></circle>
                    </svg>
                  </div>
                </div>

                {/* Categories & Products Main Layout */}
                <Sidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />

                {/* Right side products grid view */}
                <section className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">
                        {selectedCategory 
                          ? categories.find(c => c.category_id === selectedCategory)?.category_name 
                          : "Popular Snacks & Groceries"}
                      </h3>
                      <span className="text-xs text-slate-500 font-semibold">{filteredProducts.length} items found</span>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                        <p className="text-slate-500 text-sm">No products found in this category.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => {
                          const cartItem = cart.find(item => item.product.product_id === product.product_id);
                          return (
                            <ProductCard
                              key={product.product_id}
                              product={product}
                              cartItem={cartItem}
                              addToCart={addToCart}
                              updateCartQuantity={updateCartQuantity}
                            />
                          );
                        })}
                      </div>
                    )}
                  </section>
                  <ValueStrip />
              </div>
            )}
          </div>
        ) : mode === "product-details" ? (
          /* PRODUCT DETAILS VIEW */
          <ProductDetails />
        ) : mode === "profile" ? (
          /* PROFILE VIEW */
          <UserProfile
            token={token}
            user={user}
            setUser={setUser}
            showToast={showToast}
          />
        ) : mode === "checkout" ? (
          /* CHECKOUT VIEW */
          <CheckoutPage />
        ) : mode === "ai-assistant" ? (
          /* AI ASSISTANT VIEW */
          <AiAssistant />
        ) : null}
      </main>

      {/* Shopping Cart Side Drawer overlay */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateCartQuantity={updateCartQuantity}
        clearCart={clearCart}
        getCartTotal={getCartTotal}
        handleCheckout={handleCheckout}
      />



      {/* Address & Payment Method Confirmation Modal */}
      <AddressConfirmModal 
        isOpen={showAddressConfirmModal} 
        onClose={() => setShowAddressConfirmModal(false)} 
        onConfirmOrder={executeOrderPlacement} 
      />

      {/* Razorpay Payment Gateway Modal */}
      <RazorpayModal 
        isOpen={isRazorpayOpen} 
        onClose={() => setIsRazorpayOpen(false)} 
        totalAmount={getCartTotal() + 15} 
        onPaymentSuccess={completeWebRazorpayPayment} 
      />

      {/* Order Complete Success Modal */}
      <OrderSuccessModal
        isOpen={orderComplete}
        onClose={() => {
          setOrderComplete(false);
          setMode("customer");
        }}
        warehouse={warehouse}
      />

      {/* Footer */}
      <Footer />

      {/* Geolocation Loading Overlay Modal */}
      {geolocationLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-slate-900 backdrop-blur-md rounded-[10px] p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4 text-center border border-slate-800 animate-fade-in">
            
            {/* Radar Pulse Pin Visualizer */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Radar pulsing rings */}
              <div className="absolute inset-0 rounded-full bg-[var(--orange)] opacity-25 animate-ping"></div>
              <div className="absolute inset-4 rounded-full bg-[var(--orange)] opacity-15 animate-pulse"></div>
              
              {/* Glowing map marker box */}
              <div className="w-14 h-14 bg-[var(--orange)] rounded-full flex items-center justify-center shadow-lg relative z-10 border border-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
            
            <div>
              <h3 className="font-extrabold text-white text-xl font-baloo tracking-tight">Locating Cravings</h3>
              <p className="text-slate-400 text-sm font-semibold mt-1 animate-pulse">{geolocationMessage}</p>
            </div>
            
          </div>
        </div>
      )}
      {/* Floating launcher action badge for the AI assistant */}
      {mode !== "ai-assistant" && mode !== "login" && mode !== "partner-login" && mode !== "admin" && mode !== "warehouse" && (
        <div 
          className="floating-assistant-badge"
          onClick={() => setMode("ai-assistant")}
          role="button"
          aria-label="Open AI Shopping Assistant"
        >
          <Sparkles size={16} />
          <span>Ask AI Assistant</span>
          <span className="badge-pulse-glow"></span>
        </div>
      )}

    </div>
  );
}

function ValueStrip() {
  return (
    <section className="section">
      <div className="value-strip">
        <div className="value-item">
          <div className="value-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}><path d="M13 2L4 14h7l-1 8 10-13h-7l1-7z" stroke="#F5811F" strokeWidth="1.8" strokeLinejoin="round"/></svg>
          </div>
          <div><h3>10-minute delivery</h3><p>From our dark store to your door, fast.</p></div>
        </div>
        <div className="value-item">
          <div className="value-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}><path d="M9 12l2 2 4-4" stroke="#7CB342" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#7CB342" strokeWidth="1.8"/></svg>
          </div>
          <div><h3>Freshness guaranteed</h3><p>Every pack checked before it ships.</p></div>
        </div>
        <div className="value-item">
          <div className="value-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}><rect x="3" y="6" width="18" height="13" rx="2" stroke="#F5811F" strokeWidth="1.8"/><path d="M3 10h18" stroke="#F5811F" stroke-width="1.8"/></svg>
          </div>
          <div><h3>Easy payments</h3><p>Cards, UPI or cash on delivery.</p></div>
        </div>
        <div className="value-item">
          <div className="value-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.4 4 6.5 4c2 0 3.6 1.1 4.5 2.6C11.9 5.1 13.5 4 15.5 4c4.1 0 6 4 4.5 7.7C19.5 16.4 12 21 12 21z" stroke="#7CB342" strokeWidth="1.8"/></svg>
          </div>
          <div><h3>Loved by 50k+</h3><p>Rated 4.7 by regular snackers.</p></div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StorefrontContent />
    </AppProvider>
  );
}
