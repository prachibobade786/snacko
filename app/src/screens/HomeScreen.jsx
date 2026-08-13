// React Native Grocery Store App - Home Screen
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { getInitialApiUrl } from '../services/api';

// Modular Custom Hooks
import { useAuth } from '../hooks/useAuth';
import { useLocationPincode } from '../hooks/useLocationPincode';
import { useCatalog } from '../hooks/useCatalog';
import { useCart } from '../hooks/useCart';
import { useAddressesAndOrders } from '../hooks/useAddressesAndOrders';

// Modular UI Components
import Header from '../components/Header';
import WarehouseBanner from '../components/WarehouseBanner';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import FloatingCart from '../components/FloatingCart';
import Toast from '../components/Toast';
import MobileAiAssistant from '../components/MobileAiAssistant';

// Modular Modals
import PincodeModal from '../components/modals/PincodeModal';
import ProfileModal from '../components/modals/ProfileModal';
import CartModal from '../components/modals/CartModal';
import ConfigModal from '../components/modals/ConfigModal';
import OrderSuccessModal from '../components/modals/OrderSuccessModal';
import AuthModal from '../components/modals/AuthModal';
import AddressConfirmModal from '../components/modals/AddressConfirmModal';
import RazorpayModal from '../components/modals/RazorpayModal';
import ProductDetailsModal from '../components/modals/ProductDetailsModal';

const { width } = Dimensions.get('window');

const DEFAULT_API = getInitialApiUrl();

