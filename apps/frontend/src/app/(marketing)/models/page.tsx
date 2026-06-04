'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface ModelRow {
  provider: string;
  model: string;
  context: string;
  inputPrice: string;
  outputPrice: string;
  multiplier: string;
  capabilities: string[];
  status: string;
}

const MODEL_DATA: ModelRow[] = [
  { provider: 'OpenAI', model: 'GPT-4.1', context: '1M', inputPrice: '2', outputPrice: '8', multiplier: '1.0x', capabilities: ['流式', '工具', '视觉'], status: '可用' },
  { provider: 'OpenAI', model: 'GPT-4.1 Mini', context: '1M', inputPrice: '0.4', outputPrice: '1.6', multiplier: '1.0x', capabilities: ['流式', '工具', '视觉'], status: '可用' },
  { provider: 'OpenAI', model: 'o3', context: '200K', inputPrice: '10', outputPrice: '40', multiplier: '1.0x', capabilities: ['流式'], status: '可用' },
  { provider: 'Anthropic', model: 'Claude Sonnet 4', context: '200K', inputPrice: '3', outputPrice: '15', multiplier: '1.0x', capabilities: ['流式', '工具', '视觉'], status: '可用' },
  { provider: 'Anthropic', model: 'Claude Haiku 4', context: '200K', inputPrice: '0.8', outputPrice: '4', multiplier: '1.0x', capabilities: ['流式', '工具', '视觉'], status: '可用' },
  { provider: 'Google', model: 'Gemini 2.5 Pro', context: '1M', inputPrice: '1.25', outputPrice: '10', multiplier: '1.0x', capabilities: ['流式', '工具', '视觉'], status: '可用' },
  { provider: 'Google', model: 'Gemini 2.5 Flash', context: '1M', inputPrice: '0.15', outputPrice: '0.6', multiplier: '1.0x', capabilities: ['流式', '工具', '视觉'], status: '可用' },
  { provider: 'DeepSeek', model: 'DeepSeek V3', context: '128K', inputPrice: '1', outputPrice: '2', multiplier: '1.0x', capabilities: ['流式', '工具'], status: '可用' },
  { provider: 'DeepSeek', model: 'DeepSeek R1', context: '128K', inputPrice: '4', outputPrice: '16', multiplier: '1.0x', capabilities: ['流式'], status: '可用' },
  { provider: 'Alibaba', model: 'Qwen 3', context: '128K', inputPrice: '1', outputPrice: '4', multiplier: '1.0x', capabilities: ['流式', '工具'], status: '可用' },
  { provider: 'xAI', model: 'Grok-3', context: '128K', inputPrice: '3', outputPrice: '15', multiplier: '1.0x', capabilities: ['流式', '工具'], status: '可用' },
];

const PROVIDERS = ['全部', ...new Set(MODEL_DATA.map((m) => m.provider))];

/** 模型矩阵页面 */
export default function ModelsPage() {
  const [selectedProvider, setSelectedProvider] = useState('全部');

  const filteredModels = selectedProvider === '全部'
    ? MODEL_DATA
    : MODEL_DATA.filter((m) => m.provider === selectedProvider);

  return (
    <div className="bg-background">
      {/* 标题区 */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          支持模型
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          所有模型统一 OpenAI 兼容接口，价格透明，按量计费
        </p>

        {/* Provider 筛选 */}
        <div className="mt-8 flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedProvider === p
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 模型表格 */}
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">模型</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">上下文</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">输入价格</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">输出价格</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">倍率</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">能力</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredModels.map((row) => (
                <tr key={`${row.provider}-${row.model}`} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-foreground">{row.provider}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{row.model}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.context}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.inputPrice} 分/百万</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.outputPrice} 分/百万</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.multiplier}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary">{cap}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success">{row.status}</Badge>
                  </td>
                </tr>
              ))}
              {filteredModels.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    该 Provider 暂无可用模型
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 价格说明 */}
        <p className="mt-4 text-xs text-muted-foreground">
          * 价格单位为 分/百万 token（即 ¥0.01/百万 token）。实际扣费 = 基础价格 × 倍率。倍率可根据渠道和套餐调整。
        </p>
      </div>
    </div>
  );
}
