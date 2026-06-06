"use client";

/**
 * 支付配置管理（Admin）
 *
 * /admin/payment-configs — 管理 EPay、支付宝、微信支付网关配置
 */

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getPaymentConfigs,
  updatePaymentConfig,
  togglePaymentConfig,
  type PaymentConfigData,
  type UpdatePaymentConfigPayload,
} from "@/lib/admin-api";

/* ============== 网关显示信息 ============== */
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "boolean";
  placeholder?: string;
  required?: boolean;
  tip?: string;
}

const GATEWAY_INFO: Record<string, { label: string; icon: string; color: string; description: string; fields: FieldDef[] }> = {
  epay: {
    label: "易支付",
    icon: "💰",
    color: "bg-green-50 border-green-200",
    description: "易支付第三方支付平台，支持支付宝、微信、QQ 支付",
    fields: [
      { key: "merchant_id", label: "商户 ID (PID)", type: "text", placeholder: "10001", required: true },
      { key: "merchant_key", label: "商户密钥 (Key)", type: "password", placeholder: "输入商户密钥", required: true },
      { key: "api_endpoint", label: "API 地址", type: "url", placeholder: "https://pay.example.com", required: true },
      { key: "notify_url", label: "异步通知地址", type: "url", placeholder: "https://your-domain.com/api/v1/payment/notify/epay" },
      { key: "return_url", label: "同步跳转地址", type: "url", placeholder: "https://your-domain.com/recharge?success=true" },
      { key: "extra_config.enable_alipay", label: "启用支付宝", type: "boolean", tip: "通过易支付使用支付宝支付" },
      { key: "extra_config.enable_wxpay", label: "启用微信支付", type: "boolean", tip: "通过易支付使用微信支付" },
      { key: "extra_config.enable_qqpay", label: "启用QQ支付", type: "boolean", tip: "通过易支付使用QQ钱包支付" },
    ],
  },
  alipay: {
    label: "支付宝",
    icon: "🔷",
    color: "bg-blue-50 border-blue-200",
    description: "支付宝网页支付（电脑网站支付），使用 RSA2-SHA256 签名",
    fields: [
      { key: "merchant_id", label: "应用 ID (AppID)", type: "text", placeholder: "2021000000000000", required: true },
      { key: "merchant_secret", label: "应用私钥", type: "password", placeholder: "输入应用私钥（RSA2）", required: true },
      { key: "merchant_key", label: "支付宝公钥", type: "password", placeholder: "输入支付宝公钥（验签用）", required: true },
      { key: "notify_url", label: "异步通知地址", type: "url", placeholder: "https://your-domain.com/api/v1/payment/notify/alipay" },
      { key: "return_url", label: "同步跳转地址", type: "url", placeholder: "https://your-domain.com/recharge?success=true" },
    ],
  },
  wechatpay: {
    label: "微信支付",
    icon: "🟢",
    color: "bg-emerald-50 border-emerald-200",
    description: "微信支付 Native（扫码）和 H5 支付，使用 API v3",
    fields: [
      { key: "merchant_id", label: "商户号 (mchid)", type: "text", placeholder: "1900000000", required: true },
      { key: "merchant_secret", label: "商户 API 私钥", type: "password", placeholder: "输入商户 API 私钥", required: true },
      { key: "merchant_key", label: "API v3 密钥", type: "password", placeholder: "输入 API v3 密钥", required: true },
      { key: "notify_url", label: "异步通知地址", type: "url", placeholder: "https://your-domain.com/api/v1/payment/notify/wechatpay" },
      { key: "extra_config.appId", label: "公众号/小程序 AppID", type: "text", placeholder: "wx1234567890abcdef" },
    ],
  },
};

