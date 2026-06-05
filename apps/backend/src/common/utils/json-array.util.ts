/**
 * JSON 数组工具
 *
 * SQLite 不支持原生数组类型，使用 JSON 字符串存储数组。
 * PostgreSQL 支持原生数组，无需转换。
 *
 * 这些工具函数在两种数据库之间提供兼容层。
 */

/**
 * 将数组转为 JSON 字符串（用于写入数据库）
 */
export function toJsonArray(arr: string[] | null | undefined): string {
  if (!arr || !Array.isArray(arr)) return '[]';
  return JSON.stringify(arr);
}

/**
 * 解析 JSON 字符串为数组（用于从数据库读取）
 */
export function parseJsonArray<T = string>(value: string | string[] | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
