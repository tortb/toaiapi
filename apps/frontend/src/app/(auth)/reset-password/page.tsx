'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { Lock, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('缺少重置令牌，请从邮件中的链接重新访问');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (newPassword.length < 8) {
      setError('密码至少8位');
      return;
    }
    if (!token) {
      setError('缺少重置令牌');
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">密码重置成功</h2>
        <p className="text-sm text-gray-600">
          您的密码已成功重置，请使用新密码登录。
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">重置密码</h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">新密码</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type={showPwd ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="至少8位，包含大小写字母和数字"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">确认新密码</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="再次输入新密码"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !token}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '重置中...' : '重置密码'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          返回登录
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-center text-gray-400">加载中...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}