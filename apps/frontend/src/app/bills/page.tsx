import { redirect } from 'next/navigation';

/**
 * /bills → /dashboard/billing
 *
 * 保持向后兼容，自动重定向到规范路径。
 */
export default function BillsRedirectPage() {
  redirect('/dashboard/billing');
}