export default function HomeScreen() {
  // Config & API states
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [tempApi, setTempApi] = useState(DEFAULT_API);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Modular Custom Hooks Integration
  const auth = useAuth(apiBase, showToastMsg);
  const location = useLocationPincode(apiBase, showToastMsg);
  const catalog = useCatalog(apiBase);
  const cartState = useCart(showToastMsg);
  const orderAddrState = useAddressesAndOrders(apiBase, auth.token, showToastMsg);

  // Initial setup: Auto-login, GPS auto-location detection, & catalog fetch
  useEffect(() => {
    requestAnimationFrame(() => {
      auth.autoLogin();
      catalog.fetchCategories();
      catalog.fetchProducts(location.pincode || null);
      location.detectLocation((cleanPincode) => {
        catalog.fetchCategories();
        catalog.fetchProducts(cleanPincode);
      });
    });
  }, [apiBase]);

  // Sync addresses and orders whenever auth token updates
  useEffect(() => {
    if (auth.token) {
      orderAddrState.fetchMobileAddresses();
      orderAddrState.fetchMobileOrders();
    }
  }, [auth.token]);

  // Sync profile details when profile modal mounts
  useEffect(() => {
    if (auth.showProfileModal) {
      requestAnimationFrame(() => {
        if (auth.user) {
          auth.setNameInput(auth.user.name || '');
          auth.setEmailInput(auth.user.email || '');
          auth.setMobileInput(auth.user.mobile || '');
        }
        orderAddrState.fetchMobileAddresses();
        orderAddrState.fetchMobileOrders();
      });
    }
  }, [auth.showProfileModal]);

  const saveApiBase = () => {
    setApiBase(tempApi);
    setShowConfig(false);
    showToastMsg('API URL updated');
  };

  const cardWidth = (width - 40) / 2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <Header 
        pincode={location.pincode}
        resolvedAddress={location.resolvedAddress}
        onOpenPincodeModal={() => location.setShowPincodeModal(true)}
        onOpenProfileModal={auth.handleOpenProfile}
        searchQuery={catalog.searchQuery}
        onSearchChange={catalog.setSearchQuery}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Warehouse Banner */}
        <WarehouseBanner warehouse={location.warehouse} />

        {/* Category Selector */}
        <CategoryList 
          categories={catalog.categories}
          selectedCategory={catalog.selectedCategory}
          onSelectCategory={catalog.setSelectedCategory}
        />

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {catalog.selectedCategory === null 
              ? 'Featured Products' 
              : catalog.categories.find(c => c.category_id === catalog.selectedCategory)?.category_name}
          </Text>

          {catalog.loadingProducts ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
          ) : catalog.filteredProducts.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Ionicons name="alert-circle-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyProductsText}>
                No products available in this area right now.
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {catalog.filteredProducts.map((item) => {
                const cartItem = cartState.cart.find(ci => ci.product.product_id === item.product_id);
                return (
                  <ProductCard 
                    key={item.product_id}
                    item={item}
                    cartItem={cartItem}
                    onAddToCart={(product) => cartState.addToCart(product, location.pincode, location.serviceable)}
                    onUpdateQuantity={cartState.updateCartQuantity}
                    cardWidth={cardWidth}
                    apiBase={apiBase}
                    onPress={() => setSelectedProduct(item)}
                  />
                );
              })}
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      <FloatingCart 
        cart={cartState.cart}
        getCartTotal={cartState.getCartTotal}
        onOpenCart={() => cartState.setIsCartOpen(true)}
      />

      {/* Server Config Gear */}
      <TouchableOpacity 
        style={styles.configGear} 
        onPress={() => {
          setTempApi(apiBase);
          setShowConfig(true);
        }}
      >
        <Ionicons name="settings" size={18} color="#475569" />
      </TouchableOpacity>

      {/* Toast Popup */}
      <Toast message={toast} />

      {/* Modals */}
      <PincodeModal 
        visible={location.showPincodeModal}
        pincodeInput={location.pincodeInput}
        setPincodeInput={location.setPincodeInput}
        pincode={location.pincode}
        checkingPincode={location.checkingPincode}
        onCheckPincode={() => location.checkPincode((p) => {
          catalog.fetchCategories();
          catalog.fetchProducts(p);
        })}
        onDetectLocation={() => location.detectLocation((p) => {
          catalog.fetchCategories();
          catalog.fetchProducts(p);
        })}
        onClose={() => location.setShowPincodeModal(false)}
      />

      <ProfileModal 
        visible={auth.showProfileModal}
        onClose={() => auth.setShowProfileModal(false)}
        activeTab={auth.activeTab}
        setActiveTab={auth.setActiveTab}
        nameInput={auth.nameInput}
        setNameInput={auth.setNameInput}
        emailInput={auth.emailInput}
        setEmailInput={auth.setEmailInput}
        mobileInput={auth.mobileInput}
        setMobileInput={auth.setMobileInput}
        onUpdateProfile={auth.handleUpdateMobileProfile}
        addresses={orderAddrState.addresses}
        onDeleteAddress={orderAddrState.handleDeleteMobileAddress}
        addrLine1={orderAddrState.addrLine1}
        setAddrLine1={orderAddrState.setAddrLine1}
        addrLine2={orderAddrState.addrLine2}
        setAddrLine2={orderAddrState.setAddrLine2}
        addrCity={orderAddrState.addrCity}
        setAddrCity={orderAddrState.setAddrCity}
        addrState={orderAddrState.addrState}
        setAddrState={orderAddrState.setAddrState}
        addrPincode={orderAddrState.addrPincode}
        setAddrPincode={orderAddrState.setAddrPincode}
        onCreateAddress={orderAddrState.handleCreateMobileAddress}
        editingAddressId={orderAddrState.editingAddressId}
        setEditingAddressId={orderAddrState.setEditingAddressId}
        startEditingAddress={orderAddrState.startEditingAddress}
        orders={orderAddrState.orders}
        expandedOrder={orderAddrState.expandedOrder}
        onToggleOrderExpand={orderAddrState.toggleOrderExpand}
        orderItemsMap={orderAddrState.orderItemsMap}
        onCancelOrder={orderAddrState.handleCancelMobileOrder}
        apiBase={apiBase}
        token={auth.token}
        showToastMsg={showToastMsg}
        onLogout={() => auth.handleLogout(
          () => cartState.setCart([]),
          () => orderAddrState.setOrders([]),
          () => orderAddrState.setAddresses([])
        )}
      />

      <CartModal 
        visible={cartState.isCartOpen}
        onClose={() => cartState.setIsCartOpen(false)}
        cart={cartState.cart}
        onUpdateCartQuantity={cartState.updateCartQuantity}
        onClearCart={cartState.clearCart}
        getCartTotal={cartState.getCartTotal}
        pincode={location.pincode}
        warehouse={location.warehouse}
        onCheckout={() => orderAddrState.handleCheckout({
          cart: cartState.cart,
          pincode: location.pincode,
          setIsCartOpen: cartState.setIsCartOpen,
          setShowAuthModal: auth.setShowAuthModal
        })}
        apiBase={apiBase}
      />

      <AuthModal 
        visible={auth.showAuthModal}
        onClose={() => auth.setShowAuthModal(false)}
        apiBase={apiBase}
        onLoginSuccess={auth.handleLoginSuccess}
        showToastMsg={showToastMsg}
      />

      <ConfigModal 
        visible={showConfig}
        onClose={() => setShowConfig(false)}
        tempApi={tempApi}
        setTempApi={setTempApi}
        onSave={saveApiBase}
      />

      <OrderSuccessModal 
        visible={cartState.orderComplete}
        onClose={() => cartState.setOrderComplete(false)}
        warehouse={location.warehouse}
      />

      <AddressConfirmModal 
        visible={orderAddrState.showAddressConfirmModal}
        onClose={() => orderAddrState.setShowAddressConfirmModal(false)}
        addresses={orderAddrState.addresses}
        selectedAddressId={orderAddrState.selectedAddressId}
        setSelectedAddressId={orderAddrState.setSelectedAddressId}
        onConfirmOrder={(targetId, paymentMethod, couponCode, discountAmount) => orderAddrState.executeOrderPlacement({
          targetAddressId: targetId,
          paymentMethod: paymentMethod,
          cart: cartState.cart,
          pincode: location.pincode,
          warehouse: location.warehouse,
          user: auth.user,
          getCartTotal: cartState.getCartTotal,
          setCart: cartState.setCart,
          setIsCartOpen: cartState.setIsCartOpen,
          setOrderComplete: cartState.setOrderComplete,
          fetchProducts: catalog.fetchProducts,
          couponCode: couponCode,
          discountAmount: discountAmount
        })}
        onCreateAddress={orderAddrState.handleCreateMobileAddress}
        totalAmount={cartState.getCartTotal() + 15}
        apiBase={apiBase}
        activePincode={location.pincode}
        token={auth.token}
      />

      <RazorpayModal 
        visible={orderAddrState.showRazorpayModal}
        onClose={() => orderAddrState.setShowRazorpayModal(false)}
        totalAmount={cartState.getCartTotal() + 15}
        onPaymentSuccess={orderAddrState.completeRazorpayPayment}
      />

      <ProductDetailsModal 
        visible={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        cartItem={selectedProduct ? cartState.cart.find(ci => ci.product.product_id === selectedProduct.product_id) : null}
        onAddToCart={(product) => cartState.addToCart(product, location.pincode, location.serviceable)}
        onUpdateQuantity={cartState.updateCartQuantity}
        token={auth.token}
        user={auth.user}
        onOpenAuth={() => auth.setShowAuthModal(true)}
        apiBase={apiBase}
      />
      {/* Floating launcher action button for the AI assistant */}
      <TouchableOpacity 
        style={styles.floatingAssistantBadge} 
        onPress={() => setShowAiAssistant(true)}
      >
        <Ionicons name="sparkles" size={20} color="#ffffff" />
      </TouchableOpacity>

      <MobileAiAssistant
        visible={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        apiBase={apiBase}
        token={auth.token}
        user={auth.user}
        cart={cartState.cart}
        addToCart={cartState.addToCart}
        pincode={location.pincode}
        serviceable={location.serviceable}
        showToastMsg={showToastMsg}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.bgLight, // Cream background
  },
  productsSection: {
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark, // Brown color
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 70,
  },
  emptyProductsText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  configGear: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingAssistantBadge: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3A2318',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
