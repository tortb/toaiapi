"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BarChart3, Shield, Zap } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const features = [
  { icon: Zap, text: "高可用架构 · 智能故障转移" },
  { icon: Shield, text: "企业级安全 · 加密传输" },
  { icon: BarChart3, text: "用量透明 · 每笔可追溯" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await login({ email: email.trim(), password });
      router.replace("/dashboard/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[500px] bg-[var(--surface-soft)] p-12 flex-col gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-[var(--accent)]">◆</span>
          <span className="text-xl font-bold text-[var(--foreground)]">ToAIAPI</span>
        </Link>
        <div className="mt-8">
          <h1 className="text-4xl font-extrabold text-[var(--foreground)]">欢迎回来</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-[380px]">
            通过 OpenAI 兼容接口，一键接入 Claude、GPT、Gemini、DeepSeek 等主流模型。
          </p>
        </div>
        <div className="space-y-3 mt-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.text} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Icon className="w-4 h-4 text-[var(--accent)]" />
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-auto text-xs text-[var(--text-muted)]">© 2026 ToAIAPI</div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-[400px] flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">登录</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">登录您的账户以继续使用 ToAIAPI</p>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">邮箱</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]"
              placeholder="请输入邮箱地址"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">密码</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]"
              placeholder="请输入密码"
            />
          </label>
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-[var(--accent)] font-medium hover:underline">忘记密码？</Link>
          </div>
          <button disabled={!canSubmit} className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-60">
            {submitting ? "登录中..." : "登录"}
          </button>
          <div className="flex justify-center gap-1 text-sm">
            <span className="text-[var(--text-secondary)]">还没有账号？</span>
            <Link href="/register" className="font-semibold text-[var(--accent)] hover:underline">立即注册</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
