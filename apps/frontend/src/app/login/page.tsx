"use client";

/**
 * 用户登录页面
 *
 * 验证码流程：
 * 1. 用户填写邮箱密码
 * 2. 点击「验证」按钮 → 弹出验证码 → 验证成功 → 显示 ✅
 * 3. 点击「登录」按钮 → 携带 captchaVerifyParam 提交
 */

import { useState, useEffect, useCallback } from "react";
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
  const [captchaReady, setCaptchaReady] = useState(false);

  const needCaptcha =
    config.captcha_login_enabled &&
    !!config.captcha_login_scene_id &&
    !!config.captcha_identity;

  // 已登录管理员跳转后台
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // 加载阿里云验证码脚本并初始化
  useEffect(() => {
    if (!needCaptcha) return;
    if (!config.captcha_login_scene_id || !config.captcha_identity) return;

    const initCaptcha = async () => {
      // 设置全局配置
      window.AliyunCaptchaConfig = {
        region: config.captcha_region || "cn",
        prefix: config.captcha_identity,
      };

      // 动态加载脚本
      if (!document.querySelector('script[src*="AliyunCaptcha.js"]')) {
        const script = document.createElement("script");
        script.src = "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js";
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // 等待 initAliyunCaptcha 可用
      let retries = 0;
      while (!window.initAliyunCaptcha && retries < 30) {
        await new Promise((r) => setTimeout(r, 100));
        retries++;
      }

      if (!window.initAliyunCaptcha) {
        console.error("[Captcha] initAliyunCaptcha not available");
        return;
      }

      window.initAliyunCaptcha({
        SceneId: config.captcha_login_scene_id,
        mode: config.captcha_mode || "popup",
        element: "#login-captcha-element",
        button: "#login-captcha-btn",
        success: (captchaVerifyParam: string) => {
          setCaptchaParam(captchaVerifyParam);
        },
        fail: (result: any) => {
          console.warn("[Captcha] failed:", result);
          setCaptchaParam(null);
        },
        getInstance: () => {},
        server: ["captcha-esa-open.aliyuncs.com", "captcha-esa-open-b.aliyuncs.com"],
        slideStyle: { width: 360, height: 40 },
        language: "cn",
      });

      setCaptchaReady(true);
    };

    initCaptcha().catch(console.error);
  }, [needCaptcha, config.captcha_login_scene_id, config.captcha_identity, config.captcha_region, config.captcha_mode]);

  // 提交登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (needCaptcha && !captchaParam) return; // 还没验证

    clearError();
    setIsSubmitting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";
      const url = `${API_BASE.replace(/\/$/, "") || "http://localhost:3001"}/api/v1/auth/login`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...withCaptchaHeaders({}, captchaParam || undefined),
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
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
      if (role === "admin" || role === "super_admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      useAuthStore.setState({ error: err instanceof Error ? err.message : "登录失败" });
      setCaptchaParam(null); // 重置验证码，需要重新验证
    } finally {
      setIsSubmitting(false);
    }
  };

  if (configLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">{config.site_name || "ToAiAPI"}</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">登录</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">登录您的 {config.site_name || "ToAiAPI"} 账号</p>

        {/* 登录页公告 */}
        {config.login_notice && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: config.login_notice }} />
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

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

          {/* 验证码区域 */}
          {needCaptcha && (
            <div className="space-y-2">
              <label className="block text-[13px] text-gray-700 font-medium">安全验证</label>
              <div className="flex items-center gap-3">
                {/* 验证码元素容器 */}
                <div id="login-captcha-element" className="flex-1" />
                {/* 验证按钮 */}
                <button
                  id="login-captcha-btn"
                  type="button"
                  disabled={!captchaReady}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition flex items-center gap-1.5 whitespace-nowrap ${
                    captchaParam
                      ? "bg-green-50 border-green-200 text-green-700"
                      : captchaReady
                        ? "bg-white border-primary text-primary hover:bg-primary-50"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {captchaParam ? (
                    <>✅ 已验证</>
                  ) : captchaReady ? (
                    <>点击验证</>
                  ) : (
                    <>加载中...</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !password.trim() || (needCaptcha && !captchaParam)}
            className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 登录中...</>
            ) : (
              "登录"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {config.allow_register !== false && (
            <>还没有账号？ <Link href="/register" className="text-primary hover:underline">注册</Link> | </>
          )}
          <Link href="/" className="hover:text-primary">← 返回首页</Link>
        </div>
      </div>
    </div>
  );
}
