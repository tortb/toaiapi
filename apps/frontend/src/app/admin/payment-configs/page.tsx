"use client";

/**
 * 计费与支付配置（Admin）
 *
 * /admin/payment-configs — 多Tab管理：额度设置、模型定价、分组定价、支付网关、签到奖励
 */

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button, Tabs, Skeleton, useToast } from "@/components/ui";
import {
  getPaymentConfigs,
  updatePaymentConfig,
  togglePaymentConfig,
  type PaymentConfigData,
  type UpdatePaymentConfigPayload,
} from "@/lib/admin-api";
import { QuotaSettingsTab } from "@/components/admin/payment-configs/QuotaSettingsTab";
import { CheckInRewardsTab } from "@/components/admin/payment-configs/CheckInRewardsTab";

const TABS = [
  { key: "quota", label: "额度设置" },
  { key: "pricing", label: "模型定价" },
  { key: "group", label: "分组定价" },
  { key: "gateway", label: "支付网关" },
  { key: "checkin", label: "签到奖励" },
];

/* ============== 支付网关配置 ============== */

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "boolean";
  placeholder?: string;
  required?: boolean;
  tip?: string;
}

const GATEWAY_INFO: Record<
  string,
  {
    label: string;
    icon: string;
    color: string;
    description: string;
    fields: FieldDef[];
  }
> = {
  epay: {
    label: "易支付",
    icon: "💰",
    color: "bg-green-50 border-green-200",
    description: "易支付第三方支付平台（MD5 签名）",
    fields: [
      { key: "merchant_id", label: "商户 ID (PID)", type: "text", required: true },
      { key: "merchant_key", label: "商户密钥 (Key)", type: "password", required: true },
      { key: "api_endpoint", label: "API 地址", type: "url", required: true },
      { key: "notify_url", label: "异步通知地址", type: "url" },
      { key: "return_url", label: "同步跳转地址", type: "url" },
      { key: "extra_config.enable_alipay", label: "启用支付宝", type: "boolean" },
      { key: "extra_config.enable_wxpay", label: "启用微信支付", type: "boolean" },
    ],
  },
  alipay: {
    label: "支付宝",
    icon: "🔷",
    color: "bg-blue-50 border-blue-200",
    description: "支付宝网页支付（RSA2-SHA256 签名）",
    fields: [
      { key: "merchant_id", label: "应用 ID (AppID)", type: "text", required: true },
      { key: "merchant_secret", label: "应用私钥", type: "password", required: true },
      { key: "merchant_key", label: "支付宝公钥", type: "password", required: true },
      { key: "notify_url", label: "异步通知地址", type: "url" },
      { key: "return_url", label: "同步跳转地址", type: "url" },
    ],
  },
  wechatpay: {
    label: "微信支付",
    icon: "🟢",
    color: "bg-emerald-50 border-emerald-200",
    description: "微信支付 Native/H5（API v3）",
    fields: [
      { key: "merchant_id", label: "商户号 (mchid)", type: "text", required: true },
      { key: "merchant_secret", label: "商户 API 私钥", type: "password", required: true },
      { key: "merchant_key", label: "API v3 密钥", type: "password", required: true },
      { key: "notify_url", label: "异步通知地址", type: "url" },
      { key: "extra_config.appId", label: "公众号 AppID", type: "text" },
    ],
  },
  stripe: {
    label: "Stripe",
    icon: "💳",
    color: "bg-purple-50 border-purple-200",
    description: "Stripe 国际支付网关",
    fields: [
      { key: "merchant_key", label: "API 密钥 (sk_xxx)", type: "password", required: true },
      { key: "merchant_secret", label: "Webhook 签名密钥 (whsec_xxx)", type: "password" },
      { key: "extra_config.productId", label: "产品价格 ID", type: "text" },
      { key: "extra_config.exchangeRate", label: "汇率", type: "text", placeholder: "8" },
      { key: "notify_url", label: "Webhook URL", type: "url" },
    ],
  },
};

