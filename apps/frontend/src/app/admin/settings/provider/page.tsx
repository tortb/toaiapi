"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button, Input, Switch, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { key: "gemini", label: "Gemini", description: "配置 Gemini 安全行为、版本覆盖和思维适配器" },
  { key: "claude", label: "Claude", description: "覆盖 Anthropic 标头、默认值和思维适配器行为" },
];

interface ProviderSettings {
  safetySettings: string;
  versionOverrides: string;
  imagineModels: string;
  thinkingAdapter: boolean;
  budgetRatio: number;
  fillThoughtSignature: boolean;
  removeFunctionResponseId: boolean;
  // Claude specific
  headerOverrides: string;
  maxTokens: string;
  thinkingEnabled: boolean;
  claudeBudgetRatio: number;
}

const defaultGeminiSettings: ProviderSettings = {
  safetySettings: '{ "default": "OFF" }',
  versionOverrides: '{ "default": "v1beta" }',
  imagineModels: "[]",
  thinkingAdapter: false,
  budgetRatio: 0.6,
  fillThoughtSignature: false,
  removeFunctionResponseId: false,
  headerOverrides: "{}",
  maxTokens: '{ "default": 8192 }',
  thinkingEnabled: false,
  claudeBudgetRatio: 0.8,
};

export default function ProviderSettingsPage() {
  const toast = useToast();
  const [activeProvider, setActiveProvider] = React.useState("gemini");
  const [settings, setSettings] = React.useState<ProviderSettings>(defaultGeminiSettings);
  const [isSaving, setIsSaving] = React.useState(false);
  const [jsonErrors, setJsonErrors] = React.useState<Record<string, string>>({});

  const validateJson = (key: string, value: string) => {
    if (!value.trim()) {
      setJsonErrors((prev) => ({ ...prev, [key]: "" }));
      return true;
    }
    try {
      JSON.parse(value);
      setJsonErrors((prev) => ({ ...prev, [key]: "" }));
      return true;
    } catch {
      setJsonErrors((prev) => ({ ...prev, [key]: "JSON 格式不正确" }));
      return false;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: 调用 API 保存
      toast.success("Provider 设置已保存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell title="Provider 设置">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">Provider 专属设置</h1>
        <p className="text-sm text-gray-500 mt-1">
          配置各 AI 服务商的特殊行为和适配规则
        </p>
      </div>

      {/* Provider Tabs */}
      <div className="mb-6 flex items-center gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveProvider(p.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeProvider === p.key
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Gemini Settings */}
      {activeProvider === "gemini" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Gemini 设置</h3>

            <div className="space-y-4">
              <Textarea
                label="安全设置 (JSON)"
                value={settings.safetySettings}
                onChange={(e) => {
                  setSettings({ ...settings, safetySettings: e.target.value });
                  validateJson("safety", e.target.value);
                }}
                placeholder='{ "default": "OFF" }'
                error={jsonErrors.safety}
                hint="以 JSON 格式提供按类别划分的安全覆盖"
                className="font-mono text-xs"
                rows={3}
              />

              <Textarea
                label="版本覆盖 (JSON)"
                value={settings.versionOverrides}
                onChange={(e) => {
                  setSettings({ ...settings, versionOverrides: e.target.value });
                  validateJson("version", e.target.value);
                }}
                placeholder='{ "default": "v1beta", "gemini-1.0-pro": "v1" }'
                error={jsonErrors.version}
                hint="将模型标识符映射到 Gemini API 版本"
                className="font-mono text-xs"
                rows={3}
              />

              <Textarea
                label="Imagine 模型 (JSON)"
                value={settings.imagineModels}
                onChange={(e) => {
                  setSettings({ ...settings, imagineModels: e.target.value });
                  validateJson("imagine", e.target.value);
                }}
                placeholder='["gemini-2.0-flash-exp-image-generation"]'
                error={jsonErrors.imagine}
                className="font-mono text-xs"
                rows={2}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">思维适配器</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <div>
                  <p className="text-sm text-neutral-700">支持 thinking 后缀路由</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    自动将 thinking 请求路由到对应模型
                  </p>
                </div>
                <Switch
                  checked={settings.thinkingAdapter}
                  onCheckedChange={(checked) => setSettings({ ...settings, thinkingAdapter: checked })}
                />
              </div>

              {settings.thinkingAdapter && (
                <Input
                  label="预算比例"
                  type="number"
                  value={settings.budgetRatio}
                  onChange={(e) => setSettings({ ...settings, budgetRatio: Number(e.target.value) })}
                  hint="预算令牌 = 最大令牌数 × 比例"
                  min={0}
                  max={1}
                  step={0.1}
                />
              )}

              <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <div>
                  <p className="text-sm text-neutral-700">填充 thoughtSignature</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    为 Gemini/Vertex 渠道填充 thoughtSignature
                  </p>
                </div>
                <Switch
                  checked={settings.fillThoughtSignature}
                  onCheckedChange={(checked) => setSettings({ ...settings, fillThoughtSignature: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <div>
                  <p className="text-sm text-neutral-700">移除 functionResponse.id</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Vertex AI 兼容性
                  </p>
                </div>
                <Switch
                  checked={settings.removeFunctionResponseId}
                  onCheckedChange={(checked) => setSettings({ ...settings, removeFunctionResponseId: checked })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claude Settings */}
      {activeProvider === "claude" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Claude 设置</h3>

            <div className="space-y-4">
              <Textarea
                label="标头覆盖 (JSON)"
                value={settings.headerOverrides}
                onChange={(e) => {
                  setSettings({ ...settings, headerOverrides: e.target.value });
                  validateJson("headers", e.target.value);
                }}
                placeholder='{"claude-3-haiku-20240307": {"anthropic-beta": "..."}}'
                error={jsonErrors.headers}
                hint="按模型覆盖 Anthropic 请求标头"
                className="font-mono text-xs"
                rows={3}
              />

              <Textarea
                label="最大 Token (JSON)"
                value={settings.maxTokens}
                onChange={(e) => {
                  setSettings({ ...settings, maxTokens: e.target.value });
                  validateJson("maxTokens", e.target.value);
                }}
                placeholder='{ "default": 8192, "claude-3-opus": 4096 }'
                error={jsonErrors.maxTokens}
                hint="按模型配置最大 token 数"
                className="font-mono text-xs"
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">思维适配器</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <div>
                  <p className="text-sm text-neutral-700">支持 thinking 后缀</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Anthropic 原生思维支持
                  </p>
                </div>
                <Switch
                  checked={settings.thinkingEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, thinkingEnabled: checked })}
                />
              </div>

              {settings.thinkingEnabled && (
                <Input
                  label="预算比例"
                  type="number"
                  value={settings.claudeBudgetRatio}
                  onChange={(e) => setSettings({ ...settings, claudeBudgetRatio: Number(e.target.value) })}
                  hint="预算令牌 = 最大令牌数 × 比例"
                  min={0}
                  max={1}
                  step={0.1}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button onClick={handleSave} loading={isSaving}>
          保存设置
        </Button>
      </div>
    </AdminShell>
  );
}
