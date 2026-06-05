# ToAIAPI Security Rules

## 核心原则

**安全是支付系统的生命线。所有用户输入都是不可信的。**

## 禁止事项

1. SQL 注入
2. XSS（跨站脚本攻击）
3. CSRF（跨站请求伪造）
4. SSRF（服务器端请求伪造）
5. RCE（远程代码执行）
6. 信息泄露

## 输入校验

所有用户输入必须通过 class-validator 或 zod 校验：

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

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
```

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
```

## 认证与授权

### 密码安全

```typescript
import * as argon2 from 'argon2';

// ✅ 使用 argon2（首选）
const hash = await argon2.hash(password);
const valid = await argon2.verify(hash, inputPassword);

// ✅ 或使用 bcrypt（兼容性好）
const hash = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(inputPassword, hash);

// ❌ 禁止明文存储
const hash = md5(password); // 禁止

// ❌ 禁止弱哈希
const hash = sha256(password); // 禁止单独使用
```

### JWT 安全

```typescript
// Access Token: 短期（15分钟）
// Refresh Token: 长期（7天），存储在 HttpOnly Cookie

// ✅ 正确配置
{
  secret: process.env.JWT_SECRET, // 必须足够长（256 bit+）
  signOptions: { expiresIn: '15m' },
}

// ❌ 禁止
{
  secret: '123456', // 弱密钥
  signOptions: { expiresIn: '30d' }, // 过长
}
```

### API Key 安全

```typescript
// 生成
const rawKey = `sk-toai-${nanoid(48)}`;
const hash = await argon2.hash(rawKey);
const prefix = rawKey.substring(0, 16); // sk-toai-xxxxxx

// 存储
await prisma.apiKey.create({
  data: {
    key_hash: hash,
    key_prefix: prefix,
    user_id: userId,
  },
});

// 验证
const apiKey = await prisma.apiKey.findFirst({
  where: { key_prefix: rawKey.substring(0, 16) },
});
if (apiKey && await argon2.verify(apiKey.key_hash, rawKey)) {
  // 验证通过
}
```

## 支付安全

### 回调签名验证

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

// 微信支付签名验证
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

// 支付宝签名验证
function verifyAlipaySignature(
  params: Record<string, string>,
  publicKey: string,
): boolean {
  const sign = params['sign'];
  const signType = params['sign_type'];
  const content = Object.keys(params)
    .filter(key => key !== 'sign' && key !== 'sign_type')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto.verify(
    signType === 'RSA2' ? 'sha256' : 'sha1',
    Buffer.from(content),
    { key: publicKey },
    Buffer.from(sign, 'base64'),
  );
}
```

### 支付幂等性

```typescript
// 所有订单必须幂等
async function createOrder(userId: string, amount: number): Promise<Order> {
  const orderNo = generateOrderNo(); // 唯一订单号

  try {
    return await prisma.order.create({
      data: {
        order_no: orderNo,
        user_id: userId,
        amount: amount,
        status: 'PENDING',
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      // 唯一约束冲突，订单已存在
      return prisma.order.findUnique({ where: { order_no: orderNo } });
    }
    throw error;
  }
}
```

### 支付状态机

```
PENDING → SUCCESS
PENDING → FAILED
PENDING → CANCELLED
SUCCESS → REFUNDED
```

**禁止直接修改状态**，必须通过回调或明确的业务流程触发。

## 限流

```typescript
// 用户级限流
@Throttle({ default: { limit: 100, ttl: 60000 } }) // 100次/分钟
@Controller('users')
export class UserController { }

// IP 级限流
@Throttle({ default: { limit: 1000, ttl: 60000 } }) // 1000次/分钟
@Controller('api')
export class ApiController { }

// API Key 级限流（根据套餐）
const rateLimit = await getRateLimitByPlan(apiKey.plan);
```

## 黑名单系统

```typescript
// IP 黑名单
interface BlacklistEntry {
  type: 'ip' | 'email' | 'phone' | 'domain';
  value: string;
  reason: string;
  expires_at?: Date;
}

// 中间件检查
@Injectable()
export class BlacklistGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    const isBlocked = await this.blacklistService.isBlocked('ip', ip);
    if (isBlocked) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
```

## 日志安全

```typescript
// ❌ 禁止记录敏感信息
logger.info(`User login: ${email}, password: ${password}`);
logger.info(`API Key: ${apiKey}`);
logger.info(`Credit card: ${cardNumber}`);

// ✅ 正确做法
logger.info(`User login: ${maskEmail(email)}`);
logger.info(`API Key used: ${maskApiKey(apiKey)}`);
logger.info(`Payment processed: order=${orderNo}, amount=${amount}`);
```

## HTTPS 与 CORS

```typescript
// 强制 HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

// CORS 配置
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
});
```

## 环境变量

```typescript
// ✅ 使用环境变量存储敏感配置
// .env.example（提交到仓库）
DATABASE_URL=postgresql://user:password@localhost:5432/toaiapi
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-here
WECHAT_PAY_API_KEY=your-key-here

// .env（不提交到仓库，加入 .gitignore）
DATABASE_URL=postgresql://prod_user:strong_password@prod-host:5432/toaiapi
```

## 安全检查清单

每个 PR 必须检查：

- [ ] 所有输入是否校验？
- [ ] SQL 是否使用参数化查询？
- [ ] 密码是否加密存储？
- [ ] API Key 是否加密存储？
- [ ] 支付回调是否验证签名？
- [ ] 敏感信息是否出现在日志？
- [ ] 是否有 XSS 风险？
- [ ] 是否有 CSRF 防护？
- [ ] 限流是否配置？
- [ ] CORS 是否正确配置？
