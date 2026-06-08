"use client";

import { useEffect, useState } from "react";
import { getUser, type UserDetailData } from "@/lib/admin-api";
import { formatTableDate, formatYuan } from "@/lib/utils";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<UserDetailData | null>(null);
  const [, setError] = useErrorToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    params.then(({ id }) => getUser(id)).then((user) => {
      if (!cancelled) setData(user);
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [params]);

  if (loading) return <div className="text-sm text-[var(--text-secondary)]">加载中...</div>;
  if (!data) return <div className="text-sm text-[var(--text-secondary)]">用户不存在</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-[var(--foreground)]">用户详情</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">{data.email} · {data.role} · {data.status}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="可用余额" value={formatYuan(data.balance?.available)} />
        <Stat label="API Key" value={data.stats.apiKeyCount.toLocaleString("zh-CN")} />
        <Stat label="请求数" value={data.stats.requestCount.toLocaleString("zh-CN")} />
        <Stat label="月消费" value={formatYuan(data.stats.monthlySpend)} />
      </div>
      <Section title="近期订单" empty={data.recentOrders.length === 0}>{data.recentOrders.map((item) => <Row key={item.id} cells={[item.orderNo, formatYuan(item.amount), item.status, formatTableDate(item.createdAt)]} />)}</Section>
      <Section title="近期交易" empty={data.recentTransactions.length === 0}>{data.recentTransactions.map((item) => <Row key={item.id} cells={[item.type, formatYuan(item.amount), formatYuan(item.balanceAfter), item.remark || "-", formatTableDate(item.createdAt)]} />)}</Section>
      <Section title="近期 API Key" empty={data.recentApiKeys.length === 0}>{data.recentApiKeys.map((item) => <Row key={item.id} cells={[item.name || "-", item.keyPrefix, item.isActive ? "启用" : "停用", item.totalRequests.toLocaleString("zh-CN"), formatTableDate(item.createdAt)]} />)}</Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-white border border-[var(--line)] rounded-lg p-4"><div className="text-xs text-[var(--text-secondary)]">{label}</div><div className="mt-2 text-xl font-semibold text-[var(--foreground)]">{value}</div></div>;
}

function Section({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return <section className="bg-white border border-[var(--line)] rounded-lg overflow-hidden"><div className="px-4 py-3 bg-[var(--surface-soft)] text-sm font-semibold text-[var(--foreground)]">{title}</div>{empty ? <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">暂无数据</div> : children}</section>;
}

function Row({ cells }: { cells: string[] }) {
  return <div className="flex gap-3 px-4 py-3 border-t border-[var(--line)] text-sm">{cells.map((cell, index) => <div key={index} className="min-w-0 flex-1 truncate">{cell}</div>)}</div>;
}
