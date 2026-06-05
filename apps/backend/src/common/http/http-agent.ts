/**
 * 共享 HTTP Agent（连接池）
 *
 * 高并发优化：复用 TCP 连接，减少握手开销。
 * 所有 Provider 适配器共享同一 Agent 实例。
 *
 * - keepAlive: true — 保持连接
 * - keepAliveTimeout: 60s — 空闲连接超时
 * - connections: 256 — 最大连接数
 * - pipelining: 1 — 禁用 HTTP 管线化（兼容性最好）
 */

import { Agent } from 'undici';

export const httpAgent = new Agent({
  keepAliveTimeout: 60_000,
  keepAliveMaxTimeout: 60_000,
  connections: 256,
  pipelining: 1,
});

/**
 * 带连接池的 fetch（高并发优化）
 *
 * Node.js 内置 fetch 不暴露 dispatcher 类型，此函数提供类型安全的包装。
 */
export function fetchWithPool(
  input: string | URL | globalThis.Request,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(input, { ...init, dispatcher: httpAgent } as any);
}
