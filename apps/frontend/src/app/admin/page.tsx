"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Clock, DollarSign, Globe, Mail, Server, Shield, TrendingUp, Zap, CheckCircle, Send, Save, Eye, EyeOff, Power, PowerOff } from "lucide-react";
import { getDashboard, getOrderStatusLabel, getSmtpConfig, updateSmtpConfig, toggleSmtpConfig, testSmtpConnection, sendTestEmail, type DashboardData, type SmtpConfigData, type UpdateSmtpConfigPayload } from "@/lib/admin-api";

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

  // 邮件设置状态
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfigData | null>(null);
  const [smtpLoading, setSmtpLoading] = useState(true);
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpError, setSmtpError] = useState("");
  const [smtpSuccess, setSmtpSuccess] = useState("");
  const [smtpForm, setSmtpForm] = useState({
    host: "", port: 587, secure: false, username: "", password: "",
    from_name: "", from_address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);
  const [testConnecting, setTestConnecting] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch((err) => setError(err instanceof Error ? err.message : "加载失败"));
  }, []);

  // 加载 SMTP 配置
  useEffect(() => {
    getSmtpConfig()
      .then((cfg) => {
        setSmtpConfig(cfg);
        if (cfg) {
          setSmtpForm({
            host: cfg.host ?? "",
            port: cfg.port ?? 587,
            secure: cfg.secure ?? false,
            username: cfg.username ?? "",
            password: "",
            from_name: cfg.from_name ?? "",
            from_address: cfg.from_address ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setSmtpLoading(false));
  }, []);

  // SMTP 操作
  async function handleSaveSmtp() {
    setSmtpSaving(true);
    setSmtpError("");
    setSmtpSuccess("");
    try {
      const payload: UpdateSmtpConfigPayload = {};
      if (smtpForm.host !== (smtpConfig?.host ?? "")) payload.host = smtpForm.host || undefined;
      if (smtpForm.port !== (smtpConfig?.port ?? 587)) payload.port = smtpForm.port;
      if (smtpForm.secure !== (smtpConfig?.secure ?? false)) payload.secure = smtpForm.secure;
      if (smtpForm.username !== (smtpConfig?.username ?? "")) payload.username = smtpForm.username || undefined;
      if (smtpForm.password) payload.password = smtpForm.password;
      if (smtpForm.from_name !== (smtpConfig?.from_name ?? "")) payload.from_name = smtpForm.from_name || undefined;
      if (smtpForm.from_address !== (smtpConfig?.from_address ?? "")) payload.from_address = smtpForm.from_address || undefined;
      await updateSmtpConfig(payload);
      setSmtpSuccess("SMTP 配置已保存");
      // 重新加载
      const cfg = await getSmtpConfig();
      setSmtpConfig(cfg);
      if (cfg) setSmtpForm((f) => ({ ...f, password: "" }));
    } catch (err) {
      setSmtpError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSmtpSaving(false);
    }
  }

  async function handleToggleSmtp() {
    setSmtpError("");
    setSmtpSuccess("");
    try {
      await toggleSmtpConfig();
      const cfg = await getSmtpConfig();
      setSmtpConfig(cfg);
      setSmtpSuccess(smtpConfig?.is_enabled ? "邮件服务已停用" : "邮件服务已启用");
    } catch (err) {
      setSmtpError(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function handleTestSmtpConnection() {
    setTestConnecting(true);
    setTestConnectionResult(null);
    try {
      const result = await testSmtpConnection();
      setTestConnectionResult(result.success ? "✅ 连接成功" : `❌ 连接失败: ${result.message}`);
    } catch (err) {
      setTestConnectionResult(`❌ 连接失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setTestConnecting(false);
    }
  }

  async function handleSendTestEmail() {
    if (!testEmail) return;
    setTestEmailSending(true);
    setTestEmailResult(null);
    try {
      const result = await sendTestEmail(testEmail);
      setTestEmailResult(result.success ? "✅ 发送成功" : `❌ 发送失败: ${result.message}`);
    } catch (err) {
      setTestEmailResult(`❌ 发送失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setTestEmailSending(false);
    }
  }

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

      {/* ✉️ 邮件设置 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">邮件设置</h2>
            <span className="text-xs text-[var(--text-muted)] ml-1">配置 SMTP 邮件服务，用于发送通知和验证邮件</span>
          </div>
          <div className="flex items-center gap-2">
            {smtpConfig && (
              <button
                onClick={handleToggleSmtp}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  smtpConfig.is_enabled
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {smtpConfig.is_enabled ? <><PowerOff className="h-3 w-3" />停用</> : <><Power className="h-3 w-3" />启用</>}
              </button>
            )}
          </div>
        </div>

        {smtpLoading ? (
          <div className="text-sm text-[var(--text-secondary)]">加载中...</div>
        ) : (
          <>
            {smtpError && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{smtpError}</div>}
            {smtpSuccess && <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{smtpSuccess}</div>}

            {smtpConfig && (
              <div className="mb-4 flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${smtpConfig.is_enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${smtpConfig.is_enabled ? "bg-green-500" : "bg-gray-400"}`} />
                  {smtpConfig.is_enabled ? "邮件服务已启用" : "邮件服务已停用"}
                </span>
                {smtpConfig.host && <span className="text-xs text-[var(--text-muted)]">服务器: {smtpConfig.host}:{smtpConfig.port}</span>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">SMTP 服务器</label>
                <input value={smtpForm.host} onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">端口</label>
                <input type="number" value={smtpForm.port} onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 pb-2 cursor-pointer">
                  <input type="checkbox" checked={smtpForm.secure} onChange={(e) => setSmtpForm({ ...smtpForm, secure: e.target.checked })} className="rounded border-[var(--line)]" />
                  <span className="text-xs text-[var(--foreground)]">TLS/SSL</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">发件人名称</label>
                <input value={smtpForm.from_name} onChange={(e) => setSmtpForm({ ...smtpForm, from_name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="AI Platform" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">发件人邮箱</label>
                <input value={smtpForm.from_address} onChange={(e) => setSmtpForm({ ...smtpForm, from_address: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="noreply@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">SMTP 用户名</label>
                <input value={smtpForm.username} onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  SMTP 密码 <span className="text-[var(--text-muted)] font-normal">（留空不修改）</span>
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={smtpForm.password} onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 pr-8 text-sm outline-none focus:border-[var(--accent)]" placeholder="加密存储" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)]">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={handleSaveSmtp} disabled={smtpSaving || !smtpForm.host} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50">
                <Save className="h-4 w-4" />{smtpSaving ? "保存中..." : "保存配置"}
              </button>
              <button onClick={handleTestSmtpConnection} disabled={testConnecting} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
                <CheckCircle className="h-4 w-4" />{testConnecting ? "测试中..." : "测试连接"}
              </button>
              {testConnectionResult && (
                <span className={`text-xs ${testConnectionResult.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{testConnectionResult}</span>
              )}
            </div>

            {/* 发送测试邮件 */}
            <div className="mt-4 pt-4 border-t border-[var(--line)]">
              <label className="block text-xs font-medium text-[var(--foreground)] mb-2">发送测试邮件</label>
              <div className="flex items-center gap-2">
                <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="flex-1 rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="输入测试邮箱地址" />
                <button onClick={handleSendTestEmail} disabled={testEmailSending || !testEmail} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-50">
                  <Send className="h-4 w-4" />{testEmailSending ? "发送中..." : "发送"}
                </button>
              </div>
              {testEmailResult && (
                <p className={`mt-2 text-xs ${testEmailResult.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{testEmailResult}</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
