"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-secondary)]">验证身份中...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      <DashboardSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
