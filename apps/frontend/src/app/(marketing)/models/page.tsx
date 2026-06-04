'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import type { PublicModel } from '@/types';

/** Provider 名称映射（后端 provider_id → 显示名） */
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  deepseek: 'DeepSeek',
  qwen: 'Alibaba',
  moonshot: 'Moonshot',
  grok: 'xAI',
  openrouter: 'OpenRouter',
};

/** 模型矩阵页面 */
export default function ModelsPage() {
  const [models, setModels] = useState<PublicModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('全部');

  const loadModels = useCallback(async () => {
    try {
      const res = await api.models.listPublic();
      setModels(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载模型列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const providers = ['全部', ...new Set(models.map((m) => PROVIDER_DISPLAY_NAMES[m.providerId] || m.providerId))];

  const filteredModels = selectedProvider === '全部'
    ? models
    : models.filter((m) => (PROVIDER_DISPLAY_NAMES[m.providerId] || m.providerId) === selectedProvider);

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
        {!loading && !error && (
          <div className="mt-8 flex flex-wrap gap-2">
            {providers.map((p) => (
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
        )}
      </div>

      {/* 模型表格 */}
      <div className="mx-auto max-w-6xl px-4 pb-20">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-card" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : (
          <>
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
                  {filteredModels.map((row) => {
                    const caps: string[] = [];
                    if (row.supportsStreaming) caps.push('流式');
                    if (row.supportsTools) caps.push('工具');
                    if (row.supportsVision) caps.push('视觉');

                    return (
                      <tr key={row.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm text-foreground">
                          {PROVIDER_DISPLAY_NAMES[row.providerId] || row.providerId}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{row.displayName}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {row.maxContext >= 1000000 ? `${(row.maxContext / 1000000).toFixed(0)}M` : `${(row.maxContext / 1000).toFixed(0)}K`}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {row.pricing ? `${row.pricing.inputPrice} 分/百万` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {row.pricing ? `${row.pricing.outputPrice} 分/百万` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {row.pricing ? `${row.pricing.multiplier}x` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {caps.map((cap) => (
                              <Badge key={cap} variant="secondary">{cap}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">可用</Badge>
                        </td>
                      </tr>
                    );
                  })}
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
          </>
        )}
      </div>
    </div>
  );
}
