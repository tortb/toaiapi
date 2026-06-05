/**
 * Auth 状态管理 (Zustand)
 *
 * 管理管理员登录状态、用户信息、加载状态。
 * 自动从 localStorage 恢复会话。
 */
import { create } from "zustand";
import { login as apiLogin, logout as apiLogout, getCurrentUser, isAuthenticated, isAdmin, clearAuthData, } from "@/lib/auth-api";
// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────
export const useAuthStore = create((set) => ({
    // 初始状态
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true, // 初始为 true，等待 restoreSession 完成
    error: null,
    /**
     * 登录
     */
    login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const auth = await apiLogin(payload);
            set({
                user: auth.user,
                isAuthenticated: true,
                isAdmin: true,
                isLoading: false,
                error: null,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "登录失败";
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                error: message,
            });
            throw err;
        }
    },
    /**
     * 登出
     */
    logout: async () => {
        set({ isLoading: true });
        try {
            await apiLogout();
        }
        finally {
            clearAuthData();
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                error: null,
            });
        }
    },
    /**
     * 清除错误
     */
    clearError: () => {
        set({ error: null });
    },
    /**
     * 从 localStorage 恢复会话
     *
     * 应在应用初始化时调用一次。
     */
    restoreSession: () => {
        const authenticated = isAuthenticated();
        const admin = isAdmin();
        const user = getCurrentUser();
        // 如果有 token 但不是管理员，清除数据
        if (authenticated && !admin) {
            clearAuthData();
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
            });
            return;
        }
        set({
            user,
            isAuthenticated: authenticated,
            isAdmin: admin,
            isLoading: false,
        });
    },
}));
//# sourceMappingURL=auth-store.js.map