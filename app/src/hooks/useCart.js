import { useState } from 'react';

export function useCart(showToastMsg) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const addToCart = (product, pincode, serviceable) => {
    if (!pincode || !serviceable) {
      if (showToastMsg) showToastMsg('Please set a valid pincode first!');
      return;
    }

    const currentStock = product.stock_quantity;
    if (currentStock <= 0) {
      if (showToastMsg) showToastMsg('Item is out of stock');
      return;
    }

    const existing = cart.find(item => item.product.product_id === product.product_id);
    if (existing) {
      const allowedLimit = Math.min(4, currentStock);
      if (existing.quantity >= allowedLimit) {
        if (showToastMsg) {
          showToastMsg(existing.quantity >= 4 ? 'Maximum 4 units allowed' : `Only ${currentStock} units available`);
        }
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
    if (showToastMsg) showToastMsg(`${product.product_name} added`);
  };

  const updateCartQuantity = (productId, change) => {
    const existing = cart.find(item => item.product.product_id === productId);
    if (!existing) return;

    const newQty = existing.quantity + change;
    if (newQty <= 0) {
      const nextCart = cart.filter(item => item.product.product_id !== productId);
      setCart(nextCart);
      if (nextCart.length === 0) {
        setIsCartOpen(false);
      }
    } else {
      const maxStock = existing.product.stock_quantity;
      const allowedLimit = Math.min(4, maxStock);
      if (newQty > allowedLimit) {
        if (showToastMsg) {
          showToastMsg(newQty > 4 ? 'Maximum 4 units allowed' : `Only ${maxStock} units left`);
        }
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
    return cart.reduce((sum, item) => {
      const activePrice = (item.product.discount_price !== null && parseFloat(item.product.discount_price) < parseFloat(item.product.price))
        ? parseFloat(item.product.discount_price)
        : parseFloat(item.product.price);
      return sum + (activePrice * item.quantity);
    }, 0);
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
    if (showToastMsg) showToastMsg('Cart cleared');
  };

  return {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    orderComplete,
    setOrderComplete,
    addToCart,
    updateCartQuantity,
    getCartTotal,
    clearCart,
  };
}
