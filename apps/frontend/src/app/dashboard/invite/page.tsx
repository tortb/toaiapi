"use client";

import { useEffect, useState } from "react";
import { Copy, Gift, Link as LinkIcon, Users } from "lucide-react";
import { getInviteStats, type InviteStats } from "@/lib/payment-api";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

function yuanFromFen(value: number) {
  return `¥${(value / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvitePage() {
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [, setError] = useErrorToast();

  useEffect(() => {
    getInviteStats().then(setStats).catch((err) => setError(err instanceof Error ? err.message : "加载失败"));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="page-title">邀请奖励</h1><p className="page-subtitle">分享邀请链接，查看奖励和邀请人数</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat icon={Users} label="邀请人数" value={String(stats?.inviteCount ?? 0)} />
        <Stat icon={Gift} label="累计奖励" value={yuanFromFen(stats?.totalReward ?? 0)} />
        <Stat icon={Gift} label="待确认奖励" value={yuanFromFen(stats?.pendingReward ?? 0)} />
      </div>
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><LinkIcon className="w-4 h-4" />邀请链接</h2>
        {stats?.inviteUrl ? (
          <div className="flex gap-2"><code className="flex-1 overflow-x-auto rounded-md bg-[var(--surface-soft)] px-3 py-2 text-xs">{stats.inviteUrl}</code><button onClick={() => navigator.clipboard.writeText(stats.inviteUrl)} className="notion-btn-secondary px-3"><Copy className="w-4 h-4" /></button></div>
        ) : <div className="text-sm text-[var(--text-secondary)]">暂无邀请链接</div>}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="bg-white border border-[var(--line)] rounded-lg p-5"><div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Icon className="w-4 h-4" />{label}</div><div className="mt-3 text-2xl font-bold">{value}</div></div>;
}
