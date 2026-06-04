'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';

/** 登录页面 — 深色风格 */
export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login(email, password);
      setAuth(response.user, response.tokens);
      // 等待 Zustand 状态更新后再跳转
      setTimeout(() => router.replace('/'), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-semibold text-white">登录</h2>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white/60">
          邮箱
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="your@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white/60">
          密码
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="block w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all duration-300"
      >
        {loading ? '登录中...' : '登录'}
      </button>

      <div className="flex items-center justify-between text-sm">
        <span className="text-white/30">
          还没有账号？{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
            注册
          </Link>
        </span>
        <Link href="/forgot-password" className="text-white/30 hover:text-white/50 transition-colors">
          忘记密码？
        </Link>
      </div>
    </form>
  );
}
