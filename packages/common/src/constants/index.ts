// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYMENT_REQUIRED: 402,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Codes
export const API_CODE = {
  SUCCESS: 0,
  ERROR: -1,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INSUFFICIENT_BALANCE: 402,
  RATE_LIMITED: 429,
} as const;

// User Roles
export const USER_ROLE = {
  USER: 'user',
  VIP: 'vip',
  ENTERPRISE: 'enterprise',
  AGENT: 'agent',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Transaction Types
export const TRANSACTION_TYPE = {
  RECHARGE: 'recharge',
  DEDUCT: 'deduct',
  REFUND: 'refund',
  GIFT: 'gift',
  REWARD: 'reward',
  FREEZE: 'freeze',
  UNFREEZE: 'unfreeze',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

// Payment Methods
export const PAYMENT_METHOD = {
  WECHAT_PAY: 'wechat_pay',
  ALIPAY: 'alipay',
} as const;

// Channel Status
export const CHANNEL_STATUS = {
  ACTIVE: 'active',
  RATE_LIMITED: 'rate_limited',
  ERROR: 'error',
  DISABLED: 'disabled',
} as const;

// Money precision (cents)
export const MONEY_PRECISION = 100;

// Token calculation
export const TOKEN_MULTIPLIER = 1_000_000;
