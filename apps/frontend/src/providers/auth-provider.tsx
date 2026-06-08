"use client";

/**
 * Auth Provider
 *
 * 包裹应用，初始化时恢复用户会话。
 * 提供加载状态给子组件判断是否已完成认证检查。
 */

import { useEffect } from "react";
import { AUTH_SYNC_EVENT } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const syncAuthState = useAuthStore((s) => s.syncAuthState);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("toaiapi_")) {
        syncAuthState();
      }
    };

    window.addEventListener(AUTH_SYNC_EVENT, syncAuthState);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_SYNC_EVENT, syncAuthState);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncAuthState]);

  return <>{children}</>;
}
