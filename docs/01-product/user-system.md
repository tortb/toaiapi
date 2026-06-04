# 用户系统 — PRD

## 功能清单

### 1. 注册

| 字段 | 必填 | 说明 |
|------|------|------|
| email | ✅ | 唯一，作为登录凭证 |
| password | ✅ | 8-128 字符，Argon2id 哈希存储 |
| displayName | ❌ | 显示昵称 |

**注册流程：**
1. 用户提交注册表单
2. 校验邮箱唯一性
3. 密码哈希（Argon2id）
4. 创建 User 记录
5. 创建 UserBalance 记录（初始余额 0）
6. 返回 JWT Token

**状态：** V1.0 已实现

---

### 2. 登录

**登录方式：**

| 方式 | 状态 | 说明 |
|------|------|------|
| 邮箱+密码 | ✅ V1.0 | 主登录方式 |
| 邮箱验证码 | 📋 V3.0 | 无密码登录 |
| GitHub OAuth | 📋 V3.0 | 第三方登录 |
| Google OAuth | 📋 V3.0 | 第三方登录 |
| 微信登录 | 📋 V3.0 | 第三方登录 |
| 2FA (TOTP) | 📋 V4.0 | 双因素认证 |
| Passkey | 📋 V4.0 | WebAuthn |

**登录流程：**
1. 用户提交邮箱+密码
2. 校验用户存在且状态为 ACTIVE
3. 验证密码哈希
4. 生成 Access Token（15分钟）+ Refresh Token（7天）
5. Refresh Token 存入 Redis
6. 返回 Token 对

**Token 刷新：**
- Access Token 过期后，使用 Refresh Token 换取新的 Token 对
- Refresh Token 存储在 Redis 中，支持主动失效（Logout）

---

### 3. 密码管理

| 功能 | 状态 | 说明 |
|------|------|------|
| 修改密码 | ✅ V1.0 | 需要当前密码 |
| 忘记密码 | ✅ V1.0 | 邮件发送重置链接（1小时过期） |
| 重置密码 | ✅ V1.0 | 通过重置 Token 设置新密码 |

---

### 4. 用户中心

| 功能 | 状态 | 说明 |
|------|------|------|
| 查看资料 | ✅ V1.0 | GET /users/me |
| 修改昵称 | ✅ V1.0 | PATCH /users/me |
| 修改头像 | ✅ V1.0 | PATCH /users/me (avatarUrl) |
| 查看余额 | ✅ V1.0 | GET /balance |
| 查看交易记录 | ✅ V1.0 | GET /balance/transactions |
| 查看调用日志 | ✅ V1.0 | GET /balance/logs |
| 注销账号 | ✅ V1.0 | 软删除 (deleted_at) |

---

### 5. 用户角色

| 角色 | 说明 | 权限 |
|------|------|------|
| USER | 普通用户 | 基础 API 调用 |
| VIP | VIP 用户 | 更高限额 |
| ENTERPRISE | 企业用户 | 组织功能 |
| AGENT | 代理商 | 分销功能 |
| ADMIN | 管理员 | 管理后台 |
| SUPER_ADMIN | 超级管理员 | 全部权限 |

---

### 6. 用户状态

| 状态 | 说明 |
|------|------|
| ACTIVE | 正常 |
| SUSPENDED | 暂停（可恢复） |
| BANNED | 封禁 |

## API 端点

```
POST   /auth/register          # 注册
POST   /auth/login             # 登录
POST   /auth/refresh           # 刷新 Token
POST   /auth/logout            # 登出
POST   /auth/change-password   # 修改密码
POST   /auth/forgot-password   # 忘记密码
POST   /auth/reset-password    # 重置密码
GET    /users/me               # 获取当前用户
PATCH  /users/me               # 更新用户资料
DELETE /users/me               # 注销账号
```

## 数据库模型

```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  phone          String?   @unique
  password_hash  String
  display_name   String?
  avatar_url     String?
  role           UserRole  @default(USER)
  status         UserStatus @default(ACTIVE)
  github_id      String?   @unique
  google_id      String?   @unique
  wechat_id      String?   @unique
  organization_id String?
  deleted_at     DateTime?
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt

  organization   Organization? @relation(fields: [organization_id], references: [id])
  balance        UserBalance?
  apiKeys        ApiKey[]
  subscriptions  UserSubscription[]
  orders         Order[]
  transactions   UserTransaction[]
  requestLogs    RequestLog[]

  @@map("users")
}
```
