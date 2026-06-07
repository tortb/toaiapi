"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/Textarea";

interface OverrideRulesEditorProps {
  statusCodeMapping: string;
  onStatusCodeMappingChange: (value: string) => void;
  paramOverrides: string;
  onParamOverridesChange: (value: string) => void;
  headerOverrides: string;
  onHeaderOverridesChange: (value: string) => void;
}

export function OverrideRulesEditor({
  statusCodeMapping,
  onStatusCodeMappingChange,
  paramOverrides,
  onParamOverridesChange,
  headerOverrides,
  onHeaderOverridesChange,
}: OverrideRulesEditorProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateJson = (key: string, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
      return;
    }
    try {
      JSON.parse(value);
      setErrors((prev) => ({ ...prev, [key]: "" }));
    } catch {
      setErrors((prev) => ({ ...prev, [key]: "JSON 格式不正确" }));
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-neutral-900 border-l-2 border-purple-500 pl-2">
        覆盖规则
      </h4>

      <Textarea
        label="状态码映射 (JSON)"
        value={statusCodeMapping}
        onChange={(e) => {
          onStatusCodeMappingChange(e.target.value);
          validateJson("statusCode", e.target.value);
        }}
        placeholder='{"429": 503, "500": 502}'
        error={errors.statusCode}
        hint="将上游状态码映射为下游状态码"
        className="font-mono text-xs"
        rows={3}
      />

      <Textarea
        label="参数覆盖 (JSON)"
        value={paramOverrides}
        onChange={(e) => {
          onParamOverridesChange(e.target.value);
          validateJson("params", e.target.value);
        }}
        placeholder='{"temperature": 0.7, "max_tokens": 4096}'
        error={errors.params}
        hint="覆盖请求体中的参数"
        className="font-mono text-xs"
        rows={3}
      />

      <Textarea
        label="请求头覆盖 (JSON)"
        value={headerOverrides}
        onChange={(e) => {
          onHeaderOverridesChange(e.target.value);
          validateJson("headers", e.target.value);
        }}
        placeholder='{"X-Custom-Header": "value", "Authorization": "Bearer {api_key}"}'
        error={errors.headers}
        hint="支持 {api_key} 和 {client_header:NAME} 占位符"
        className="font-mono text-xs"
        rows={3}
      />
    </div>
  );
}
