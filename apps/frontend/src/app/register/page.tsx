"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Gift, Shield, Zap } from "lucide-react";
import AliyunCaptcha from "@/components/AliyunCaptcha";
import { register, sendVerificationCode } from "@/lib/auth-api";
import { usePublicConfig } from "@/providers/public-config-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { config } = usePublicConfig();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [registerCaptcha, setRegisterCaptcha] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailVerifyEnabled = config.email_verify === true;
  const registerCaptchaEnabled = config.captcha_register_enabled === true;
  const sendCodeCaptchaEnabled = config.captcha_send_email_code_enabled === true;
  const canUseSendCaptcha = sendCodeCaptchaEnabled && !!config.captcha_identity && !!config.captcha_send_email_code_scene_id;
  const canUseRegisterCaptcha = registerCaptchaEnabled && !!config.captcha_identity && !!config.captcha_register_scene_id;
  const emailValue = email.trim();
  const canSubmit =
    emailValue.length > 0 &&
    password.length >= 8 &&
    (!emailVerifyEnabled || emailCode.trim().length > 0) &&
    (!registerCaptchaEnabled || registerCaptcha.length > 0) &&
    !submitting;

  useEffect(() => {
    setInviteCode(new URLSearchParams(window.location.search).get("invite") || "");
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleSendCode(captchaVerifyParam?: string) {
    if (!emailValue || sendingCode || cooldown > 0) return;
    if (sendCodeCaptchaEnabled && !captchaVerifyParam) {
      setError("请先完成人机验证");
      return;
    }

    setSendingCode(true);
    setError("");
    setMessage("");
    try {
      await sendVerificationCode({ email: emailValue, purpose: "注册", captchaVerifyParam });
      setMessage("验证码已发送，请查收邮箱");
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码发送失败");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await register({
        email: emailValue,
        password,
        displayName: displayName.trim() || undefined,
        emailCode: emailVerifyEnabled ? emailCode.trim() : undefined,
        inviteCode: inviteCode.trim() || undefined,
        captchaVerifyParam: registerCaptcha || undefined,
      });
      router.replace("/dashboard/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
      if (registerCaptchaEnabled) setRegisterCaptcha("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[500px] bg-[var(--accent)] p-12 flex-col gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-white">◆</span>
          <span className="text-xl font-bold text-white">ToAIAPI</span>
        </Link>
        <div className="mt-8">
          <h1 className="text-4xl font-extrabold text-white">开始构建</h1>
          <h2 className="text-4xl font-extrabold text-[#C7D2FE]">你的 AI 应用</h2>
          <p className="mt-2 text-sm text-[#DDD6FE]">注册后即可创建 API Key 并开始调用。</p>
        </div>
        <div className="space-y-3 mt-4">
          {[{ icon: Zap, text: "多模型统一调用" }, { icon: Gift, text: "邀请奖励自动结算" }, { icon: Shield, text: "按量充值，安全可控" }].map((item) => {
            const Icon = item.icon;
            return <div key={item.text} className="flex items-center gap-2 text-sm text-[#E8E4FF]"><Icon className="w-4 h-4" /><span>{item.text}</span></div>;
          })}
        </div>
        <div className="mt-auto text-sm font-medium text-[#DDD6FE]">已有账号？<Link href="/login" className="underline">立即登录</Link></div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-[420px] flex flex-col gap-5">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">创建账号</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">注册后即可获得 API Key 并开始调用</p>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">邮箱</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="请输入邮箱地址" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">显示名称（选填）</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="请输入显示名称" />
          </label>
          {emailVerifyEnabled && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">邮箱验证码</span>
              <div className="flex gap-2">
                <input value={emailCode} onChange={(event) => setEmailCode(event.target.value)} className="min-w-0 flex-1 px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="6 位验证码" />
                {sendCodeCaptchaEnabled ? (
                  canUseSendCaptcha ? (
                    <AliyunCaptcha
                      sceneId={config.captcha_send_email_code_scene_id}
                      identity={config.captcha_identity}
                      region={config.captcha_region || "cn"}
                      mode={(config.captcha_mode as "popup" | "embed") || "popup"}
                      onSuccess={(value) => void handleSendCode(value)}
                      buttonClassName="px-3 py-2.5 border border-[var(--line)] rounded-md text-sm whitespace-nowrap disabled:opacity-60"
                      buttonText={cooldown > 0 ? `${cooldown}s` : sendingCode ? "发送中" : "获取验证码"}
                      disabled={!emailValue || sendingCode || cooldown > 0}
                    />
                  ) : (
                    <button type="button" disabled className="px-3 py-2.5 border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)] whitespace-nowrap">未配置验证</button>
                  )
                ) : (
                  <button type="button" onClick={() => void handleSendCode()} disabled={!emailValue || sendingCode || cooldown > 0} className="px-3 py-2.5 border border-[var(--line)] rounded-md text-sm whitespace-nowrap disabled:opacity-60">{cooldown > 0 ? `${cooldown}s` : sendingCode ? "发送中" : "获取验证码"}</button>
                )}
              </div>
            </div>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">密码</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="8-128位，含大小写字母和数字" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">邀请码（选填）</span>
            <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="请输入邀请码" />
          </label>
          {registerCaptchaEnabled && (
            <div className="flex flex-col gap-2">
              {canUseRegisterCaptcha ? (
                <AliyunCaptcha
                  sceneId={config.captcha_register_scene_id}
                  identity={config.captcha_identity}
                  region={config.captcha_region || "cn"}
                  mode={(config.captcha_mode as "popup" | "embed") || "popup"}
                  onSuccess={setRegisterCaptcha}
                  buttonClassName="w-full py-2.5 border border-[var(--line)] rounded-md text-sm disabled:opacity-60"
                  buttonText={registerCaptcha ? "人机验证已完成" : "完成人机验证"}
                  disabled={!!registerCaptcha}
                />
              ) : (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">注册验证码未配置，请联系管理员</div>
              )}
            </div>
          )}
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
          <button disabled={!canSubmit} className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-60">
            {submitting ? "注册中..." : "注册"}
          </button>
          <div className="flex justify-center gap-1 text-sm"><span className="text-[var(--text-secondary)]">已有账号？</span><Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">立即登录</Link></div>
        </form>
      </div>
    </div>
  );
}
