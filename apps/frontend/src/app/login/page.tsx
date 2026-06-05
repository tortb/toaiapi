"use client";

/**
 * 用户登录页面
 *
 * 验证码采用 embed 嵌入式「一点即过」模式，
 * 直接渲染在表单内，用户点击一下即完成验证。
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePublicConfig } from "@/providers/public-config-provider";
import { withCaptchaHeaders } from "@/components/AliyunCaptcha";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { config, loading: configLoading } = usePublicConfig();
  const { isAuthenticated, isAdmin, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaParam, setCaptchaParam] = useState<string | null>(null);
  const captchaInited = useRef(false);

  const needCaptcha =
    config.captcha_login_enabled &&
    !!config.captcha_login_scene_id &&
    !!config.captcha_identity;

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) router.replace("/admin");
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // 初始化验证码（embed 嵌入式）
  useEffect(() => {
    if (!needCaptcha || captchaInited.current) return;
    captchaInited.current = true;

    const init = async () => {
      window.AliyunCaptchaConfig = {
        region: config.captcha_region || "cn",
        prefix: config.captcha_identity,
      };

      if (!document.querySelector('script[src*="AliyunCaptcha.js"]')) {
        const s = document.createElement("script");
        s.src = "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js";
        s.async = true;
        document.head.appendChild(s);
        await new Promise<void>((ok, fail) => { s.onload = () => ok(); s.onerror = fail; });
      }

      for (let i = 0; i < 30 && !window.initAliyunCaptcha; i++) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!window.initAliyunCaptcha) return;

      window.initAliyunCaptcha({
        SceneId: config.captcha_login_scene_id,
        mode: "embed",
        element: "#captcha-element",
        button: "#captcha-element",
        success: (param: string) => setCaptchaParam(param),
        fail: () => setCaptchaParam(null),
        getInstance: () => {},
        server: ["captcha-esa-open.aliyuncs.com", "captcha-esa-open-b.aliyuncs.com"],
        slideStyle: { width: 360, height: 40 },
        language: "cn",
      });
    };

    init().catch(console.error);
  }, [needCaptcha, config.captcha_login_scene_id, config.captcha_identity, config.captcha_region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (needCaptcha && !captchaParam)) return;

    clearError();
    setIsSubmitting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";
      const url = `${API_BASE.replace(/\/$/, "") || "http://localhost:3001"}/api/v1/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...withCaptchaHeaders({}, captchaParam || undefined),
        },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || `登录失败 (${res.status})`);

      const data = json?.data ?? json;
      if (data?.tokens) {
        localStorage.setItem("toaiapi_access_token", data.tokens.accessToken);
        localStorage.setItem("toaiapi_refresh_token", data.tokens.refreshToken);
        localStorage.setItem("toaiapi_user", JSON.stringify(data.user));
      }
      const role = data?.user?.role?.toLowerCase();
      router.replace(role === "admin" || role === "super_admin" ? "/admin" : "/dashboard");
    } catch (err) {
      useAuthStore.setState({ error: err instanceof Error ? err.message : "登录失败" });
      setCaptchaParam(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (configLoading || isLoading) {
    return <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (isAuthenticated && isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <span className="text-lg font-bold text-gray-900">{config.site_name || "ToAiAPI"}</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">登录</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">登录您的 {config.site_name || "ToAiAPI"} 账号</p>

        {config.login_notice && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: config.login_notice }} />
        )}
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>

          {/* 嵌入式验证码 — 一点即过 */}
          {needCaptcha && (
            <div>
              <div id="captcha-element" className="w-full min-h-[44px]" />
              {captchaParam && (
                <p className="mt-1 text-[12px] text-green-600">✅ 验证通过</p>
              )}
            </div>
          )}

          <button type="submit"
            disabled={isSubmitting || !email.trim() || !password.trim() || (needCaptcha && !captchaParam)}
            className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
            {isSubmitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 登录中...</>
              : "登录"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {config.allow_register !== false && <>还没有账号？ <Link href="/register" className="text-primary hover:underline">注册</Link> | </>}
          <Link href="/" className="hover:text-primary">← 返回首页</Link>
        </div>
      </div>
    </div>
  );
}
