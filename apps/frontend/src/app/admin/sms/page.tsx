"use client";

/**
 * 短信管理页（Admin）
 *
 * /admin/sms — 阿里云短信服务管理
 *
 * 三个 Tab：
 * - 配置管理：AccessKey、签名、模板等配置
 * - 验证码测试：6 位数字验证码发送（使用默认模板）
 * - 自定义发送：自由编辑模板参数，支持通知类短信
 */

import * as React from "react";
import {
  getSmsConfig,
  updateSmsConfig,
  toggleSmsConfig,
  testSmsConnection,
  sendTestSms,
  type SmsConfigData,
  type UpdateSmsConfigPayload,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== Tab 定义 ============== */
const TABS = [
  { key: "config", label: "配置管理" },
  { key: "verify", label: "验证码测试" },
  { key: "custom", label: "自定义发送" },
] as const;

/* ============== 配置管理 ============== */
function ConfigPanel() {
  const [config, setConfig] = React.useState<SmsConfigData | null>(null);
  const [form, setForm] = React.useState<UpdateSmsConfigPayload>({
    display_name: "",
    access_key_id: "",
    access_key_secret: "",
    sign_name: "",
    template_code: "",
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [connResult, setConnResult] = React.useState<{ success: boolean; message: string } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getSmsConfig();
        if (data) {
          setConfig(data);
          setForm({
            display_name: data.display_name ?? "",
            access_key_id: data.access_key_id ?? "",
            access_key_secret: "",
            sign_name: data.sign_name ?? "",
            template_code: data.template_code ?? "",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (key: keyof UpdateSmsConfigPayload, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccessMsg(null);
    setConnResult(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload: UpdateSmsConfigPayload = { ...form };
      if (!payload.access_key_secret && config?.access_key_secret) {
        delete payload.access_key_secret;
      }
      const updated = await updateSmsConfig(payload);
      setConfig(updated);
      setForm((prev) => ({ ...prev, access_key_secret: "" }));
      setSuccessMsg("配置已保存");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async () => {
    setError(null);
    try {
      const updated = await toggleSmsConfig();
      setConfig(updated);
      setSuccessMsg(updated.is_enabled ? "短信服务已启用" : "短信服务已禁用");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "切换失败");
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnResult(null);
    try {
      const result = await testSmsConnection();
      setConnResult(result);
    } catch (err) {
      setConnResult({ success: false, message: err instanceof Error ? err.message : "测试失败" });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">加载配置...</p>
      </div>
    );
  }

  const isEnabled = config?.is_enabled ?? false;

  return (
    <div className="max-w-2xl">
      {/* 状态栏 */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 mb-4">
        <div>
          <div className="text-[14px] font-medium text-gray-800">
            {config ? config.display_name || "阿里云短信" : "未配置"}
          </div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            {isEnabled ? "服务运行中" : "服务已禁用"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[12px] rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isTesting ? "测试中..." : "测试连接"}
          </button>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              isEnabled ? "bg-primary" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                isEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 连接测试结果 */}
      {connResult && (
        <div
          className={`p-3 rounded-lg text-[13px] mb-4 ${
            connResult.success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {connResult.success ? "✅ " : "❌ "}{connResult.message}
        </div>
      )}

      {/* 配置表单 */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">阿里云短信配置</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">使用阿里云短信服务 API，配置后即可发送验证码和通知短信</p>
        </div>

        <div className="px-6 py-2 divide-y divide-gray-50">
          {/* AccessKey ID */}
          <div className="py-3">
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">AccessKey ID</label>
            <input
              type="text"
              value={form.access_key_id ?? ""}
              onChange={(e) => updateField("access_key_id", e.target.value)}
              placeholder="阿里云 RAM 控制台获取"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* AccessKey Secret */}
          <div className="py-3">
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">AccessKey Secret</label>
            <input
              type="password"
              value={form.access_key_secret ?? ""}
              onChange={(e) => updateField("access_key_secret", e.target.value)}
              placeholder={config?.access_key_secret ? "已设置（留空保持不变）" : "输入 AccessKey Secret"}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="text-[11px] text-gray-400 mt-1">密钥使用 AES-256-GCM 加密存储</div>
          </div>

          {/* 签名 */}
          <div className="py-3">
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">短信签名</label>
            <input
              type="text"
              value={form.sign_name ?? ""}
              onChange={(e) => updateField("sign_name", e.target.value)}
              placeholder="在阿里云短信控制台申请并通过审核"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="text-[11px] text-gray-400 mt-1">签名审核通过后方可使用</div>
          </div>

          {/* 默认模板 CODE */}
          <div className="py-3">
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">默认模板 CODE</label>
            <input
              type="text"
              value={form.template_code ?? ""}
              onChange={(e) => updateField("template_code", e.target.value)}
              placeholder="SMS_xxxxxxxx"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="text-[11px] text-gray-400 mt-1">
              用于登录/注册等系统验证码发送，也可在发送时覆盖
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {successMsg && <span className="text-[12px] text-green-600">{successMsg}</span>}
            {error && <span className="text-[12px] text-red-500">{error}</span>}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white text-[13px] rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存配置"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 验证码测试 ============== */
function VerifyPanel() {
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState(() => String(Math.floor(100000 + Math.random() * 900000)));
  const [isSending, setIsSending] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);

  const digits = code.split("");
  const isValid = phone.trim().length >= 11 && code.length === 6 && /^\d{6}$/.test(code);

  const handleSend = async () => {
    if (!isValid) return;
    setIsSending(true);
    setResult(null);
    try {
      const res = await sendTestSms(phone.trim(), undefined, JSON.stringify({ code }));
      setResult(res);
      if (res.success) {
        // 成功后刷新验证码
        setCode(String(Math.floor(100000 + Math.random() * 900000)));
      }
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "发送失败" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">验证码测试</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            使用默认模板发送 6 位数字验证码（登录/注册用）
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* 手机号 */}
          <div>
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">手机号</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="输入 11 位手机号"
              maxLength={11}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* 验证码 */}
          <div>
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">验证码</label>
            <div className="flex items-center gap-3">
              {/* 验证码数字展示 */}
              <div className="flex items-center gap-1.5">
                {digits.map((d, i) => (
                  <div
                    key={i}
                    className="w-10 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-800 tracking-widest"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCode(String(Math.floor(100000 + Math.random() * 900000)))}
                className="px-3 py-2 text-[12px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                title="换一个验证码"
              >
                换一个
              </button>
            </div>
            <div className="text-[11px] text-gray-400 mt-1.5">
              模板参数: &#123;&#34;code&#34;:&#34;{code}&#34;&#125;
            </div>
          </div>
        </div>

        {/* 发送结果 */}
        {result && (
          <div className="mx-6 mb-4">
            <div
              className={`p-3 rounded-lg text-[13px] ${
                result.success
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {result.success ? "✅ " : "❌ "}{result.message}
            </div>
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[12px] text-gray-400">
            {phone.length > 0 ? `${phone.length}/11 位` : "输入手机号"}
          </span>
          <button
            onClick={handleSend}
            disabled={!isValid || isSending}
            className="px-5 py-2 bg-primary text-white text-[13px] rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "发送中..." : "发送验证码"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 自定义发送 ============== */
function CustomPanel() {
  const [phone, setPhone] = React.useState("");
  const [signName, setSignName] = React.useState("");
  const [templateCode, setTemplateCode] = React.useState("");
  const [templateParam, setTemplateParam] = React.useState("");
  const [hasParams, setHasParams] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);

  const isValid = phone.trim().length >= 11 && templateCode.trim().length > 0;

  const handleSend = async () => {
    if (!isValid) return;
    setIsSending(true);
    setResult(null);
    try {
      const param = hasParams && templateParam.trim()
        ? templateParam.trim()
        : hasParams
        ? "{}"
        : undefined;
      const res = await sendTestSms(phone.trim(), templateCode.trim(), param);
      setResult(res);
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "发送失败" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">自定义发送</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            自由指定签名、模板和参数，支持通知/营销类短信
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* 手机号 */}
          <div>
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">手机号</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="输入 11 位手机号"
              maxLength={11}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* 签名（可选覆盖） */}
          <div>
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">
              短信签名
              <span className="text-gray-400 font-normal ml-1">（留空使用默认）</span>
            </label>
            <input
              type="text"
              value={signName}
              onChange={(e) => setSignName(e.target.value)}
              placeholder="默认配置的签名"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* 模板 CODE */}
          <div>
            <label className="block text-[13px] text-gray-800 font-medium mb-1.5">模板 CODE</label>
            <input
              type="text"
              value={templateCode}
              onChange={(e) => setTemplateCode(e.target.value.trim())}
              placeholder="SMS_xxxxxxxx"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* 模板参数 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] text-gray-800 font-medium">模板参数</label>
              <button
                type="button"
                onClick={() => setHasParams(!hasParams)}
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  hasParams ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    hasParams ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {hasParams ? (
              <>
                <textarea
                  value={templateParam}
                  onChange={(e) => setTemplateParam(e.target.value)}
                  placeholder='{"name":"张三","code":"123456"}'
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="text-[11px] text-gray-400 mt-1">
                  输入 JSON 格式的模板变量，如你的模板包含 ${"{name}"} 和 ${"{code}"}，则填 {'{"name":"张三","code":"123456"}'}
                </div>
              </>
            ) : (
              <div className="text-[12px] text-gray-400 py-2">
                无参数模式 — 适用于无变量替换的通知模板
              </div>
            )}
          </div>
        </div>

        {/* 发送结果 */}
        {result && (
          <div className="mx-6 mb-4">
            <div
              className={`p-3 rounded-lg text-[13px] ${
                result.success
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {result.success ? "✅ " : "❌ "}{result.message}
            </div>
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[12px] text-gray-400">
            {phone.length > 0 ? `${phone.length}/11 位` : "输入手机号"}
          </span>
          <button
            onClick={handleSend}
            disabled={!isValid || isSending}
            className="px-5 py-2 bg-primary text-white text-[13px] rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "发送中..." : "发送短信"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function SmsPage() {
  const [activeTab, setActiveTab] = React.useState("config");

  return (
    <AdminShell title="短信管理">
      {/* Tab 导航 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-[13px] rounded-md transition ${
              activeTab === tab.key
                ? "bg-white text-primary font-medium shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === "config" && <ConfigPanel />}
      {activeTab === "verify" && <VerifyPanel />}
      {activeTab === "custom" && <CustomPanel />}
    </AdminShell>
  );
}
