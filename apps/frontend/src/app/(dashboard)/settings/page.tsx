'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types';
import { User as UserIcon, Lock, Trash2, Check, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // 修改密码
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // 删除账户
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword !== confirmPassword) {
      setPwdError('两次输入的新密码不一致');
      return;
    }
    if (newPassword.length < 8) {
      setPwdError('新密码至少8位');
      return;
    }

    setPwdLoading(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setPwdSuccess('密码已修改，请重新登录');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : '修改失败');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.user.deleteMe();
      logout();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">设置</h2>

      {/* 个人信息 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">个人信息</h3>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <Check className="h-4 w-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">显示名称</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="输入显示名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">角色</label>
            <input
              type="text"
              value={user.role}
              disabled
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </form>
      </div>

      {/* 修改密码 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">修改密码</h3>
        </div>

        {pwdSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <Check className="h-4 w-4" />
            {pwdSuccess}
          </div>
        )}
        {pwdError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {pwdError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">当前密码</label>
            <div className="relative mt-1">
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="block w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="输入当前密码"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">新密码</label>
            <div className="relative mt-1">
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="至少8位，包含大小写字母和数字"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="再次输入新密码"
            />
          </div>
          <button
            type="submit"
            disabled={pwdLoading}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {pwdLoading ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>

      {/* 危险区域 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-700">危险区域</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          删除账户后，所有数据将被永久删除且无法恢复。请谨慎操作。
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            删除账户
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-700">确认删除账户？此操作不可逆！</p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? '删除中...' : '确认删除'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}