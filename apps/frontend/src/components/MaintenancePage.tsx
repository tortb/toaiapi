"use client";

import React from "react";
import { usePublicConfig } from "@/providers/public-config-provider";
import { sanitizeHtml } from "@/lib/sanitize-html";

/**
 * 维护模式页面
 *
 * 当 maintenance_mode 开启时全站显示维护公告，
 * 管理员不受影响（后端 API 层已处理，前端仅做展示）。
 */
export default function MaintenancePage() {
  const { config } = usePublicConfig();
  const siteName = config.site_name || "ToAIAPI";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-gray-900 mb-2">
            系统维护中
          </h1>
          <p className="text-[14px] text-gray-500">
            {siteName} 正在进行维护，请稍后再试
          </p>
        </div>

        {config.maintenance_notice && (
          <div
            className="bg-white rounded-lg border border-gray-200 p-6 text-left text-[14px] text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.maintenance_notice) }}
          />
        )}

        <p className="text-[12px] text-gray-400 mt-6">
          如有紧急问题，请联系管理员
        </p>
      </div>
    </div>
  );
}
