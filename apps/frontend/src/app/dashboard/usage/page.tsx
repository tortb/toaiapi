"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnalytics, type AnalyticsResponse } from "@/lib/user-api";
import { getBalanceStats, getBills, getRequestLogs, type BalanceStats, type BillItem, type RequestLogItem } from "@/lib/payment-api";

function num(value?: number) {
  return (value ?? 0).toLocaleString("zh-CN");
}

function yuan(value?: number) {
  return `¥${(value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
}

function yuanFromFen(value?: number) {
  return yuan((value ?? 0) / 100);
}

function dateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("zh-CN");
}

function width(value: number, max: number) {
  if (max <= 0) return "0%";
  return `${Math.max(4, Math.min(100, (value / max) * 100))}%`;
}

export default function UsagePage() {
  const [stats, setStats] = useState<BalanceStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBalanceStats(), getAnalytics("30d"), getBills(1, 20), getRequestLogs(1, 20)])
      .then(([statsData, analyticsData, billData, logData]) => {
        if (cancelled) return;
        setStats(statsData);
        setAnalytics(analyticsData);
        setBills(billData.items);
        setLogs(logData.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const callTrend = analytics?.callTrend ?? [];
  const modelRows = analytics?.modelCallAnalysis ?? [];
  const maxTrendTokens = useMemo(() => Math.max(...callTrend.map((item) => item.tokens), 1), [callTrend]);
  const maxTrendCalls = useMemo(() => Math.max(...callTrend.map((item) => item.calls), 1), [callTrend]);
  const maxModelCalls = useMemo(() => Math.max(...modelRows.map((item) => item.calls), 1), [modelRows]);
  const maxModelTokens = useMemo(() => Math.max(...modelRows.map((item) => item.tokens), 1), [modelRows]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="page-title">用量信息</h1>
        <p className="page-subtitle">查看请求、Token、费用、模型分布和明细记录</p>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card label="今日请求" value={num(stats?.today?.requests ?? stats?.monthlyRequests)} />
        <Card label="今日 Token" value={num(stats?.today?.tokensTotal ?? stats?.monthlyTotalTokens)} />
        <Card label="近 30 天费用" value={yuanFromFen(analytics?.summary.totalQuota)} />
        <Card label="成功率" value={stats?.performance?.successRate !== undefined ? `${stats.performance.successRate}%` : "-"} />
      </div>

      {/* Token 用量趋势 - 宽版图表 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Token 用量趋势（近 30 天）</h2>
          <span className="text-xs text-[var(--text-muted)]">悬停柱状图查看详情</span>
        </div>
        {loading ? <Empty text="加载中..." /> : callTrend.length === 0 ? <Empty text="暂无趋势数据" /> : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-1 min-w-max h-96 border-b border-[var(--line)] px-1">
              {callTrend.map((item) => (
                <div key={item.date} className="flex-1 min-w-[28px] flex flex-col items-center justify-end gap-2" title={`${item.date}\n请求: ${num(item.calls)} 次\nToken: ${num(item.tokens)}\n费用: ${yuanFromFen(item.cost)}`}>
                  <div className="w-full flex items-end justify-center gap-0.5 h-72">
                    <div className="w-3 rounded-t bg-[var(--accent)] transition-all hover:opacity-80" style={{ height: width(item.tokens, maxTrendTokens) }} />
                    <div className="w-3 rounded-t bg-emerald-500 transition-all hover:opacity-80" style={{ height: width(item.calls, maxTrendCalls) }} />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap rotate-0">{item.date.slice(5)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[var(--accent)]" />Token 消耗</span>
              <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />请求次数</span>
            </div>
          </div>
        )}
      </section>

      {/* 模型用量分析 - 并排统计图 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-white border border-[var(--line)] rounded-lg p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">API 请求次数统计</h2>
          {modelRows.length === 0 ? <Empty text="暂无模型数据" /> : (
            <div className="space-y-4">
              {modelRows.map((item) => (
                <div key={`calls-${item.model}`} className="flex items-center gap-3 text-sm" title={`${item.model}\n请求: ${num(item.calls)} 次\n费用: ${yuanFromFen(item.cost)}`}>
                  <span className="w-44 truncate font-medium text-[var(--foreground)]">{item.model}</span>
                  <div className="flex-1 h-4 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: width(item.calls, maxModelCalls) }} />
                  </div>
                  <span className="w-28 text-right text-sm text-[var(--text-secondary)]">{num(item.calls)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="bg-white border border-[var(--line)] rounded-lg p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Token 消耗统计</h2>
          {modelRows.length === 0 ? <Empty text="暂无模型数据" /> : (
            <div className="space-y-4">
              {modelRows.map((item) => (
                <div key={`tokens-${item.model}`} className="flex items-center gap-3 text-sm" title={`${item.model}\nToken: ${num(item.tokens)}\n费用: ${yuanFromFen(item.cost)}`}>
                  <span className="w-44 truncate font-medium text-[var(--foreground)]">{item.model}</span>
                  <div className="flex-1 h-4 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: width(item.tokens, maxModelTokens) }} />
                  </div>
                  <span className="w-28 text-right text-sm text-[var(--text-secondary)]">{num(item.tokens)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 请求日志 */}
      <section className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--surface-soft)] border-b border-[var(--line)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">请求日志</h2>
          <span className="text-xs text-[var(--text-muted)]">最近 20 条</span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--line)]">
              <span>时间</span><span>模型</span><span>状态</span><span>延迟</span><span>输入</span><span>输出</span><span>费用</span>
            </div>
            {loading ? <Empty text="加载中..." /> : logs.length === 0 ? <Empty text="暂无请求日志" /> : logs.map((item) => (
              <div key={item.id} className="grid grid-cols-7 px-5 py-3 text-sm border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-soft)]/50 transition-colors">
                <span className="text-[var(--text-secondary)] text-xs">{dateTime(item.createdAt)}</span>
                <span className="truncate pr-3 font-medium">{item.modelId}</span>
                <span className={`font-mono text-xs ${item.statusCode >= 400 ? "text-red-500" : "text-green-600"}`}>{item.statusCode}</span>
                <span className="text-[var(--text-secondary)]">{item.latencyMs}ms</span>
                <span className="text-[var(--text-secondary)]">{num(item.promptTokens)}</span>
                <span className="text-[var(--text-secondary)]">{num(item.completionTokens)}</span>
                <span className="font-medium">{yuanFromFen(item.cost)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 消费明细 */}
      <section className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--surface-soft)] border-b border-[var(--line)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">消费明细</h2>
          <span className="text-xs text-[var(--text-muted)]">最近 20 条</span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-8 px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--line)]">
              <span>时间</span><span>模型</span><span>端点</span><span>状态</span><span>输入</span><span>输出</span><span>费用</span><span>延迟</span>
            </div>
            {loading ? <Empty text="加载中..." /> : bills.length === 0 ? <Empty text="暂无消费明细" /> : bills.map((item) => (
              <div key={item.id} className="grid grid-cols-8 px-5 py-3 text-sm border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-soft)]/50 transition-colors">
                <span className="text-[var(--text-secondary)] text-xs">{dateTime(item.createdAt)}</span>
                <span className="truncate pr-3 font-medium">{item.modelId}</span>
                <span className="truncate pr-3 font-mono text-xs text-[var(--text-secondary)]">{item.endpoint}</span>
                <span className={`font-mono text-xs ${item.statusCode >= 400 ? "text-red-500" : "text-green-600"}`}>{item.statusCode}</span>
                <span className="text-[var(--text-secondary)]">{num(item.promptTokens)}</span>
                <span className="text-[var(--text-secondary)]">{num(item.completionTokens)}</span>
                <span className="font-medium">{yuan(item.cost)}</span>
                <span className="text-[var(--text-secondary)]">{item.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-lg p-5">
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
      <div className="mt-3 text-2xl font-bold text-[var(--foreground)]">{value}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="p-8 text-center text-sm text-[var(--text-secondary)]">{text}</div>;
}
