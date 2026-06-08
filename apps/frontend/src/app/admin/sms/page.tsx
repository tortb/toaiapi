"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save, CheckCircle, Send, Power, PowerOff } from "lucide-react";
import { getSmsConfig, updateSmsConfig, toggleSmsConfig, testSmsConnection, sendTestSms, type SmsConfigData, type UpdateSmsConfigPayload } from "@/lib/admin-api";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

export default function AdminSmsPage() {
  const [config, setConfig] = useState<SmsConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useErrorToast();
  const [success, setSuccess] = useState("");

  // 表单字段
  const [form, setForm] = useState({
    display_name: "",
    access_key_id: "",
    access_key_secret: "",
    sign_name: "",
    template_code: "",
  });

  // 测试短信
  const [testPhone, setTestPhone] = useState("");
  const [testTemplateCode, setTestTemplateCode] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError("");
    getSmsConfig()
      .then((cfg) => {
        setConfig(cfg);
        if (cfg) {
          setForm({
            display_name: cfg.display_name ?? "",
            access_key_id: cfg.access_key_id ?? "",
            access_key_secret: "",
            sign_name: cfg.sign_name ?? "",
            template_code: cfg.template_code ?? "",
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
      const payload: UpdateSmsConfigPayload = {};
      if (form.display_name !== (config?.display_name ?? "")) payload.display_name = form.display_name || undefined;
      if (form.access_key_id !== (config?.access_key_id ?? "")) payload.access_key_id = form.access_key_id || undefined;
      if (form.access_key_secret) payload.access_key_secret = form.access_key_secret;
      if (form.sign_name !== (config?.sign_name ?? "")) payload.sign_name = form.sign_name || undefined;
      if (form.template_code !== (config?.template_code ?? "")) payload.template_code = form.template_code || undefined;
      await updateSmsConfig(payload);
      setSuccess("短信配置保存成功");
      load();
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
      await toggleSmsConfig();
      setSuccess(config?.is_enabled ? "短信服务已停用" : "短信服务已启用");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function handleTestConnection() {
    setError("");
    setTestResult(null);
    setTesting(true);
    try {
      const result = await testSmsConnection();
      setTestResult(result.success ? "✅ 连接成功" : `❌ 连接失败: ${result.message}`);
    } catch (err) {
      setTestResult(`❌ 连接失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setTesting(false);
    }
  }

  async function handleSendTest() {
    if (!testPhone) return;
    setError("");
    setTestResult(null);
    setTesting(true);
    try {
      const result = await sendTestSms(testPhone, testTemplateCode || undefined);
      setTestResult(result.success ? `✅ 发送成功` : `❌ 发送失败: ${result.message}`);
    } catch (err) {
      setTestResult(`❌ 发送失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return <div className="max-w-2xl space-y-5"><h1 className="text-2xl font-bold text-[var(--foreground)]">短信配置</h1><div className="rounded-lg border border-[var(--line)] bg-white p-12 text-center text-sm text-[var(--text-secondary)]">加载中...</div></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">短信配置</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">配置阿里云短信服务，用于发送验证码等通知短信</p>
        </div>
        <button onClick={load} className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
          <RefreshCw className="h-4 w-4" />刷新
        </button>
      </div>
      {success && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}

      {/* 状态卡片 */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-5">
        <div className="flex items-center justify-between mb-4">
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
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${config?.is_enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          <span className={`w-2 h-2 rounded-full ${config?.is_enabled ? "bg-green-500" : "bg-gray-400"}`} />
          {config?.is_enabled ? "服务已启用" : "服务已停用"}
        </div>
        {config && (
          <div className="mt-4 text-xs text-[var(--text-muted)]">
            服务商: {config.name} · 最后更新: {config.updated_at ? new Date(config.updated_at).toLocaleString("zh-CN") : "-"}
          </div>
        )}
      </div>

      {/* 配置表单 */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">基本配置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">显示名称</label>
            <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="阿里云短信" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">AccessKey ID</label>
            <input value={form.access_key_id} onChange={(e) => setForm({ ...form, access_key_id: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="LTAI5t..." />
            {config?.access_key_id && <p className="mt-1 text-xs text-[var(--text-muted)]">当前值: {config.access_key_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">AccessKey Secret</label>
            <input value={form.access_key_secret} onChange={(e) => setForm({ ...form, access_key_secret: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="留空则保持原值（已脱敏存储）" type="password" />
            {config?.access_key_secret && <p className="mt-1 text-xs text-[var(--text-muted)]">当前有值（已加密存储，输入新值覆盖）</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">短信签名</label>
              <input value={form.sign_name} onChange={(e) => setForm({ ...form, sign_name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="AI助手" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">默认模板 Code</label>
              <input value={form.template_code} onChange={(e) => setForm({ ...form, template_code: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="SMS_123456789" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50">
              <Save className="h-4 w-4" />{saving ? "保存中..." : "保存配置"}
            </button>
            <button onClick={handleTestConnection} disabled={testing} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
              <CheckCircle className="h-4 w-4" />{testing ? "测试中..." : "测试连接"}
            </button>
          </div>
        </div>
      </div>

      {/* 发送测试短信 */}
      <div className="rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">发送测试短信</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">手机号</label>
              <input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="13800138000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">模板 Code（可选）</label>
              <input value={testTemplateCode} onChange={(e) => setTestTemplateCode(e.target.value)} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="默认使用上方配置" />
            </div>
          </div>
          <button onClick={handleSendTest} disabled={testing || !testPhone} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-50">
            <Send className="h-4 w-4" />{testing ? "发送中..." : "发送测试短信"}
          </button>
          {testResult && (
            <div className={`rounded-md px-3 py-2 text-sm ${testResult.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
