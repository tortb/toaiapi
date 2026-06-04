'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Mail, ArrowLeft, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <Check className="h-7 w-7 text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">重置链接已发送</h2>
        <p className="text-sm text-white/60">
          如果该邮箱已注册，我们已向 <span className="font-medium text-white">{email}</span> 发送了密码重置链接。
          请检查收件箱。
        </p>
        <p className="text-sm text-white/30">
          开发模式下，重置链接会输出在后端控制台中。
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          返回登录
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold text-white">忘记密码</h2>
      <p className="text-sm text-white/60">
        输入注册时使用的邮箱地址，我们将发送密码重置链接。
      </p>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/60">
          邮箱地址
        </label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/20 transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
      >
        {loading ? '发送中...' : '发送重置链接'}
      </button>

      <p className="text-center text-sm text-white/30">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          返回登录
        </Link>
      </p>
    </form>
  );
}
