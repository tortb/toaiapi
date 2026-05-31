export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly PAYMENT_REQUIRED: 402;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const API_CODE: {
    readonly SUCCESS: 0;
    readonly ERROR: -1;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INSUFFICIENT_BALANCE: 402;
    readonly RATE_LIMITED: 429;
};
export declare const USER_ROLE: {
    readonly USER: "user";
    readonly VIP: "vip";
    readonly ENTERPRISE: "enterprise";
    readonly AGENT: "agent";
    readonly ADMIN: "admin";
    readonly SUPER_ADMIN: "super_admin";
};
export declare const TRANSACTION_TYPE: {
    readonly RECHARGE: "recharge";
    readonly DEDUCT: "deduct";
    readonly REFUND: "refund";
    readonly GIFT: "gift";
    readonly REWARD: "reward";
    readonly FREEZE: "freeze";
    readonly UNFREEZE: "unfreeze";
};
export declare const ORDER_STATUS: {
    readonly PENDING: "pending";
    readonly PAID: "paid";
    readonly FAILED: "failed";
    readonly REFUNDED: "refunded";
    readonly CANCELLED: "cancelled";
};
export declare const PAYMENT_METHOD: {
    readonly WECHAT_PAY: "wechat_pay";
    readonly ALIPAY: "alipay";
};
export declare const CHANNEL_STATUS: {
    readonly ACTIVE: "active";
    readonly RATE_LIMITED: "rate_limited";
    readonly ERROR: "error";
    readonly DISABLED: "disabled";
};
export declare const MONEY_PRECISION = 100;
export declare const TOKEN_MULTIPLIER = 1000000;
//# sourceMappingURL=index.d.ts.map