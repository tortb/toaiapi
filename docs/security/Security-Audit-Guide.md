# ToAIAPI Security Audit Guide

**版本**: 1.0
**日期**: 2026-05-30
**状态**: Draft

---

## 1. 概述

### 1.1 目的

本文档定义了 ToAIAPI 平台的安全审计规范，用于指导安全审查、漏洞修复和安全测试。

### 1.2 范围

- 认证与授权安全
- 数据安全
- API 安全
- 支付安全
- 网络安全
- 运维安全

---

## 2. 认证安全

### 2.1 密码安全

#### 2.1.1 加密算法

| 算法 | 推荐度 | 说明 |
|------|--------|------|
| Argon2id | ⭐⭐⭐⭐⭐ | 首选，抗 GPU/ASIC |
| bcrypt | ⭐⭐⭐⭐ | 兼容性好 |
| scrypt | ⭐⭐⭐ | 可选 |
| SHA-256 | ❌ | 禁止单独使用 |
| MD5 | ❌ | 禁止 |

#### 2.1.2 密码策略

```typescript
const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // 可选
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
};
```

#### 2.1.3 密码存储

```typescript
// ✅ 正确：使用 Argon2id
import * as argon2 from 'argon2';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 4,
});

// ❌ 禁止
const hash = md5(password);
const hash = sha256(password);
const hash = base64(password);
```

### 2.2 JWT 安全

#### 2.2.1 密钥管理

```typescript
// ✅ 正确：使用强密钥
const JWT_SECRET = process.env.JWT_SECRET; // 至少 256 bit
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; // 独立密钥

// ❌ 禁止
const JWT_SECRET = '123456';
const JWT_SECRET = 'secret';
```

#### 2.2.2 Token 有效期

```typescript
const tokenConfig = {
  accessTokenExpiry: '15m',   // 短期
  refreshTokenExpiry: '7d',   // 长期
  // 刷新时轮换 refresh token
  rotateRefreshToken: true,
};
```

#### 2.2.3 Token 存储

```typescript
// Access Token: 内存或 HttpOnly Cookie
// Refresh Token: HttpOnly Cookie + Secure + SameSite

res.cookie('refresh_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',
});
```

### 2.3 API Key 安全

#### 2.3.1 Key 生成

```typescript
import { nanoid } from 'nanoid';

const rawKey = `sk-toai-${nanoid(48)}`;
// 示例: sk-toai-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3
```

#### 2.3.2 Key 存储

```typescript
// 只存储 hash，不存储原始 key
const keyHash = await argon2.hash(rawKey);
const keyPrefix = rawKey.substring(0, 16); // sk-toai-xxxxxx

await prisma.apiKey.create({
  data: {
    key_hash: keyHash,
    key_prefix: keyPrefix,
    user_id: userId,
  },
});
```

#### 2.3.3 Key 验证

```typescript
async function verifyApiKey(rawKey: string): Promise<ApiKey | null> {
  const prefix = rawKey.substring(0, 16);

  // 通过前缀快速查找
  const apiKey = await prisma.apiKey.findFirst({
    where: { key_prefix: prefix, is_active: true },
  });

  if (!apiKey) return null;

  // 验证 hash
  const isValid = await argon2.verify(apiKey.key_hash, rawKey);
  if (!isValid) return null;

  return apiKey;
}
```

---

## 3. 数据安全

### 3.1 数据分类

| 级别 | 数据类型 | 保护措施 |
|------|---------|---------|
| 极高 | 密码、API Key、支付密钥 | 加密存储、访问日志 |
| 高 | 个人信息、交易记录 | 加密传输、访问控制 |
| 中 | 使用统计、配置信息 | 访问控制 |
| 低 | 公开信息 | 基本保护 |

### 3.2 数据加密

#### 3.2.1 传输加密

```typescript
// 强制 HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

// HSTS
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

#### 3.2.2 存储加密

```typescript
// 敏感字段加密
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, tagHex, encryptedHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### 3.3 数据脱敏

```typescript
// 邮箱脱敏
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const maskedLocal = local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

// 手机号脱敏
function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// API Key 脱敏
function maskApiKey(key: string): string {
  return key.substring(0, 16) + '...';
}

// 日志中使用
logger.info(`User login: ${maskEmail(email)}`);
logger.info(`API Key used: ${maskApiKey(apiKey)}`);
```

---

## 4. API 安全

### 4.1 输入校验

```typescript
// 使用 class-validator
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;
}

// 使用 zod
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
```

### 4.2 SQL 注入防护

```typescript
// ✅ 正确：使用 Prisma 参数化查询
const user = await prisma.user.findUnique({
  where: { email: userEmail },
});

// ❌ 禁止：拼接 SQL
const user = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

### 4.3 XSS 防护

```typescript
// 输出编码
import { escape } from 'html-escaper';

const safeOutput = escape(userInput);

// CSP 头
res.setHeader('Content-Security-Policy', "default-src 'self'");
```

### 4.4 CSRF 防护

```typescript
// SameSite Cookie
res.cookie('session', token, {
  sameSite: 'strict',
});

// CSRF Token
import { doubleCsrf } from 'csrf-csrf';

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
});
```

### 4.5 限流

```typescript
// 全局限流
@Throttle({ default: { limit: 100, ttl: 60000 } })

// 用户级限流
@Throttle({ default: { limit: 1000, ttl: 60000 } })

