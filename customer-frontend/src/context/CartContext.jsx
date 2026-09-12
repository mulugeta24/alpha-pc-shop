import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'guestCart';

const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]); // guest cart: [{ product, quantity }]
  const [cartCount, setCartCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const countItems = (items) => items.reduce((sum, i) => sum + i.quantity, 0);

  // ─── Fetch backend cart (logged in) ────────────────────────────────────────

  const fetchServerCart = useCallback(async () => {
    try {
      setLoadingCart(true);
      const res = await api.get('/cart');
      const items = res.data?.data?.cart?.items || [];
      setCartItems(items);
      setCartCount(countItems(items));
    } catch {
      setCartCount(0);
    } finally {
      setLoadingCart(false);
    }
  }, []);

  // ─── Merge guest cart into backend on login ─────────────────────────────────

  const mergeGuestCart = useCallback(async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    await Promise.allSettled(
      guestItems.map((item) =>
        api.post('/cart', {
          productId: item.product._id || item.product,
          quantity: item.quantity,
        })
      )
    );
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  // ─── Initialise on user change ──────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      mergeGuestCart().then(() => fetchServerCart());
    } else {
      // Load guest cart from localStorage
      const guestItems = getGuestCart();
      setCartItems(guestItems);
      setCartCount(countItems(guestItems));
    }
  }, [user]);

  // ─── Add to cart ────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (user) {
        await api.post('/cart', { productId: product._id, quantity });
        await fetchServerCart();
      } else {
        const guestItems = getGuestCart();
        const existing = guestItems.findIndex(
          (i) => (i.product._id || i.product) === product._id
        );
        if (existing > -1) {
          guestItems[existing].quantity += quantity;
        } else {
          guestItems.push({ product, quantity });
        }
        saveGuestCart(guestItems);
        setCartItems(guestItems);
        setCartCount(countItems(guestItems));
      }
    },
    [user, fetchServerCart]
  );

  // ─── Update quantity ────────────────────────────────────────────────────────

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (user) {
        await api.put(`/cart/${productId}`, { quantity });
        await fetchServerCart();
      } else {
        const guestItems = getGuestCart();
        const idx = guestItems.findIndex(
          (i) => (i.product._id || i.product) === productId
        );
        if (idx > -1) {
          if (quantity <= 0) {
            guestItems.splice(idx, 1);
          } else {
            guestItems[idx].quantity = quantity;
          }
          saveGuestCart(guestItems);
          setCartItems(guestItems);
          setCartCount(countItems(guestItems));
        }
      }
    },
    [user, fetchServerCart]
  );

  // ─── Remove item ────────────────────────────────────────────────────────────

  const removeItem = useCallback(
    async (productId) => {
      if (user) {
        await api.delete(`/cart/${productId}`);
        await fetchServerCart();
      } else {
        const guestItems = getGuestCart().filter(
          (i) => (i.product._id || i.product) !== productId
        );
        saveGuestCart(guestItems);
        setCartItems(guestItems);
        setCartCount(countItems(guestItems));
      }
    },
    [user, fetchServerCart]
  );

  // ─── Clear cart ─────────────────────────────────────────────────────────────

  const clearCart = useCallback(async () => {
    if (user) {
      await api.delete('/cart');
      await fetchServerCart();
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setCartItems([]);
      setCartCount(0);
    }
  }, [user, fetchServerCart]);

  // ─── Expose refreshCart for legacy callers ──────────────────────────────────

  const refreshCart = useCallback(() => {
    if (user) fetchServerCart();
  }, [user, fetchServerCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loadingCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
