import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化金额（分 -> 元）
 */
export function formatAmount(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

/**
 * 格式化日期
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化 Token 数量
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * 掩码邮箱
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const maskedLocal = local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * 掩码 API Key
 */
export function maskApiKey(key: string): string {
  return key.substring(0, 16) + '...';
}
