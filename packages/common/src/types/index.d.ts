export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    cachedTokens: number;
    reasoningTokens: number;
    totalTokens: number;
}
export interface Money {
    amount: number;
    currency: 'CNY' | 'USD';
}
export type UserRole = 'USER' | 'VIP' | 'ENTERPRISE' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export interface User {
    id: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
}
export interface ApiKey {
    id: string;
    name?: string;
    keyPrefix: string;
    isActive: boolean;
    expiresAt?: string;
    rateLimit?: number;
    tokenLimit?: number;
    modelLimit?: string[];
    ipWhitelist?: string[];
    createdAt: string;
}
export interface Model {
    id: string;
    name: string;
    displayName: string;
    providerId: string;
    maxContext: number;
    supportsStreaming: boolean;
    supportsTools: boolean;
    supportsVision: boolean;
    isActive: boolean;
}
export type ChannelStatus = 'ACTIVE' | 'RATE_LIMITED' | 'ERROR' | 'DISABLED';
export interface Channel {
    id: string;
    providerId: string;
    name: string;
    baseUrl: string;
    weight: number;
    priority: number;
    isActive: boolean;
    status: ChannelStatus;
    totalRequests: number;
    failedRequests: number;
    avgLatencyMs: number;
}
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'WECHAT_PAY' | 'ALIPAY';
export interface Order {
    id: string;
    orderNo: string;
    userId: string;
    amount: number;
    paidAmount?: number;
    paymentMethod?: PaymentMethod;
    status: OrderStatus;
    productType: string;
    productId?: string;
    productName: string;
    paidAt?: string;
    createdAt: string;
}
export interface SubscriptionPlan {
    id: string;
    name: string;
    displayName: string;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyQuota: number;
    rateLimit: number;
    tokenLimit: number;
    features: Record<string, unknown>;
    isActive: boolean;
}
//# sourceMappingURL=index.d.ts.map