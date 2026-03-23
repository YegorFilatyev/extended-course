import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCart, addToCart, removeFromCart, removePosition, clearCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    
    setLoading(true);
    try {
      const response = await getCart();
      if (response.cart_info) {
        setCart(response.cart_info);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        setCart(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [user, authLoading]);

  const addItem = async (productId, productPrice) => {
    if (!user) return false;
    
    try {
      const response = await addToCart(productId, productPrice);
      if (response.message) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeItem = async (productId) => {
    if (!user) return false;
    
    try {
      const response = await removeFromCart(productId);
      if (response.message) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const removeItemCompletely = async (productId) => {
    if (!user) return false;
    
    try {
      const response = await removePosition(productId);
      if (response.message) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing position:', error);
      return false;
    }
  };

  const clearUserCart = async () => {
    if (!user) return false;
    
    try {
      const response = await clearCart();
      if (response.message) {
        setCart(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addItem,
      removeItem,
      removeItemCompletely,
      clearUserCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};