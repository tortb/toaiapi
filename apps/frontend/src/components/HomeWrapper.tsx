"use client";

/**
 * 首页包装组件
 *
 * 处理维护模式检查和首页公告显示。
 */

import React from "react";
import { usePublicConfig } from "@/providers/public-config-provider";
import MaintenancePage from "@/components/MaintenancePage";

export default function HomeWrapper({ children }: { children: React.ReactNode }) {
  const { config, loading } = usePublicConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 维护模式：管理员通过后端 JWT 判断，前端仅展示维护页
  if (config.maintenance_mode) {
    return <MaintenancePage />;
  }

  return (
    <>
      {/* 首页公告 */}
      {config.home_notice && (
        <div
          className="bg-primary-50 border-b border-primary-100 px-6 py-3 text-center text-[13px] text-primary-700"
          dangerouslySetInnerHTML={{ __html: config.home_notice }}
        />
      )}
      {children}
    </>
  );
}
