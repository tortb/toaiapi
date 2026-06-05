# 安全技术规范

## 密码安全

| 项目 | 规范 |
|------|------|
| 算法 | Argon2id |
| 内存 | 64 MB |
| 迭代 | 3 |
| 并行度 | 4 |
| Salt | 随机 16 字节 |
| Hash | 32 字节 |

```typescript
// @toai/auth
import { hash, verify } from 'argon2';

const passwordHash = await hash(password, {
  type: argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});

const isValid = await verify(passwordHash, password);
```

## JWT 安全

| 项目 | 规范 |
|------|------|
| 算法 | HS256 |
| Access Token 有效期 | 15 分钟 |
| Refresh Token 有效期 | 7 天 |
| 存储 | HttpOnly Cookie (前端) / Redis (Refresh) |
| Secret | 环境变量，至少 32 字节 |

## API Key 安全

| 项目 | 规范 |
|------|------|
| 生成 | nanoid(48) + `sk-toai-` 前缀 |
| 存储 | Argon2id 哈希（不存储明文） |
| 展示 | 仅显示 key_prefix（前 16 字符） |
| 创建时 | 仅返回一次完整 Key |

## 数据加密

### 敏感字段加密（AES-256-GCM）

```typescript
// Channel API Key 存储
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encrypt(plaintext: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(ciphertext: string, key: Buffer): string {
  const data = Buffer.from(ciphertext, 'base64');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### 数据脱敏

| 字段 | 脱敏规则 |
|------|---------|
| 邮箱 | `t***@example.com` |
| 手机号 | `138****1234` |
| API Key | `sk-toai-xxxx...xxxx` |
| IP | 仅保留前三段 |

## API 安全

### 输入校验

```typescript
// 所有 DTO 使用 class-validator
import { IsString, IsEmail, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
```


### SQL 注入防护

- Prisma ORM 参数化查询
- 禁止字符串拼接 SQL
- 所有输入经过 class-validator 校验

### XSS 防护

- React 自动转义
- CSP Header
- 禁止 `dangerouslySetInnerHTML`

### CSRF 防护

- SameSite Cookie
- 关键操作需要认证
- API Key 认证天然防 CSRF

## 支付安全

| 项目 | 规范 |
|------|------|
| 回调验签 | `timingSafeEqual` 比较签名 |
| 订单幂等 | `order_no` 唯一约束 |
| 状态变更 | 仅通过回调，前端不可直接修改 |
| 金额校验 | 回调金额必须与订单金额一致 |

## 限流策略

| 场景 | 限制 |
|------|------|
| 登录 | 5 次/分钟/IP |
| 注册 | 3 次/分钟/IP |
| 忘记密码 | 3 次/分钟/邮箱 |
| API 调用 | 60 次/分钟/Key |
| Admin API | 120 次/分钟/User |

## 审计日志

记录以下操作：
- 用户注册/登录/登出
- 密码修改/重置
- API Key 创建/删除
- 管理员操作（角色变更、状态变更）
- 充值/退款操作
- 支付回调

## 环境变量安全

```bash
# 必须设置的密钥
JWT_SECRET=           # 至少 32 字节随机字符串
ENCRYPTION_KEY=       # AES-256 密钥，32 字节
DATABASE_URL=         # PostgreSQL 连接字符串
REDIS_URL=            # Redis 连接字符串

# 禁止
# - 硬编码密钥
# - 日志输出密钥
# - Git 提交 .env
```
