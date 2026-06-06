import { redirect } from 'next/navigation';

/**
 * /dashboard → /dashboard/overview
 *
 * 保持向后兼容，自动重定向到规范路径。
 */
export default function DashboardPage() {
  redirect('/dashboard/overview');
}
