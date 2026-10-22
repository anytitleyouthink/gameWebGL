import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartSummaryDto } from '../types';
import { cartApi } from '../api/services';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartSummaryDto | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (maHh: number, soLuong?: number) => Promise<boolean>;
  updateQuantity: (maHh: number, delta: number) => Promise<boolean>;
  removeItem: (id: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartSummaryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (maHh: number, soLuong = 1): Promise<boolean> => {
    try {
      const res = await cartApi.addToCart(maHh, soLuong);
      if (res.success && res.data) {
        setCart(res.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateQuantity = async (maHh: number, delta: number): Promise<boolean> => {
    try {
      const res = await cartApi.updateQuantity(maHh, delta);
      if (res.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const removeItem = async (id: number): Promise<boolean> => {
    try {
      const res = await cartApi.removeFromCart(id);
      if (res.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
