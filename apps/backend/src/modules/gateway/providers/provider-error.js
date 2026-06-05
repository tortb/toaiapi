/**
 * Provider 上游错误
 *
 * 携带 HTTP 状态码，用于：
 * 1. 区分 429 限流和 500 内部错误
 * 2. 标记 channel 状态（RATE_LIMITED vs ERROR）
 * 3. 向客户端返回合适的 HTTP 状态码
 */
export class ProviderError extends Error {
    statusCode;
    providerName;
    channelId;
    constructor(message, statusCode, providerName, channelId) {
        super(message);
        this.statusCode = statusCode;
        this.providerName = providerName;
        this.channelId = channelId;
        this.name = 'ProviderError';
    }
    get isRateLimited() {
        return this.statusCode === 429;
    }
    get isServerError() {
        return this.statusCode >= 500;
    }
    get isClientError() {
        return this.statusCode >= 400 && this.statusCode < 500;
    }
}
//# sourceMappingURL=provider-error.js.map