// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { API_BASE_URL } from '../config/env';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

// Guest 购物车本地存储 key
const GUEST_CART_KEY = 'guest_cart';

// 从本地存储加载 guest 购物车
function loadGuestCart(): CartItem[] {
  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// 保存 guest 购物车到本地存储
function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!isLoggedIn()) {
      // 未登录：从本地存储加载
      setItems(loadGuestCart());
      return;
    }

    // 已登录：从后端加载
    if (!user?.id) {
      console.warn('User ID is missing, cannot fetch cart');
      setItems([]);
      return;
    }
    
    try {
      setLoading(true);
      const userId = String(user.id);
      console.log('Fetching cart for user:', userId);
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
          'X-USER-ID': userId,
        },
      });
      if (res.ok) {
        const data: CartItem[] = await res.json();
        console.log('Cart loaded for user:', userId, 'Items:', data.length);
        setItems(data);
      } else {
        console.error('Failed to fetch cart, status:', res.status);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 用户切换或登录状态变化时，先清空购物车，再重新加载
    console.log('[CartContext] User state changed, user ID:', user?.id, 'isLoggedIn:', isLoggedIn());
    setItems([]);
    
    if (isLoggedIn() && user?.id) {
      console.log('[CartContext] User logged in, refreshing cart for user:', user.id);
      refreshCart();
    } else {
      console.log('[CartContext] User logged out or no user, loading guest cart');
      setItems(loadGuestCart());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLoggedIn()]); // 依赖 user.id 和登录状态，确保用户切换时刷新

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isLoggedIn()) {
      // 未登录：更新本地购物车
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.product.id === product.id
              ? {
                  ...i,
                  quantity: i.quantity + quantity,
                  subtotal: (i.quantity + quantity) * product.price,
                }
              : i
          );
        } else {
          const newItem: CartItem = {
            id: Date.now(), // 临时 ID
            product,
            quantity,
            subtotal: product.price * quantity,
          };
          next = [...prev, newItem];
        }
        saveGuestCart(next);
        return next;
      });
      return;
    }

    // 已登录：调用后端 API
    if (!user?.id) {
      throw new Error('User not logged in');
    }
    
    try {
      const userId = String(user.id);
      console.log('Adding to cart for user:', userId, 'Product:', product.id);
      const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': userId,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to add to cart';
        try {
          const error = await res.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          errorMessage = res.status === 404 ? 'Product not found' : 
                        res.status === 400 ? 'Invalid request' :
                        res.status === 500 ? 'Server error' : errorMessage;
        }
        throw new Error(errorMessage);
      }

      await refreshCart();
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (!isLoggedIn()) {
      // 未登录：更新本地购物车
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === cartItemId
            ? { ...i, quantity, subtotal: i.product.price * quantity }
            : i
        );
        saveGuestCart(next);
        return next;
      });
      return;
    }

    // 已登录：调用后端 API
    if (!user?.id) {
      throw new Error('User not logged in');
    }
    
    try {
      const userId = String(user.id);
      const res = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': userId,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update quantity');
      }

      await refreshCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const removeItem = async (cartItemId: number) => {
    if (!isLoggedIn()) {
      // 未登录：从本地购物车删除
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== cartItemId);
        saveGuestCart(next);
        return next;
      });
      return;
    }

    // 已登录：调用后端 API
    if (!user?.id) {
      throw new Error('User not logged in');
    }
    
    try {
      const userId = String(user.id);
      const res = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'X-USER-ID': userId,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to remove item');
      }

      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn()) {
      // 未登录：清空本地购物车
      setItems([]);
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }

    // 已登录：调用后端 API
    if (!user?.id) {
      throw new Error('User not logged in');
    }
    
    try {
      const userId = String(user.id);
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'X-USER-ID': userId,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to clear cart');
      }

      await refreshCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        loading,
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
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

