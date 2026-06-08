"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle, Send, Eye, EyeOff, Power, PowerOff, RefreshCw, ArrowLeft } from "lucide-react";
import { getSmtpConfig, updateSmtpConfig, toggleSmtpConfig, testSmtpConnection, sendTestEmail, type SmtpConfigData, type UpdateSmtpConfigPayload } from "@/lib/admin-api";
import Link from "next/link";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

export default function AdminEmailSettingsPage() {
  const [config, setConfig] = useState<SmtpConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useErrorToast();
  const [success, setSuccess] = useState("");

  // 表单字段
  const [form, setForm] = useState({
    host: "", port: 587, secure: false,
    username: "", password: "",
    from_name: "", from_address: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // 测试连接
  const [testConnecting, setTestConnecting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // 测试邮件
  const [testEmail, setTestEmail] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError("");
    getSmtpConfig()
      .then((cfg) => {
        setConfig(cfg);
        if (cfg) {
          setForm({
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
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: UpdateSmtpConfigPayload = {};
      if (form.host !== (config?.host ?? "")) payload.host = form.host || undefined;
      if (form.port !== (config?.port ?? 587)) payload.port = form.port;
      if (form.secure !== (config?.secure ?? false)) payload.secure = form.secure;
      if (form.username !== (config?.username ?? "")) payload.username = form.username || undefined;
      if (form.password) payload.password = form.password;
      if (form.from_name !== (config?.from_name ?? "")) payload.from_name = form.from_name || undefined;
      if (form.from_address !== (config?.from_address ?? "")) payload.from_address = form.from_address || undefined;
      await updateSmtpConfig(payload);
      setSuccess("邮件配置已保存");
      // 重新加载获取最新状态（密码字段清空）
      const cfg = await getSmtpConfig();
      setConfig(cfg);
      setForm((f) => ({ ...f, password: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    setError("");
    setSuccess("");
    try {
      await toggleSmtpConfig();
      const cfg = await getSmtpConfig();
      setConfig(cfg);
      setSuccess(config?.is_enabled ? "邮件服务已停用" : "邮件服务已启用");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function handleTestConnection() {
    setTestConnecting(true);
    setTestResult(null);
    try {
      const result = await testSmtpConnection();
      setTestResult(result.success ? "✅ 连接成功" : `❌ 连接失败: ${result.message}`);
    } catch (err) {
      setTestResult(`❌ 连接失败: ${err instanceof Error ? err.message : "未知错误"}`);
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

  if (loading) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">邮件设置</h1>
        <div className="rounded-lg border border-[var(--line)] bg-white p-12 text-center text-sm text-[var(--text-secondary)]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/settings" className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] mb-2">
            <ArrowLeft className="h-3 w-3" />返回系统设置
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">邮件设置</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">配置 SMTP 邮件服务，用于发送通知和验证邮件。授权码（密码）使用 AES-256-GCM 加密存储。</p>
        </div>
        <button onClick={load} className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
          <RefreshCw className="h-4 w-4" />刷新
        </button>
      </div>
      {success && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}

      {/* 服务状态 */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">服务状态</h2>
          <button
            onClick={handleToggle}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              config?.is_enabled
                ? "bg-green-50 text-green-700 hover:bg-green-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {config?.is_enabled ? <><PowerOff className="h-3.5 w-3.5" />停用</> : <><Power className="h-3.5 w-3.5" />启用</>}
          </button>
        </div>
        {config && (
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.is_enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              <span className={`w-2 h-2 rounded-full ${config.is_enabled ? "bg-green-500" : "bg-gray-400"}`} />
              {config.is_enabled ? "服务已启用" : "服务已停用"}
            </span>
            {config.host && (
              <span className="text-xs text-[var(--text-muted)]">
                {config.host}:{config.port} · {config.secure ? "TLS" : "明文"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* SMTP 配置 */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">SMTP 服务器</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">SMTP 服务器地址</label>
            <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="smtp.gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">端口</label>
            <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.secure} onChange={(e) => setForm({ ...form, secure: e.target.checked })} className="rounded border-[var(--line)]" />
              <span className="text-sm text-[var(--foreground)]">使用 TLS/SSL 加密连接</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">SMTP 用户名</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="user@example.com" />
            {config?.username && <p className="mt-0.5 text-xs text-[var(--text-muted)]">当前值: {config.username}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              授权码 / SMTP 密码 <span className="text-xs text-amber-600 font-normal">（AES-256-GCM 加密存储）</span>
            </label>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 text-xs ${config?.password ? "text-green-600" : "text-amber-600"}`}>
                <span className={`w-2 h-2 rounded-full ${config?.password ? "bg-green-500" : "bg-amber-500"}`} />
                {config?.password ? "已设置授权码" : "未设置授权码 — 首次配置必填"}
              </span>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 pr-8 text-sm outline-none focus:border-[var(--accent)]" placeholder={config?.password ? "留空则保持原加密值，输入新值覆盖" : "必填：SMTP 授权码"} />
              <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">发件人名称</label>
            <input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="AI Platform" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">发件人邮箱地址</label>
            <input value={form.from_address} onChange={(e) => setForm({ ...form, from_address: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="noreply@example.com" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--line)]">
          <button onClick={handleSave} disabled={saving || !form.host || (!config?.password && !form.password)} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-60">
            <Save className="h-4 w-4" />{saving ? "保存中..." : "保存配置"}
          </button>
          <button onClick={handleTestConnection} disabled={testConnecting} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
            <CheckCircle className="h-4 w-4" />{testConnecting ? "测试中..." : "测试连接"}
          </button>
          {testResult && (
            <span className={`text-sm ${testResult.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{testResult}</span>
          )}
        </div>
      </div>

      {/* 发送测试邮件 */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">发送测试邮件</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">保存配置后，发送一封测试邮件到指定邮箱地址，验证 SMTP 配置是否正常工作。</p>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 max-w-sm rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            placeholder="输入测试邮箱地址"
          />
          <button onClick={handleSendTestEmail} disabled={testEmailSending || !testEmail || !config?.is_enabled} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-50" title={!config?.is_enabled ? "请先启用邮件服务" : ""}>
            <Send className="h-4 w-4" />{testEmailSending ? "发送中..." : "发送"}
          </button>
        </div>
        {testEmailResult && (
          <p className={`mt-2 text-sm ${testEmailResult.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{testEmailResult}</p>
        )}
      </div>
    </div>
  );
}
