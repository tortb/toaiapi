import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser, TokenResponse } from '@/types';

/** 认证状态 */
interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AdminUser, tokens: TokenResponse) => void;
  logout: () => void;
}

/** Admin 认证 Store，持久化到 localStorage */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        // SECURITY: 同步写入 localStorage，供 api.ts 的 request() 读取
        localStorage.setItem('admin-access-token', tokens.accessToken);
        localStorage.setItem('admin-refresh-token', tokens.refreshToken);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('admin-access-token');
        localStorage.removeItem('admin-refresh-token');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