function GatewayTab({
  configs,
  onRefresh,
}: {
  configs: PaymentConfigData[];
  onRefresh: () => void;
}) {
  const toast = useToast();
  const [editingConfig, setEditingConfig] = React.useState<PaymentConfigData | null>(null);
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const handleToggle = async (name: string) => {
    try {
      await togglePaymentConfig(name);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleEdit = (config: PaymentConfigData) => {
    setEditingConfig(config);
    const info = GATEWAY_INFO[config.name];
    if (!info) return;
    const initial: Record<string, string> = {};
    for (const field of info.fields) {
      if (field.key.startsWith("extra_config.")) {
        const subKey = field.key.replace("extra_config.", "");
        const val = (config.extra_config as any)?.[subKey];
        initial[field.key] = field.type === "boolean" ? (val ? "true" : "false") : val || "";
      } else {
        initial[field.key] = (config as any)[field.key] || "";
      }
    }
    setForm(initial);
  };

  const handleSave = async () => {
    if (!editingConfig) return;
    const info = GATEWAY_INFO[editingConfig.name];
    if (!info) return;

    setIsSaving(true);
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
      await updatePaymentConfig(editingConfig.name, payload);
      toast.success("配置已保存");
      setEditingConfig(null);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
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

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">商户 ID：</span>
                <span className="text-gray-800 font-mono">{config?.merchant_id || "未配置"}</span>
              </div>
              <div>
                <span className="text-gray-500">密钥状态：</span>
                <span className={config?.merchant_key ? "text-success" : "text-gray-400"}>
                  {config?.merchant_key ? "已配置" : "未配置"}
                </span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => config && handleEdit(config)}>
              编辑配置
            </Button>
          </div>
        );
      })}

      {/* 编辑弹窗 */}
      {editingConfig && GATEWAY_INFO[editingConfig.name] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingConfig(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {GATEWAY_INFO[editingConfig.name].icon} {GATEWAY_INFO[editingConfig.name].label}配置
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {GATEWAY_INFO[editingConfig.name].description}
            </p>

            <div className="space-y-4">
              {GATEWAY_INFO[editingConfig.name].fields.map((field) => (
                <div key={field.key}>
                  {field.type === "boolean" ? (
                    <div className="flex items-center justify-between py-2">
                      <label className="text-sm font-medium text-gray-700">{field.label}</label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]: prev[field.key] === "true" ? "false" : "true",
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form[field.key] === "true" ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            form[field.key] === "true" ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
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
              <button onClick={() => setEditingConfig(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                取消
              </button>
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
      )}
    </div>
  );
}

/* ============== 主页面 ============== */

export default function PaymentConfigsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = React.useState("gateway");
  const [configs, setConfigs] = React.useState<PaymentConfigData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadConfigs = React.useCallback(async () => {
    try {
      const data = await getPaymentConfigs();
      setConfigs(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "加载失败");
    }
  }, [toast]);

  React.useEffect(() => {
    setIsLoading(true);
    loadConfigs().finally(() => setIsLoading(false));
  }, [loadConfigs]);

  if (isLoading) {
    return (
      <AdminShell title="计费与支付">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="计费与支付">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">计费与支付</h1>
        <p className="text-sm text-gray-500 mt-1">管理额度、定价和支付网关配置</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "quota" && (
        <QuotaSettingsTab
          settings={{
            initialQuota: 10,
            deductionQuota: 500,
            inviteQuota: 1000,
            invitedQuota: 1000,
            zeroCostPreDeduct: false,
            externalRechargeUrl: "",
            docsUrl: "",
          }}
          onSave={async (s) => {
            // TODO: 调用 API 保存
            toast.success("保存成功");
          }}
        />
      )}

      {activeTab === "pricing" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">
            模型定价管理功能开发中，请前往{" "}
            <a href="/admin/models" className="text-blue-600 underline">
              模型管理
            </a>{" "}
            页面配置。
          </p>
        </div>
      )}

      {activeTab === "group" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">
            分组定价管理功能开发中，请前往{" "}
            <a href="/admin/users/groups" className="text-blue-600 underline">
              用户分组
            </a>{" "}
            页面配置。
          </p>
        </div>
      )}

      {activeTab === "gateway" && (
        <GatewayTab configs={configs} onRefresh={loadConfigs} />
      )}

      {activeTab === "checkin" && (
        <CheckInRewardsTab
          config={{
            enabled: false,
            minReward: 1,
            maxReward: 10,
          }}
          onSave={async (c) => {
            // TODO: 调用 API 保存
            toast.success("保存成功");
          }}
        />
      )}
    </AdminShell>
  );
}
