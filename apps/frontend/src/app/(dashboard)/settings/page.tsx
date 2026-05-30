'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types';

/**
 * 设置页面
 */
export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updated = await api.user.updateMe({ displayName: displayName || undefined });
      updateUser(updated);
      setSuccess('个人信息已更新');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">设置</h2>

      {/* 个人信息 */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">个人信息</h3>

        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              显示名称
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="输入显示名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              角色
            </label>
            <input
              type="text"
              value={user.role}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </form>
      </div>

      {/* 修改密码 */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">修改密码</h3>
        <p className="mt-2 text-sm text-gray-600">
          密码修改功能即将上线，请通过忘记密码功能重置密码。
        </p>
      </div>
    </div>
  );
}