/* ============== 配置编辑弹窗 ============== */
function ConfigEditModal({
  config,
  onClose,
  onSaved,
}: {
  config: PaymentConfigData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const info = GATEWAY_INFO[config.name];
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initial: Record<string, string> = {};
    for (const field of info.fields) {
      if (field.key.startsWith("extra_config.")) {
        const subKey = field.key.replace("extra_config.", "");
        const val = (config.extra_config as any)?.[subKey];
        initial[field.key] = field.type === "boolean" ? (val === true || val === "true" ? "true" : "false") : (val || "");
      } else {
        initial[field.key] = (config as any)[field.key] || "";
      }
    }
    setForm(initial);
  }, [config, info]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: UpdatePaymentConfigPayload = {};
      for (const field of info.fields) {
        const value = form[field.key]?.trim() || "";
        if (field.key.startsWith("extra_config.")) {
          if (!payload.extra_config) payload.extra_config = {};
          const subKey = field.key.replace("extra_config.", "");
          payload.extra_config[subKey] = field.type === "boolean" ? value === "true" : value;
        } else {
          (payload as any)[field.key] = value;
        }
      }
      await updatePaymentConfig(config.name, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {info.icon} {info.label}配置
        </h3>
        <p className="text-sm text-gray-500 mb-4">{info.description}</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="space-y-4">
          {info.fields.map((field) => (
            <div key={field.key}>
              {field.type === "boolean" ? (
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{field.label}</label>
                    {field.tip && <p className="text-xs text-gray-400 mt-0.5">{field.tip}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, [field.key]: prev[field.key] === "true" ? "false" : "true" }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form[field.key] === "true" ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form[field.key] === "true" ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function PaymentConfigsPage() {
  const [configs, setConfigs] = React.useState<PaymentConfigData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingConfig, setEditingConfig] = React.useState<PaymentConfigData | null>(null);

  const loadConfigs = React.useCallback(async () => {
    try {
      const data = await getPaymentConfigs();
      setConfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    loadConfigs().finally(() => setIsLoading(false));
  }, [loadConfigs]);

  const handleToggle = async (name: string) => {
    try {
      await togglePaymentConfig(name);
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="支付配置">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="支付配置">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">支付配置</h1>
        <p className="text-sm text-gray-500 mt-1">管理支付网关的商户信息和密钥配置</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-4">
        {Object.entries(GATEWAY_INFO).map(([name, info]) => {
          const config = configs.find((c) => c.name === name);
          const isEnabled = config?.is_enabled ?? false;

          return (
            <div
              key={name}
              className={`rounded-lg border p-6 ${isEnabled ? info.color : "bg-gray-50 border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{info.label}</h3>
                    <p className="text-sm text-gray-500">{info.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${isEnabled ? "text-success" : "text-gray-400"}`}>
                    {isEnabled ? "已启用" : "已禁用"}
                  </span>
                  <button
                    onClick={() => handleToggle(name)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 配置摘要 */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">商户 ID：</span>
                  <span className="text-gray-800 font-mono">{config?.merchant_id || "未配置"}</span>
                </div>
                <div>
                  <span className="text-gray-500">API 地址：</span>
                  <span className="text-gray-800 font-mono text-xs">{config?.api_endpoint || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">通知地址：</span>
                  <span className="text-gray-800 font-mono text-xs">{config?.notify_url || "未配置"}</span>
                </div>
                <div>
                  <span className="text-gray-500">密钥状态：</span>
                  <span className={config?.merchant_key ? "text-success" : "text-gray-400"}>
                    {config?.merchant_key ? "已配置" : "未配置"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => config && setEditingConfig(config)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                编辑配置
              </button>
            </div>
          );
        })}
      </div>

      {/* 提示信息 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">配置说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>易支付</strong>：需要 PID、密钥和 API 地址，支持支付宝/微信/QQ 支付</li>
          <li>• <strong>支付宝</strong>：需要应用 ID、应用私钥和支付宝公钥（RSA2 签名）</li>
          <li>• <strong>微信支付</strong>：需要商户号、API 私钥和 API v3 密钥，需先在微信支付平台获取平台证书</li>
          <li>• 敏感字段（密钥、私钥）保存后会自动加密存储，页面显示脱敏值</li>
        </ul>
      </div>

      {/* 编辑弹窗 */}
      {editingConfig && (
        <ConfigEditModal
          config={editingConfig}
          onClose={() => setEditingConfig(null)}
          onSaved={() => {
            setEditingConfig(null);
            loadConfigs();
          }}
        />
      )}
    </AdminShell>
  );
}
