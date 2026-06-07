"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/ui/Toast";
import { Copy, Check, Monitor, Apple, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface UseApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function UseApiKeyModal({
  open,
  onClose,
  apiKey,
  baseUrl,
  model,
}: UseApiKeyModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("codex");
  const [os, setOs] = React.useState<"macos" | "windows">("macos");
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const configs = React.useMemo(() => {
    const configToml = `model_provider = "OpenAI"
model = "${model}"
review_model = "${model}"
model_reasoning_effort = "xhigh"
disable_response_storage = true
network_access = "enabled"
windows_wsl_setup_acknowledged = true
model_context_window = 1000000
model_auto_compact_token_limit = 900000

[model_providers.OpenAI]
name = "OpenAI"
base_url = "${baseUrl}"
wire_api = "responses"
requires_openai_auth = true`;

    const authJson = `{
  "OPENAI_API_KEY": "${apiKey}"
}`;

    return { configToml, authJson };
  }, [apiKey, baseUrl, model]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast("success", "已复制到剪贴板");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const configPath = os === "macos" ? "~/.codex/config.toml" : "%USERPROFILE%\\.codex\\config.toml";
  const authPath = os === "macos" ? "~/.codex/auth.json" : "%USERPROFILE%\\.codex\\auth.json";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="如何使用 API 密钥"
      description="配置您的本地开发环境以使用此密钥"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Tabs
            items={[
              { label: "Codex CLI", value: "codex" },
              { label: "Claude Code", value: "claude" },
              { label: "OpenRouter", value: "openrouter" },
            ]}
            value={activeTab}
            onValueChange={setActiveTab}
          />
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
            <button
              onClick={() => setOs("macos")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition",
                os === "macos" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Apple className="h-3 w-3" />
              macOS/Linux
            </button>
            <button
              onClick={() => setOs("windows")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition",
                os === "windows" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Monitor className="h-3 w-3" />
              Windows
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                <Terminal className="h-4 w-4 text-neutral-400" />
                配置文件: <code className="rounded bg-neutral-100 px-1 text-xs font-mono">{configPath}</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => handleCopy(configs.configToml, "config")}
              >
                {copiedField === "config" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                复制
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-4 font-mono text-xs text-neutral-300 leading-relaxed shadow-inner">
              {configs.configToml}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                <Terminal className="h-4 w-4 text-neutral-400" />
                认证文件: <code className="rounded bg-neutral-100 px-1 text-xs font-mono">{authPath}</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => handleCopy(configs.authJson, "auth")}
              >
                {copiedField === "auth" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                复制
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-4 font-mono text-xs text-neutral-300 leading-relaxed shadow-inner">
              {configs.authJson}
            </pre>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>提示：</strong> 请确保您已安装对应的 CLI 工具。您可以通过运行 <code className="rounded bg-blue-100 px-1 font-mono">npm install -g @codex/cli</code> 来安装 Codex CLI。
          </p>
        </div>
      </div>
    </Modal>
  );
}
