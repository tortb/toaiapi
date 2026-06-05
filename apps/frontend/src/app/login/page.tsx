"use client";

/**
 * 用户登录页面
 *
 * 支持：登录页公告、阿里云 ESA AI 验证码
 *
 * 验证码流程：
 * - 需要验证码时，「登录」按钮直接作为验证码触发按钮（button 代替 submit）
 * - 用户点击 → 验证码弹窗 → 验证成功 → success 回调自动提交表单
 * - 不需要验证码时，按钮为普通 submit
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePublicConfig } from "@/providers/public-config-provider";
import AliyunCaptcha, { withCaptchaHeaders } from "@/components/AliyunCaptcha";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { config, loading: configLoading } = usePublicConfig();
  const {
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 用 ref 存储最新的 email/password，避免回调闭包问题
  const emailRef = useRef(email);
  const passwordRef = useRef(password);
  emailRef.current = email;
  passwordRef.current = password;

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

  // 实际登录请求
  const doLogin = useCallback(
    async (captchaVerifyParam?: string) => {
      clearError();
      setIsSubmitting(true);
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE ??
          process.env.NEXT_PUBLIC_API_URL ??
          "";
        const url = `${API_BASE.replace(/\/$/, "") || "http://localhost:3001"}/api/v1/auth/login`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...withCaptchaHeaders({}, captchaVerifyParam),
        };

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            email: emailRef.current.trim(),
            password: passwordRef.current,
          }),
          credentials: "include",
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.message || `登录失败 (${res.status})`);
        }

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
        const message = err instanceof Error ? err.message : "登录失败";
        useAuthStore.setState({ error: message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearError, router]
  );

  // 验证码验证成功回调 — 自动执行登录
  const onCaptchaSuccess = useCallback(
    (captchaVerifyParam: string) => {
      doLogin(captchaVerifyParam);
    },
    [doLogin]
  );

  // 不需要验证码时，表单直接提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (!needCaptcha) {
      await doLogin();
    }
    // needCaptcha 时，按钮不是 submit，不会触发这里
  };

  if (configLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && isAdmin) return null;

  // 验证码按钮的样式
  const captchaBtnId = "login-captcha-btn";

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {config.site_name || "ToAiAPI"}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">登录</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          登录您的 {config.site_name || "ToAiAPI"} 账号
        </p>

        {/* 登录页公告 */}
        {config.login_notice && (
          <div
            className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: config.login_notice }}
          />
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* 验证码：整个组件包在 form 外面不好，放在 form 内部，
              按钮 type="button" 不会触发 form 提交 */}
          {needCaptcha ? (
            <>
              {/* 验证码组件：button 指向实际的登录按钮 */}
              <div id="captcha-element" />
              <AliyunCaptcha
                sceneId={config.captcha_login_scene_id}
                identity={config.captcha_identity}
                region={config.captcha_region}
                mode={config.captcha_mode as "popup" | "embed"}
                onSuccess={onCaptchaSuccess}
                onFail={() => {}}
                button={`#${captchaBtnId}`}
              />
              {/* 登录按钮 = 验证码触发按钮 */}
              <button
                id={captchaBtnId}
                type="button"
                disabled={isSubmitting || !email.trim() || !password.trim()}
                className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </button>
            </>
          ) : (
            /* 不需要验证码：普通 submit 按钮 */
            <button
              type="submit"
              disabled={isSubmitting || !email.trim() || !password.trim()}
              className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </button>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {config.allow_register !== false && (
            <>
              还没有账号？{" "}
              <Link href="/register" className="text-primary hover:underline">注册</Link>
              {" | "}
            </>
          )}
          <Link href="/" className="hover:text-primary">← 返回首页</Link>
        </div>
      </div>
    </div>
  );
}
