"use client";

/**
 * Admin Layout
 *
 * 包裹所有 /admin/* 路由，提供：
 * 1. 认证检查 - 未登录跳转 /admin/login
 * 2. 权限检查 - 非管理员跳转 /403
 * 3. 统一的后台布局框架
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import AdminShell from "@/components/admin/AdminShell";

// 不需要认证的路径
const PUBLIC_PATHS = ["/admin/login"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

  // 认证检查
  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    // 未登录 → 跳转登录页（除非已经在登录页）
    if (!isAuthenticated && !isPublicPath) {
      router.replace("/admin/login");
      return;
    }

    // 已登录但在登录页 → 跳转 Dashboard
    if (isAuthenticated && isAdmin && pathname === "/admin/login") {
      router.replace("/admin");
      return;
    }

    // 已登录但不是管理员 → 跳转 403
    if (isAuthenticated && !isAdmin && !isPublicPath) {
      router.replace("/403");
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, pathname, router]);

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">验证身份中...</p>
        </div>
      </div>
    );
  }

  // 公开页面（登录页）直接渲染
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // 未登录不渲染（等待跳转）
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // 已认证的管理员 → 渲染统一后台布局
  return <AdminShell>{children}</AdminShell>;
}
