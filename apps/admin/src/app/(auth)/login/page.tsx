'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/error-alert';

/** Admin 登录页面 */
export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

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

      // 检查是否为 admin 角色
      const userRole = response.user.role;
      if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        setError('权限不足：需要管理员账号');
        return;
      }

      // 存储 token 到 localStorage（供 api.ts 使用）
      localStorage.setItem('admin-access-token', response.tokens.accessToken);
      localStorage.setItem('admin-refresh-token', response.tokens.refreshToken);

      setAuth(response.user, response.tokens);
      setTimeout(() => router.replace('/'), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">管理员登录</h2>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
          邮箱
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
          密码
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </Button>
    </form>
  );
}
