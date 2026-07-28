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

// Import custom hook service layer and context provider
import useAppServices from "./hooks/useAppServices";
import { AppProvider } from "./context/AppContext";

function StorefrontContent() {
  const {
    pincode,
    pincodeInput,
    setPincodeInput,
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
    handlePincodeSubmit,
    detectGeoLocation,
    handleLogin,
    handleLogout,
    autoLoginAs,
    addToCart,
    updateCartQuantity,
    getCartTotal,
    handleCheckout,
    selectWarehouseForAdmin,
    handleCreateWarehouse,
    handleAddPincode,
    handleRemovePincode,
    handleStockChange,
    handleSaveStock
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
      />

      <main className="max-w-7xl w-full mx-auto px-6 py-6 flex-grow flex flex-col justify-start">
        {mode === "customer" ? (
          /* CUSTOMER VIEW */
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Location Checking overlay/banner */}
            {!pincode || serviceable === false ? (
              <LocationSelector
                pincode={pincode}
                pincodeInput={pincodeInput}
                setPincodeInput={setPincodeInput}
                serviceable={serviceable}
                handlePincodeSubmit={handlePincodeSubmit}
                detectGeoLocation={detectGeoLocation}
              />
            ) : (
              // Serviceable Location Storefront
              <div className="flex flex-col gap-6">
                {/* Active Warehouse Banner */}
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <span className="bg-emerald-600/50 text-emerald-100 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Servicing Pincode {pincode}
                    </span>
                    <h2 className="text-xl font-bold mt-2">Delivering from {warehouse?.name || "Local Dark Store"}</h2>
                    <p className="text-emerald-100 text-xs mt-1 opacity-90">{warehouse?.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase text-emerald-200 block font-bold tracking-widest">Est Delivery Time</span>
                    <span className="text-2xl font-black mt-1 block">15 - 20 Mins</span>
                  </div>
                </div>

                {/* Categories & Products Main Layout */}
                <div className="layout-main">
                  {/* Left categories filter sidebar */}
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
                </div>
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
        ) : null}
      </main>

      {/* Shopping Cart Side Drawer overlay */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateCartQuantity={updateCartQuantity}
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

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StorefrontContent />
    </AppProvider>
  );
}
