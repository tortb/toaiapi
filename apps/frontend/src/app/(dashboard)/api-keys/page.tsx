'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { ApiKey } from '@/types';
import { formatDate, maskApiKey } from '@/lib/utils';
import { Plus, Trash2, Power, PowerOff, Copy, Check } from 'lucide-react';

/**
 * API Keys 管理页面
 */
export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await api.apiKeys.list();
      setApiKeys(keys);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载 API Key 失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const result = await api.apiKeys.create({ name: newKeyName || undefined });
      setCreatedKey(result.key || null);
      setNewKeyName('');
      setShowCreate(false);
      setError(null);
      loadApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建 API Key 失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个 API Key 吗？此操作不可恢复。')) return;

    try {
      await api.apiKeys.delete(id);
      setError(null);
      loadApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除 API Key 失败');
    }
  };

  const handleToggle = async (id: string, enable: boolean) => {
    try {
      await api.apiKeys.toggle(id, enable);
      setError(null);
      loadApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-2 h-7 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-destructive/70 hover:text-destructive"
          >
            关闭
          </button>
        </div>
      )}

      {/* 创建成功提示 */}
      {createdKey && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4">
          <h3 className="text-sm font-medium text-success">API Key 创建成功</h3>
          <p className="mt-2 text-sm text-success/80">
            请保存此 Key，它只会显示一次：
          </p>
          <code className="mt-2 block rounded-lg bg-success/5 border border-success/20 p-3 text-sm font-mono text-foreground break-all">
            {createdKey}
          </code>
          <button
            onClick={() => handleCopy(createdKey)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-success hover:text-success/80"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? '已复制' : '复制到剪贴板'}
          </button>
        </div>
      )}

      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
          <p className="text-sm text-muted-foreground">管理您的 API 密钥</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
        >
          <Plus className="h-4 w-4" />
          创建 API Key
        </button>
      </div>

      {/* 创建对话框 */}
      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">创建新 API Key</h3>
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground">
              名称（可选）
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="My App Key"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCreate}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              创建
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-muted-foreground hover:bg-muted/80"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* API Key 列表 */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-muted/30">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    {key.name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-muted-foreground">
                    {key.keyPrefix}...
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        key.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {key.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(key.id, !key.isActive)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={key.isActive ? '禁用' : '启用'}
                      >
                        {key.isActive
                          ? <PowerOff className="h-4 w-4 text-warning" />
                          : <Power className="h-4 w-4 text-success" />}
                      </button>
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    暂无 API Key，点击右上角创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
