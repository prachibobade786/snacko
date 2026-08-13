import React, { createContext, useContext, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children, pincode, serviceable, warehouse, showToast, refreshProducts }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const { token, user, setIsLoginOpen } = useAuth();

  const addToCart = (product) => {
    if (!pincode || !serviceable) {
      showToast("Please enter a valid serviceable pincode first!", "error");
      return;
    }

    const currentStock = product.stock_quantity;
    if (currentStock <= 0) {
      showToast("Item is out of stock in your warehouse", "error");
      return;
    }

    const existing = cart.find(item => item.product.product_id === product.product_id);
    if (existing) {
      if (existing.quantity >= currentStock) {
        showToast(`Only ${currentStock} units available at this warehouse`, "error");
        return;
      }
      setCart(cart.map(item => 
        item.product.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    showToast(`${product.product_name} added to cart`);
  };

  const updateCartQuantity = (productId, change) => {
    const existing = cart.find(item => item.product.product_id === productId);
    if (!existing) return;

    const newQty = existing.quantity + change;
    if (newQty <= 0) {
      setCart(cart.filter(item => item.product.product_id !== productId));
    } else {
      const maxStock = existing.product.stock_quantity;
      if (newQty > maxStock) {
        showToast(`Only ${maxStock} units available in stock`, "error");
        return;
      }
      setCart(cart.map(item => 
        item.product.product_id === productId 
          ? { ...item, quantity: newQty }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!token) {
      setIsLoginOpen(true);
      showToast("Please login to complete your order", "error");
      return;
    }

    try {
      const addrRes = await api.fetchAddresses(token);
      let addressId = null;
      if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
        const defaultAddr = addrRes.data.find(a => a.is_default === 1 || a.is_default === true) || addrRes.data[0];
        addressId = defaultAddr.id;
      }

      if (!addressId) {
        alert("Please add a shipping address in your profile details first!");
        setIsCartOpen(false);
        return;
      }

      const orderData = await api.placeOrder(token, {
        address_id: addressId,
        total_amount: getCartTotal() + 15
      });

      if (orderData.success) {
        const orderId = orderData.order_id;
        
        for (const item of cart) {
          await api.createOrderItem(token, {
            order_id: orderId,
            product_name: item.product.product_name,
            quantity: item.quantity,
            price: item.product.price
          });

          if (warehouse) {
            const newStock = Math.max(0, item.product.stock_quantity - item.quantity);
            await api.updateWarehouseStock(token, warehouse.warehouse_id, item.product.product_id, newStock);
          }
        }

        await api.createPayment(token, {
          order_id: orderId,
          user_id: user.id,
          amount: getCartTotal() + 15,
          payment_method: "Card",
          payment_status: "Completed",
          transaction_id: "TXN_" + Date.now()
        });

        setCart([]);
        setIsCartOpen(false);
        setOrderComplete(true);
        if (refreshProducts) {
          refreshProducts(pincode);
        }
        showToast("Order placed successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast("Checkout failed", "error");
    }
  };

  return (
    <CartContext.Provider value={{
      cart, setCart,
      isCartOpen, setIsCartOpen,
      orderComplete, setOrderComplete,
      addToCart,
      updateCartQuantity,
      getCartTotal,
      handleCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
