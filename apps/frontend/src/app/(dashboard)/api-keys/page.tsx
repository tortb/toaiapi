'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { ApiKey } from '@/types';
import { formatDate, maskApiKey } from '@/lib/utils';

/**
 * API Keys 管理页面
 */
export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await api.apiKeys.list();
      setApiKeys(keys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
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
      loadApiKeys();
    } catch (err) {
      console.error('Failed to create API key:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个 API Key 吗？')) return;

    try {
      await api.apiKeys.delete(id);
      loadApiKeys();
    } catch (err) {
      console.error('Failed to delete API key:', err);
    }
  };

  const handleToggle = async (id: string, enable: boolean) => {
    try {
      await api.apiKeys.toggle(id, enable);
      loadApiKeys();
    } catch (err) {
      console.error('Failed to toggle API key:', err);
    }
  };

  if (loading) {
    return <div className="animate-pulse">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 创建成功提示 */}
      {createdKey && (
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="text-sm font-medium text-green-800">API Key 创建成功</h3>
          <p className="mt-2 text-sm text-green-700">
            请保存此 Key，它只会显示一次：
          </p>
          <code className="mt-2 block rounded bg-green-100 p-2 text-sm">
            {createdKey}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(createdKey);
              alert('已复制到剪贴板');
            }}
            className="mt-2 text-sm text-green-600 hover:text-green-500"
          >
            复制
          </button>
        </div>
      )}

      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          创建 API Key
        </button>
      </div>

      {/* 创建对话框 */}
      {showCreate && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">创建新 API Key</h3>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              名称（可选）
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="My App Key"
            />
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              创建
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* API Key 列表 */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <tr key={key.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {key.name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-500">
                    {key.keyPrefix}...
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        key.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {key.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggle(key.id, !key.isActive)}
                      className="mr-2 text-blue-600 hover:text-blue-500"
                    >
                      {key.isActive ? '禁用' : '启用'}
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="text-red-600 hover:text-red-500"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无 API Key
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
