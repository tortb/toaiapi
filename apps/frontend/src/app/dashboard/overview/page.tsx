"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, CreditCard, Key, Wallet } from "lucide-react";
import { getBalanceStats, type BalanceStats } from "@/lib/payment-api";
import { getUserApiKeys, getUserProfile, type UserApiKey, type UserProfile } from "@/lib/user-api";

function yuan(value?: number) {
  return `¥${(value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function num(value?: number) {
  return (value ?? 0).toLocaleString("zh-CN");
}

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<BalanceStats | null>(null);
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUserProfile(), getBalanceStats(), getUserApiKeys()])
      .then(([profileData, statsData, keyData]) => {
        if (cancelled) return;
        setProfile(profileData);
        setStats(statsData);
        setKeys(keyData);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "数据加载失败");
      });
    return () => { cancelled = true; };
  }, []);

  const activeKeys = keys.filter((item) => item.isActive).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="page-title">控制台概览</h1>
        <p className="page-subtitle">{profile ? `${profile.email} · ${profile.role}` : "正在加载账户信息"}</p>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat icon={Wallet} label="可用余额" value={yuan(stats?.balance?.available)} />
        <Stat icon={CreditCard} label="本月消费" value={yuan(stats?.monthlySpend)} />
        <Stat icon={BarChart3} label="本月请求" value={num(stats?.monthlyRequests)} />
        <Stat icon={Key} label="活跃密钥" value={`${activeKeys}/${keys.length}`} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 bg-white border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--foreground)]">最近调用</h2>
            <Link href="/dashboard/logs" className="text-sm text-[var(--accent)]">查看日志</Link>
          </div>
          {(stats?.recentUsage ?? []).length === 0 ? (
            <div className="py-8 text-sm text-[var(--text-secondary)] text-center">暂无调用记录</div>
          ) : (
            <div className="space-y-3">
              {stats!.recentUsage!.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-[var(--line)] last:border-b-0 pb-3 last:pb-0">
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{item.model}</div><div className="text-xs text-[var(--text-secondary)]">{new Date(item.timestamp).toLocaleString("zh-CN")}</div></div>
                  <div className="text-sm text-[var(--foreground)]">{num(item.tokens)} tokens</div>
                  <div className="text-sm font-medium">{yuan(item.costActual)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="bg-white border border-[var(--line)] rounded-lg p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">快捷操作</h2>
          <div className="grid gap-2">
            <Link href="/dashboard/apikeys" className="notion-btn-secondary px-4 py-2.5 text-sm justify-start">创建 API Key</Link>
            <Link href="/dashboard/recharge" className="notion-btn-secondary px-4 py-2.5 text-sm justify-start">充值余额</Link>
            <Link href="/docs" className="notion-btn-secondary px-4 py-2.5 text-sm justify-start">查看 API 文档</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-lg p-5">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Icon className="w-4 h-4" />{label}</div>
      <div className="mt-3 text-2xl font-bold text-[var(--foreground)]">{value}</div>
    </div>
  );
}
