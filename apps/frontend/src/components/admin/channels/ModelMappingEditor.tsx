"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2 } from "lucide-react";

interface ModelMapping {
  requestModel: string;
  actualModel: string;
}

interface ModelMappingEditorProps {
  value: ModelMapping[];
  onChange: (value: ModelMapping[]) => void;
}

export function ModelMappingEditor({ value, onChange }: ModelMappingEditorProps) {
  const handleAdd = () => {
    onChange([...value, { requestModel: "", actualModel: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ModelMapping, val: string) => {
    const next = [...value];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-700">模型映射</label>
        <Button type="button" variant="ghost" size="sm" onClick={handleAdd} className="h-7 gap-1 text-xs">
          <Plus className="h-3 w-3" />
          添加映射
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-neutral-400">暂无映射，点击"添加映射"开始</p>
      ) : (
        <div className="space-y-2">
          {value.map((mapping, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={mapping.requestModel}
                onChange={(e) => handleChange(i, "requestModel", e.target.value)}
                placeholder="请求模型名"
                className="flex-1 font-mono text-xs"
              />
              <span className="text-xs text-neutral-400">→</span>
              <Input
                value={mapping.actualModel}
                onChange={(e) => handleChange(i, "actualModel", e.target.value)}
                placeholder="实际模型名"
                className="flex-1 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-neutral-400">
        将请求中的模型名映射到实际使用的模型名
      </p>
    </div>
  );
}
