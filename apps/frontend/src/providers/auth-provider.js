"use client";
/**
 * Auth Provider
 *
 * 包裹应用，初始化时恢复用户会话。
 * 提供加载状态给子组件判断是否已完成认证检查。
 */
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
export function AuthProvider({ children }) {
    const restoreSession = useAuthStore((s) => s.restoreSession);
    useEffect(() => {
        restoreSession();
    }, [restoreSession]);
    return <>{children}</>;
}
//# sourceMappingURL=auth-provider.js.map