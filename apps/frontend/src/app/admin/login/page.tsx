"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, DollarSign, Settings, Users } from "lucide-react";
import { adminLogin } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";
import { notifyError } from "@/lib/feedback/events";

const features = [
  { icon: Users, text: "用户与权限管理" },
  { icon: Bot, text: "模型与通道管理" },
  { icon: DollarSign, text: "财务与订单管理" },
  { icon: Settings, text: "系统配置管理" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await adminLogin({ email: email.trim(), password });
      restoreSession();
      router.replace("/admin");
    } catch (err) {
      notifyError(err, "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[500px] bg-[var(--surface-soft)] p-12 flex-col gap-6">
        <div className="flex items-center gap-2"><span className="text-2xl text-[var(--accent)]">◆</span><span className="text-xl font-bold text-[var(--foreground)]">ToAIAPI Admin</span></div>
        <div className="mt-8"><h1 className="text-4xl font-extrabold text-[var(--foreground)]">管理控制台</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">系统管理与运营配置中心</p></div>
        <div className="space-y-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return <div key={feature.text} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Icon className="w-4 h-4 text-[var(--accent)]" /><span>{feature.text}</span></div>;
          })}
        </div>
        <div className="mt-auto text-xs text-[var(--text-muted)]">仅限管理员访问</div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-[400px] flex flex-col gap-6">
          <div><h2 className="text-2xl font-bold text-[var(--foreground)]">管理员登录</h2><p className="text-sm text-[var(--text-secondary)] mt-1">请输入管理员账号和密码</p></div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">管理员邮箱</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="admin@example.com" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--foreground)]">密码</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="请输入密码" />
          </label>
          <button disabled={!canSubmit} className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-60">
            {submitting ? "登录中..." : "登录管理后台"}
          </button>
        </form>
      </div>
    </div>
  );
}
