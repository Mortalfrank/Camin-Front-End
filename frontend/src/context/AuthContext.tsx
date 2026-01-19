import { createContext, useContext, useState, ReactNode } from 'react';
import { API_BASE_URL } from '../config/env';

// 用户信息类型
interface User {
  id: number;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
}

// Guest 购物车本地存储 key
const GUEST_CART_KEY = 'guest_cart';

// 合并本地购物车到后端
async function mergeGuestCartToServer(userId: number) {
  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return;
  
  let items: any[] = [];
  try {
    items = JSON.parse(raw);
  } catch {
    return;
  }

  // 将本地购物车商品添加到后端
  for (const item of items) {
    const productId = item.product?.id ?? item.productId;
    const quantity = item.quantity ?? 1;
    if (!productId) continue;

    try {
      await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': String(userId),
        },
        body: JSON.stringify({ productId, quantity }),
      });
    } catch (e) {
      console.error('Failed to merge guest cart item', e);
    }
  }

  // 合并完成后清空本地购物车
  localStorage.removeItem(GUEST_CART_KEY);
}

// Context 类型
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isUser: () => boolean;
  isLoggedIn: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider 组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // 从 localStorage 恢复用户状态
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // 登录时合并本地购物车到后端
    mergeGuestCartToServer(userData.id).catch((e) =>
      console.error('Failed to merge guest cart', e)
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // 退出登录时清空购物车（CartContext 会检测到 user 变化并加载本地购物车）
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isUser = () => user?.role === 'USER';
  const isLoggedIn = () => user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isUser, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}