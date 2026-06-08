"use client";

/**
 * PublicConfig Provider
 *
 * 应用启动时从后端 /public-config 接口获取站点配置，
 * 提供 usePublicConfig() hook 给任意组件使用。
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/http";

export interface PublicConfig {
  site_name: string;
  site_subtitle: string;
  logo_url: string;
  favicon_url: string;
  copyright: string;
  icp_number: string;
  icp_number_show: boolean;
  psb_number: string;
  psb_number_show: boolean;
  contact_email: string;
  support_email: string;
  default_language: string;
  default_timezone: string;
  maintenance_mode: boolean;
  maintenance_notice: string;
  home_notice: string;
  login_notice: string;
  register_notice: string;
  footer_content: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  allow_register: boolean;
  allow_change_email: boolean;
  allow_change_username: boolean;
  allow_create_api_key: boolean;
  allow_delete_api_key: boolean;
  allow_webhook: boolean;
  allow_organization: boolean;
  allow_delete_account: boolean;
  email_verify: boolean;
  captcha_enabled: boolean;
  invite_code_required: boolean;
  whitelist_enabled: boolean;
  // 阿里云 ESA AI 验证码配置（每 URL 独立 Scene ID）
  captcha_identity: string;
  captcha_region: string;
  captcha_mode: string;
  captcha_register_enabled: boolean;
  captcha_register_scene_id: string;
  captcha_login_enabled: boolean;
  captcha_login_scene_id: string;
  captcha_forgot_password_enabled: boolean;
  captcha_forgot_password_scene_id: string;
  captcha_send_email_code_enabled: boolean;
  captcha_send_email_code_scene_id: string;
}

const DEFAULT_CONFIG: PublicConfig = {
  site_name: "ToAIAPI",
  site_subtitle: "企业级 AI API 网关",
  logo_url: "",
  favicon_url: "",
  copyright: "© 2026 ToAIAPI. All rights reserved.",
  icp_number: "",
  icp_number_show: false,
  psb_number: "",
  psb_number_show: false,
  contact_email: "",
  support_email: "",
  default_language: "zh-CN",
  default_timezone: "Asia/Shanghai",
  maintenance_mode: false,
  maintenance_notice: "",
  home_notice: "",
  login_notice: "",
  register_notice: "",
  footer_content: "",
  seo_title: "ToAIAPI - 企业级 AI API 网关",
  seo_description: "一站式 AI API 代理平台，支持 OpenAI、Anthropic、Google 等主流模型",
  seo_keywords: "AI API,OpenAI,Claude,GPT,API代理",
  allow_register: true,
  allow_change_email: true,
  allow_change_username: true,
  allow_create_api_key: true,
  allow_delete_api_key: true,
  allow_webhook: false,
  allow_organization: false,
  allow_delete_account: false,
  email_verify: true,
  captcha_enabled: false,
  invite_code_required: false,
  whitelist_enabled: false,
  captcha_identity: "",
  captcha_region: "cn",
  captcha_mode: "popup",
  captcha_register_enabled: true,
  captcha_register_scene_id: "",
  captcha_login_enabled: false,
  captcha_login_scene_id: "",
  captcha_forgot_password_enabled: false,
  captcha_forgot_password_scene_id: "",
  captcha_send_email_code_enabled: false,
  captcha_send_email_code_scene_id: "",
};

interface PublicConfigContextType {
  config: PublicConfig;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PublicConfigContext = createContext<PublicConfigContextType>({
  config: DEFAULT_CONFIG,
  loading: true,
  refresh: async () => {},
});

const PUBLIC_CONFIG_PATH = "/api/v1/public-config";

export function PublicConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PublicConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const url = buildApiUrl(PUBLIC_CONFIG_PATH);
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
      });
      if (!res.ok) {
        console.warn("[PublicConfig] fetch failed:", res.status);
        return;
      }
      const json = await res.json();
      // 后端返回格式可能有 code/data 包装
      const data = json?.data ?? json;
      if (data && typeof data === "object") {
        // 将字符串布尔值转为 boolean
        const parsed: Record<string, any> = {};
        for (const [k, v] of Object.entries(data)) {
          if (v === "true") parsed[k] = true;
          else if (v === "false") parsed[k] = false;
          else parsed[k] = v ?? DEFAULT_CONFIG[k as keyof PublicConfig];
        }
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.warn("[PublicConfig] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // 动态更新 favicon
  useEffect(() => {
    if (config.favicon_url && typeof document !== "undefined") {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = config.favicon_url;
    }
  }, [config.favicon_url]);

  return (
    <PublicConfigContext.Provider value={{ config, loading, refresh: fetchConfig }}>
      {children}
    </PublicConfigContext.Provider>
  );
}

export function usePublicConfig() {
  return useContext(PublicConfigContext);
}
