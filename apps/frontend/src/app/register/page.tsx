"use client";

/**
 * 用户注册页面
 *
 * 验证码流程：
 * 1. 用户填写表单
 * 2. 点击「验证」按钮 → 弹出验证码 → 验证成功 → 显示 ✅
 * 3. 点击「注册」按钮 → 携带 captchaVerifyParam 提交
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePublicConfig } from "@/providers/public-config-provider";
import { withCaptchaHeaders } from "@/components/AliyunCaptcha";

export default function RegisterPage() {
  const router = useRouter();
  const { config, loading: configLoading } = usePublicConfig();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaParam, setCaptchaParam] = useState<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);

  const needInviteCode = config.invite_code_required;
  const needEmailVerify = config.email_verify;
  const needCaptcha =
    config.captcha_register_enabled &&
    !!config.captcha_register_scene_id &&
    !!config.captcha_identity;

  // 加载阿里云验证码脚本并初始化
  useEffect(() => {
    if (!needCaptcha) return;

    const initCaptcha = async () => {
      window.AliyunCaptchaConfig = {
        region: config.captcha_region || "cn",
        prefix: config.captcha_identity,
      };

      if (!document.querySelector('script[src*="AliyunCaptcha.js"]')) {
        const script = document.createElement("script");
        script.src = "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js";
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });
      }

      let retries = 0;
      while (!window.initAliyunCaptcha && retries < 30) {
        await new Promise((r) => setTimeout(r, 100));
        retries++;
      }

      if (!window.initAliyunCaptcha) return;

      window.initAliyunCaptcha({
        SceneId: config.captcha_register_scene_id,
        mode: config.captcha_mode || "popup",
        element: "#register-captcha-element",
        button: "#register-captcha-btn",
        success: (param: string) => setCaptchaParam(param),
        fail: () => setCaptchaParam(null),
        getInstance: () => {},
        server: ["captcha-esa-open.aliyuncs.com", "captcha-esa-open-b.aliyuncs.com"],
        slideStyle: { width: 360, height: 40 },
        language: "cn",
      });

      setCaptchaReady(true);
    };

    initCaptcha().catch(console.error);
  }, [needCaptcha, config.captcha_register_scene_id, config.captcha_identity, config.captcha_region, config.captcha_mode]);

  // 提交注册
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) { setError("请填写邮箱和密码"); return; }
    if (password !== confirmPassword) { setError("两次输入的密码不一致"); return; }
    if (password.length < 8) { setError("密码长度至少 8 位"); return; }
    if (needCaptcha && !captchaParam) return;

    setIsSubmitting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";
      const url = `${API_BASE.replace(/\/$/, "") || "http://localhost:3001"}/api/v1/auth/register`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...withCaptchaHeaders({}, captchaParam || undefined),
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: email.trim(), password,
          displayName: displayName.trim() || undefined,
          inviteCode: inviteCode.trim() || undefined,
          emailCode: emailCode.trim() || undefined,
        }),
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || `注册失败 (${res.status})`);

      const data = json?.data ?? json;
      if (data?.tokens) {
        localStorage.setItem("toaiapi_access_token", data.tokens.accessToken);
        localStorage.setItem("toaiapi_refresh_token", data.tokens.refreshToken);
        localStorage.setItem("toaiapi_user", JSON.stringify(data.user));
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
      setCaptchaParam(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (config.allow_register === false) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-gray-900 mb-2">注册已关闭</h1>
          <p className="text-[14px] text-gray-500 mb-6">暂时无法注册新账号</p>
          <Link href="/" className="text-primary hover:underline text-sm">← 返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">{config.site_name || "ToAiAPI"}</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">创建账号</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">注册 {config.site_name || "ToAiAPI"} 账号</p>

        {config.register_notice && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: config.register_notice }} />
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">显示名称</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="可选"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>

          {needEmailVerify && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱验证码</label>
              <div className="flex gap-2">
                <input type="text" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="输入验证码" maxLength={6}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <button type="button" className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 whitespace-nowrap">发送验证码</button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 8 位" required minLength={8}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入密码" required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>

          {needInviteCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">邀请码</label>
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="输入邀请码" required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          )}

          {/* 验证码区域 */}
          {needCaptcha && (
            <div className="space-y-2">
              <label className="block text-[13px] text-gray-700 font-medium">安全验证</label>
              <div className="flex items-center gap-3">
                <div id="register-captcha-element" className="flex-1" />
                <button
                  id="register-captcha-btn"
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
                  {captchaParam ? "✅ 已验证" : captchaReady ? "点击验证" : "加载中..."}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (needCaptcha && !captchaParam)}
            className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 注册中...</>
            ) : (
              "注册"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          已有账号？ <Link href="/login" className="text-primary hover:underline">登录</Link> | <Link href="/" className="hover:text-primary">← 返回首页</Link>
        </div>
      </div>
    </div>
  );
}