// API Key 级限流（根据套餐）
const rateLimit = await getRateLimitByPlan(apiKey.plan);
```

---

## 5. 支付安全

### 5.1 签名验证

```typescript
// 微信支付
function verifyWechatPaySignature(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string,
  apiKey: string,
): boolean {
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  const expectedSignature = createHmac('sha256', apiKey)
    .update(message)
    .digest('base64');

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

// 支付宝
function verifyAlipaySignature(
  params: Record<string, string>,
  publicKey: string,
): boolean {
  const sign = params['sign'];
  const content = Object.keys(params)
    .filter(key => key !== 'sign' && key !== 'sign_type')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto.verify(
    'sha256',
    Buffer.from(content),
    { key: publicKey },
    Buffer.from(sign, 'base64'),
  );
}
```

### 5.2 幂等性

```typescript
// 订单号唯一约束
model Order {
  order_no String @unique
}

// 回调幂等处理
async function handlePaymentCallback(orderNo: string) {
  const order = await prisma.order.findUnique({
    where: { order_no: orderNo },
  });

  if (order.status !== 'PENDING') {
    // 已处理，直接返回成功
    return { success: true };
  }

  // 处理支付...
}
```

### 5.3 防重复支付

```typescript
// 分布式锁
async function processPayment(orderNo: string) {
  const lockKey = `payment:lock:${orderNo}`;
  const locked = await redis.set(lockKey, '1', 'NX', 'EX', 30);

  if (!locked) {
    throw new Error('Payment is being processed');
  }

  try {
    // 处理支付...
  } finally {
    await redis.del(lockKey);
  }
}
```

---

## 6. 网络安全

### 6.1 CORS 配置

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
});
```

### 6.2 安全头

```typescript
// Helmet
import helmet from 'helmet';
app.use(helmet());

// 或手动设置
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
```

### 6.3 请求大小限制

```typescript
// 限制请求体大小
app.use(express.json({ limit: '10mb' }));
```

---

## 7. 运维安全

### 7.1 环境变量

```typescript
// .env.example（提交到仓库）
DATABASE_URL=postgresql://user:password@localhost:5432/toaiapi
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-here

// .env（不提交到仓库）
DATABASE_URL=postgresql://prod_user:strong_password@prod-host:5432/toaiapi
```

### 7.2 日志安全

```typescript
// ❌ 禁止记录敏感信息
logger.info(`Password: ${password}`);
logger.info(`API Key: ${apiKey}`);
logger.info(`Credit card: ${cardNumber}`);

// ✅ 正确做法
logger.info(`User login: ${maskEmail(email)}`);
logger.info(`API Key used: ${maskApiKey(apiKey)}`);
logger.info(`Payment processed: order=${orderNo}`);
```

### 7.3 错误处理

```typescript
// ❌ 禁止暴露内部错误
throw new Error(`Database error: ${dbError.message}`);

// ✅ 正确做法
throw new HttpException(
  { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  HttpStatus.INTERNAL_SERVER_ERROR,
);
```

---

## 8. 安全检查清单

### 8.1 代码审查

- [ ] 密码是否使用 Argon2/bcrypt 加密？
- [ ] API Key 是否加密存储？
- [ ] 敏感信息是否出现在日志？
- [ ] 所有输入是否校验？
- [ ] SQL 是否使用参数化查询？
- [ ] 是否有 XSS 风险？
- [ ] 是否有 CSRF 防护？
- [ ] 限流是否配置？
- [ ] CORS 是否正确配置？

### 8.2 支付审查

- [ ] 是否验证支付回调签名？
- [ ] 是否使用 timingSafeEqual？
- [ ] 是否有幂等保护？
- [ ] 订单状态是否只能通过回调修改？
- [ ] 是否有超时处理？
- [ ] 是否有防重复支付机制？

### 8.3 部署审查

- [ ] 是否使用 HTTPS？
- [ ] 是否配置 HSTS？
- [ ] 是否配置安全头？
- [ ] 环境变量是否安全？
- [ ] 数据库是否限制访问？
- [ ] Redis 是否限制访问？
- [ ] 是否配置防火墙？

---

## 9. 应急响应

### 9.1 安全事件分级

| 级别 | 描述 | 响应时间 |
|------|------|---------|
| P0 | 数据泄露、支付漏洞 | 立即 |
| P1 | 认证绕过、权限提升 | 1 小时 |
| P2 | XSS、CSRF | 24 小时 |
| P3 | 信息泄露、配置错误 | 72 小时 |

### 9.2 应急流程

1. 发现漏洞
2. 评估影响
3. 临时修复
4. 通知用户
5. 正式修复
6. 复盘总结

---

## 附录 A: 常见漏洞

| 漏洞 | 风险 | 防护 |
|------|------|------|
| SQL 注入 | 高 | 参数化查询 |
| XSS | 中 | 输出编码、CSP |
| CSRF | 中 | SameSite、CSRF Token |
| SSRF | 高 | 白名单、网络隔离 |
| RCE | 极高 | 输入校验、沙箱 |
| 信息泄露 | 中 | 错误处理、日志脱敏 |

## 附录 B: 安全工具

| 工具 | 用途 |
|------|------|
| ESLint Security | 代码安全检查 |
| Snyk | 依赖漏洞扫描 |
| OWASP ZAP | Web 安全测试 |
| Burp Suite | 渗透测试 |
| SonarQube | 代码质量检查 |
