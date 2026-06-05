"use client";

/**
 * Admin 登录页面
 *
 * 管理员专用登录入口，支持阿里云 ESA AI 验证码（embed 嵌入式一点即过）。
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePublicConfig } from "@/providers/public-config-provider";
import { withCaptchaHeaders } from "@/components/AliyunCaptcha";

export default function AdminLoginPage() {
  const router = useRouter();
  const { config, loading: configLoading } = usePublicConfig();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaParam, setCaptchaParam] = useState<string | null>(null);
  const captchaInited = useRef(false);

  const needCaptcha =
    config.captcha_login_enabled &&
    !!config.captcha_login_scene_id &&
    !!config.captcha_identity;

  useEffect(() => {
    const token = localStorage.getItem("toaiapi_access_token");
    const user = localStorage.getItem("toaiapi_user");
    if (token && user) {
      try {
        const u = JSON.parse(user);
        if (["admin", "super_admin"].includes(u?.role?.toLowerCase())) router.replace("/admin");
      } catch {}
    }
  }, [router]);

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

      // 等待 DOM 元素渲染完成
      for (let i = 0; i < 50; i++) {
        if (document.querySelector("#admin-captcha-element")) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!document.querySelector("#admin-captcha-element")) return;

      window.initAliyunCaptcha({
        SceneId: config.captcha_login_scene_id,
        mode: "embed",
        element: "#admin-captcha-element",
        button: "#admin-captcha-element",
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
    setError(null);
    if (!email.trim() || !password.trim() || (needCaptcha && !captchaParam)) return;

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
      const role = data?.user?.role?.toLowerCase();
      if (role !== "admin" && role !== "super_admin") throw new Error("权限不足：仅管理员可访问后台");

      if (data?.tokens) {
        localStorage.setItem("toaiapi_access_token", data.tokens.accessToken);
        localStorage.setItem("toaiapi_refresh_token", data.tokens.refreshToken);
        localStorage.setItem("toaiapi_user", JSON.stringify(data.user));
      }
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
      setCaptchaParam(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (configLoading) {
    return <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <span className="text-2xl font-bold text-white">ToAi<span className="text-primary">API</span></span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">AI API Gateway<br />管理控制台</h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">统一管理 AI 模型、渠道、用户和计费。<br />企业级 API 中转平台后台管理系统。</p>
          <div className="mt-12 space-y-4">
            {["多模型统一接入与管理", "实时监控与智能告警", "精细化权限控制", "完整的财务与订单系统"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2962FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <span className="text-lg font-bold text-gray-900">ToAi<span className="text-primary">API</span></span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">管理员登录</h2>
          <p className="text-sm text-gray-500 mb-8">请输入管理员账号登录后台系统</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {config.login_notice && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: config.login_notice }} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" autoComplete="email" required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete="current-password" required
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
            </div>

            {/* 嵌入式验证码 — 一点即过 */}
            {needCaptcha && (
              <div>
                <div id="admin-captcha-element" className="w-full min-h-[44px]" />
                {captchaParam && <p className="mt-1 text-[12px] text-green-600">✅ 验证通过</p>}
              </div>
            )}

            <button type="submit"
              disabled={isSubmitting || !email.trim() || !password.trim() || (needCaptcha && !captchaParam)}
              className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
              {isSubmitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 登录中...</>
                : "登录"}
            </button>
          </form>

          <div className="mt-6 text-center"><a href="/" className="text-sm text-gray-500 hover:text-primary transition">← 返回首页</a></div>
        </div>
      </div>
    </div>
  );
}
