# 后端技术规范

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | 11.x | Web 框架 |
| Fastify | 4.x | HTTP 引擎（替代 Express） |
| Prisma | 6.x | ORM |
| PostgreSQL | 16 | 主数据库 |
| Redis | 7 | 缓存/会话/限流 |
| Passport | — | JWT 认证 |
| class-validator | — | DTO 校验 |
| argon2 | — | 密码哈希 |
| nanoid | — | Key 生成 |

## 模块规范

### 目录结构

```
modules/{module}/
├── {module}.module.ts        # 模块定义
├── {module}.controller.ts    # 路由控制器
├── {module}.service.ts       # 业务逻辑
├── {module}.repository.ts    # 数据访问
├── dto/                      # 数据传输对象
│   ├── create-xxx.dto.ts
│   ├── update-xxx.dto.ts
│   └── xxx-response.dto.ts
└── entities/                 # 实体类型（可选）
    └── xxx.entity.ts
```

### 分层职责

| 层 | 职责 | 禁止 |
|----|------|------|
| Controller | 路由映射、参数校验、响应格式化 | 禁止直接访问数据库 |
| Service | 业务逻辑、事务编排 | 禁止直接使用 PrismaClient |
| Repository | 数据库操作、Prisma 调用 | 禁止包含业务逻辑 |

### DTO 规范

```typescript
// 使用 class-validator 装饰器
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}
```

### 响应格式

```typescript
// 成功
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 错误
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "余额不足"
  }
}

// 分页
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

## 认证体系

### JWT 认证（Dashboard）

```
Header: Authorization: Bearer {access_token}

Access Token:
  - 有效期: 15 分钟
  - Payload: { sub: userId, email, role, iss, aud }
  - 签名: RS256/ES256 (JWT_PRIVATE_KEY)
  - 校验: JWT_PUBLIC_KEY + iss/aud/exp

Refresh Token:
  - 有效期: 7 天
  - 传输: HttpOnly Cookie (SameSite=Lax)
  - 服务端存储: Redis 中仅保存 SHA-256 指纹
  - Key: refresh:{userId}
```

### API Key 认证（Gateway）

```
Header: X-API-Key: sk-toai-xxxxx
或
Header: Authorization: Bearer sk-toai-xxxxx

验证流程:
1. 提取 key
2. 通过 key_prefix 查询
3. Argon2id 哈希比对
4. 检查状态/过期/限流
```

## 错误码

| 错误码 | HTTP | 说明 |
|--------|------|------|
| VALIDATION_ERROR | 400 | 参数校验失败 |
| UNAUTHORIZED | 401 | 未认证 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| INSUFFICIENT_BALANCE | 402 | 余额不足 |
| RATE_LIMITED | 429 | 限流 |
| INTERNAL_ERROR | 500 | 服务器错误 |
| PROVIDER_ERROR | 502 | Provider 错误 |
| GATEWAY_TIMEOUT | 504 | 网关超时 |

## Redis 使用

| 用途 | Key 格式 | TTL |
|------|---------|-----|
| Refresh Token | `refresh_token:{userId}` | 7 天 |
| API Key 缓存 | `apikey:prefix:{prefix}` | 5 分钟 |
| 限流计数 | `ratelimit:{keyId}:{ts}` | 2 分钟 |
| Token 限流 | `tokenratelimit:{keyId}:{ts}` | 2 分钟 |
| 密码重置 | `pwd_reset:{token}` | 1 小时 |

## 环境变量

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/toaiapi

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ISSUER=toaiapi
JWT_AUDIENCE=toaiapi-web
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=3001
NODE_ENV=development

# Encryption
ENCRYPTION_KEY=your-encryption-key
```
