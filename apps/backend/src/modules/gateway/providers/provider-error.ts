/**
 * Provider 上游错误
 *
 * 携带 HTTP 状态码，用于：
 * 1. 区分 429 限流和 500 内部错误
 * 2. 标记 channel 状态（RATE_LIMITED vs ERROR）
 * 3. 向客户端返回合适的 HTTP 状态码
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly providerName: string,
    public readonly channelId?: string,
  ) {
    super(message);
    this.name = 'ProviderError';
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }
}
