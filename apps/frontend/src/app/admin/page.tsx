"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, Clock, DollarSign, Globe, Mail, Server, Shield, TrendingUp, Zap, Settings } from "lucide-react";
import { getDashboard, getOrderStatusLabel, getSmtpConfig, type DashboardData, type SmtpConfigData } from "@/lib/admin-api";

function yuan(fen: number) {
  return `¥${(fen / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function num(value: number) {
  return value.toLocaleString("zh-CN");
}

function formatPct(value: number | null | undefined) {
  if (value == null) return "-";
  return `${value}%`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  // 邮件服务状态
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfigData | null>(null);
  const [smtpLoading, setSmtpLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).catch((err) => setError(err instanceof Error ? err.message : "加载失败"));
  }, []);

  // 加载 SMTP 配置（仅用于状态展示）
  useEffect(() => {
    getSmtpConfig()
      .then((cfg) => setSmtpConfig(cfg))
      .catch(() => {})
      .finally(() => setSmtpLoading(false));
  }, []);

  const stats: [string, string, string][] = data ? [
    ["注册用户", num(data.metrics.totalUsers), `${data.metrics.totalUsersGrowth}%`],
    ["总充值", yuan(data.metrics.totalRecharge), `${data.metrics.totalRechargeGrowth}%`],
    ["总消费", yuan(data.metrics.totalConsumption), `${data.metrics.totalConsumptionGrowth}%`],
    ["总调用", num(data.metrics.totalRequests), `${data.metrics.totalRequestsGrowth}%`],
    ["总余额", yuan(data.metrics.totalBalance), "-"],
  ] : [["注册用户", "-", "-"], ["总充值", "-", "-"], ["总消费", "-", "-"], ["总调用", "-", "-"], ["总余额", "-", "-"]];

  const perf = data?.performance;
  const apiInfo = data?.apiInfo;
  const announcements = data?.announcements ?? [];
  const channelStatus = data?.channelStatus ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">控制台</h1>
        <span className="text-sm text-[var(--text-muted)] flex-1">系统概览与关键指标</span>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {/* 基础指标 */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map(([label, value, change]) => (
          <div key={label} className="bg-white border border-[var(--line)] rounded-lg p-4">
            <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
            <div className="text-xl font-bold text-[var(--foreground)] mb-1">{value}</div>
            <div className={`text-xs font-medium ${change.startsWith("-") ? "text-red-500" : change !== "-" ? "text-green-600" : "text-[var(--text-muted)]"}`}>{change}</div>
          </div>
        ))}
      </div>

      {/* 用量概览 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">用量概览</h2>
          <span className="text-xs text-[var(--text-muted)] ml-1">监控余额、用量和请求量</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-[var(--line)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Zap className="w-4 h-4" />近 24 小时消耗</div>
            <div className="mt-2 text-xl font-bold text-[var(--foreground)]">{perf ? yuan(perf.totalConsumption24h) : "-"}</div>
            <div className="text-xs text-[var(--text-muted)]">近 24 小时消耗量 (USD)</div>
          </div>
          <div className="rounded-lg border border-[var(--line)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><DollarSign className="w-4 h-4" />历史使用情况</div>
            <div className="mt-2 text-xl font-bold text-[var(--foreground)]">{data ? yuan(data.metrics.totalConsumption) : "-"}</div>
            <div className="text-xs text-[var(--text-muted)]">总消耗 (USD)</div>
          </div>
          <div className="rounded-lg border border-[var(--line)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><BarChart3 className="w-4 h-4" />请求计数</div>
            <div className="mt-2 text-xl font-bold text-[var(--foreground)]">{data ? num(data.metrics.totalRequests) : "-"}</div>
            <div className="text-xs text-[var(--text-muted)]">总请求数</div>
          </div>
          <div className="rounded-lg border border-[var(--line)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Shield className="w-4 h-4" />剩余额度</div>
            <div className={`mt-2 text-xl font-bold ${data && data.metrics.totalBalance > 0 ? "text-green-600" : "text-red-500"}`}>
              {data ? yuan(data.metrics.totalBalance) : "-"}
              {data && <span className="text-xs font-normal text-green-600 ml-2">正常</span>}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              近 24 小时消耗 {perf ? yuan(perf.totalConsumption24h) : "-"}
            </div>
          </div>
        </div>
      </section>

      {/* 性能健康 + API 信息 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-white border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">性能健康</h2>
            <span className="text-xs text-[var(--text-muted)] ml-1">最近 24 小时的性能指标</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--foreground)]">{formatPct(perf?.successRate)}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">成功率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--foreground)]">{perf?.avgLatencyMs != null ? `${perf.avgLatencyMs}ms` : "-"}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">平均延迟</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--foreground)]">{perf?.totalRequests24h != null ? num(perf.totalRequests24h) : "-"}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">吞吐量</div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">API 信息</h2>
            <span className="text-xs text-[var(--text-muted)] ml-1">已配置路由和延迟检测</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--foreground)]">{apiInfo?.totalModels ?? "-"}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">模型</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--foreground)]">{apiInfo?.totalChannels ?? "-"}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">渠道</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--foreground)]">{apiInfo?.activeChannels ?? "-"}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">活跃渠道</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--foreground)]">{apiInfo?.totalProviders ?? "-"}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">供应商</div>
            </div>
          </div>
          {(!apiInfo?.totalModels && !apiInfo?.totalChannels) && (
            <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">未配置 API 路由</div>
          )}
        </section>
      </div>

      {/* 调用趋势 */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 bg-white border border-[var(--line)] rounded-lg p-6">
          <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">调用趋势</h3>
          {(data?.callStats ?? []).length === 0 ? (
            <div className="h-[200px] bg-[var(--surface-soft)] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
          ) : (
            <div className="space-y-2">
              {data!.callStats.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <div className="w-20 text-[var(--text-secondary)]">{item.label}</div>
                  <div className="flex-1 h-2 bg-[var(--surface-soft)] rounded overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded" style={{ width: `${Math.min(100, item.requests / Math.max(...data!.callStats.map((x) => x.requests), 1) * 100)}%` }} />
                  </div>
                  <div className="w-24 text-right text-[var(--text-secondary)]">{num(item.requests)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 最近订单 */}
        <div className="xl:w-[420px] bg-white border border-[var(--line)] rounded-lg p-6">
          <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">最近订单</h3>
          {(data?.recentOrders ?? []).length === 0 ? (
            <div className="text-sm text-[var(--text-secondary)]">暂无订单</div>
          ) : (
            data!.recentOrders.map((order) => {
              const status = getOrderStatusLabel(order.status);
              return (
                <div key={order.id} className="flex items-center gap-2 py-2 border-b border-[var(--line)] last:border-b-0">
                  <span className="text-xs font-mono text-[var(--foreground)] flex-1 truncate">{order.orderNo}</span>
                  <span className="text-xs text-[var(--text-secondary)] w-28 truncate">{order.userEmail}</span>
                  <span className="text-xs font-medium text-[var(--foreground)] w-20">{yuan(order.amount)}</span>
                  <span className={`text-xs font-medium w-20 text-right ${status.color}`}>{status.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 公告 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">公告</h2>
          <span className="text-xs text-[var(--text-muted)] ml-1">最新平台更新和通知</span>
        </div>
        {announcements.length === 0 ? (
          <div className="rounded-lg bg-[var(--surface-soft)] p-6 text-center text-sm text-[var(--text-secondary)]">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-[var(--text-muted)]" />
            目前暂无公告
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item, index) => (
              <div key={index} className="rounded-lg border border-[var(--line)] p-4">
                <div className="text-sm font-medium text-[var(--foreground)]">{item.title}</div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">{item.content}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">常见问答</h2>
          <span className="text-xs text-[var(--text-muted)] ml-1">访问与计费常见问题解答</span>
        </div>
        <div className="rounded-lg bg-[var(--surface-soft)] p-6 text-center text-sm text-[var(--text-secondary)]">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-[var(--text-muted)]" />
          暂无 FAQ 条目
        </div>
      </section>

      {/* ✉️ 邮件服务状态 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">邮件服务</h2>
          </div>
          <Link
            href="/admin/settings/email"
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />配置
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-3">
          {smtpLoading ? (
            <span className="text-xs text-[var(--text-muted)]">加载中...</span>
          ) : smtpConfig ? (
            <>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${smtpConfig.is_enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${smtpConfig.is_enabled ? "bg-green-500" : "bg-gray-400"}`} />
                {smtpConfig.is_enabled ? "已启用" : "已停用"}
              </span>
              {smtpConfig.host && <span className="text-xs text-[var(--text-muted)]">{smtpConfig.host}:{smtpConfig.port}</span>}
            </>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">未配置 — 前往邮件设置页面配置 SMTP</span>
          )}
        </div>
      </section>
    </div>
  );
}
