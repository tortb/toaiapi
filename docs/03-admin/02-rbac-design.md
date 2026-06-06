# 02 RBAC 权限系统设计

> 适用版本：ToAIAPI V2.1+ · 范围：Admin 后台与所有 `/api/v1/admin/**` 接口的鉴权 / 授权 · 文档版本：v1.0 — 2026-06-05

---

## 目录

1. [设计目标](#1-设计目标)
2. [术语](#2-术语)
3. [实体模型（Prisma 片段 + 关系图）](#3-实体模型prisma-片段--关系图)
4. [权限四象限](#4-权限四象限)
5. [角色矩阵](#5-角色矩阵)
6. [鉴权链路（重点）](#6-鉴权链路重点)
7. [权限点命名规范](#7-权限点命名规范)
8. [权限缓存策略](#8-权限缓存策略)
9. [前端按钮级权限](#9-前端按钮级权限)
10. [Admin 路由保护（重点，必须完整）](#10-admin-路由保护重点必须完整)
11. [紧急预案（重点）](#11-紧急预案重点)
12. [审计与日志](#12-审计与日志)
13. [实施步骤](#13-实施步骤)
14. [验收标准](#14-验收标准)

---

## 1. 设计目标

| 目标 | 说明 | 验收指标 |
|------|------|----------|
| **修复 /admin 无鉴权漏洞** | `apps/frontend/src/app/admin/page.tsx` 与 `/admin/*` 子页面**无任何鉴权**；未登录用户可直接访问 Dashboard。 | 100% 受保护路径必须经过 JWT 校验 |
| **细粒度权限控制** | 菜单 / 按钮 / API / 数据 4 维度权限，最小粒度为单一接口 | 权限点覆盖率 = 100% |
| **性能（Redis 缓存）** | 鉴权不得每次查 DB，使用 Redis 缓存 user → permissions 映射 | 缓存命中率 ≥ 95% |
| **可审计** | 所有鉴权失败（401/403）必须落库 `security_logs` | 失败请求 100% 落盘 |
| **防锁死** | 任何误配置都不能让所有管理员失去访问 | 内置 super_admin 永不删除 / 启动自动恢复 / 紧急恢复接口 |

**设计原则**：

1. **后端是信任根** — 前端 Middleware 只是 UX 优化；任何接口在 NestJS 都必须再次校验。
2. **显式优于隐式** — 不使用"角色越大权限越大"的隐式继承；权限点必须显式分配给角色。
3. **失败安全** — Redis 不可用 / 缓存过期 / 数据库失败时**默认拒绝**（deny by default）。
4. **可回滚** — 任何 RBAC Migration 必须可逆（详见 §11.3）。

---

## 2. 术语

| 术语 | 释义 |
|------|------|
| 用户（User） | 系统使用者（前台 / 后台统一表） |
| 角色（Role） | 一组权限的命名集合，如 `super_admin` / `finance` |
| 权限点（Permission） | 单个原子操作，如 `user:create` / `order:refund` |
| 菜单（Menu） | 前端可见的导航项；菜单本身是一种"权限点" |
| 资源（Resource） | 后端受保护的对象，如 User / Order / ApiKey |
| 数据范围（DataScope） | 控制某角色可见的数据行：ALL / ORGANIZATION / SELF / DEPARTMENT |
| 中间件（Middleware） | Next.js 路由级钩子（运行在 Edge Runtime） |
| 守卫（Guard） | NestJS Controller 之前的鉴权拦截器 |
| 装饰器（Decorator） | `@Roles()` / `@Permissions()` 元数据声明 |

---

## 3. 实体模型（Prisma 片段 + 关系图）

### 3.1 实体关系图

```
                    ┌──────────────┐
                    │     User     │ (已存在，role 枚举保留)
                    └──────┬───────┘
                           │ 1:N
                           ▼
                    ┌──────────────┐         ┌──────────────┐
                    │   UserRole   │ N:1 ──▶ │     Role     │
                    │  (关联表)     │         │  (新表)      │
                    └──────────────┘         └──────┬───────┘
                                                    │ 1:N
                    ┌──────────────┐         ┌──────▼───────┐
                    │ RolePerm     │ N:1 ──▶ │ Permission   │
                    │ (关联表)     │         │ (新表)       │
                    └──────────────┘         └──────────────┘
                    ┌──────────────┐
                    │     Menu     │ (新表) — 通过 menu_code 与 Permission 关联
                    └──────────────┘
```

### 3.2 UserRole 关联表

```prisma
/// 用户-角色关联表（多对多）
model UserRole {
  id         String   @id @default(cuid())
  user_id    String
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role_id    String
  role       Role     @relation(fields: [role_id], references: [id], onDelete: Restrict)
  granted_by String?   // 授予人
  granted_at DateTime  @default(now())
  expires_at DateTime? // NULL = 永不过期；用于"临时授予"
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt

  @@unique([user_id, role_id])
  @@index([user_id])
  @@index([role_id])
  @@index([expires_at])
}
```

> **兼容性说明**：`User.role` 字段保留作为"主角色"冗余，兼容现有 `JwtStrategy.validate()` 与 `RolesGuard.roleHierarchy`。新代码优先从 `UserRole` 关联读取。

### 3.3 Role 表

```prisma
/// 角色表 — 权限的命名集合
model Role {
  id          String    @id @default(cuid())
  code        String    @unique  // 程序判断使用，不可修改
  name        String              // 显示名
  description String?
  /// super_admin=100 / admin=80 / operator=60 / finance=50 / auditor=40 / user=10
  level       Int       @default(0)
  is_system   Boolean   @default(false)  // 系统内置：true 时不可删除
  is_active   Boolean   @default(true)
  data_scope  DataScope @default(SELF)

  user_roles  UserRole[]
  permissions RolePermission[]
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  @@index([is_active])
  @@index([level])
}

enum DataScope {
  ALL            // 全部
  ORGANIZATION   // 本组织
  DEPARTMENT     // 本部门（V2.2+）
  SELF           // 本人
}
```

### 3.4 Permission 与 RolePermission 表

```prisma
/// 权限点表 — 原子操作单元
model Permission {
  id          String         @id @default(cuid())
  /// 权限点代码，格式 <resource>:<action>，全局唯一
  code        String         @unique
  name        String         // 显示名（中文）
  type        PermissionType
  /// 所属模块：user / order / model / system / log / finance / operation / dashboard
  module      String
  menu_code   String?        // 关联的菜单 code（按钮权限可空）
  description String?
  roles       RolePermission[]
  created_at  DateTime       @default(now())
  updated_at  DateTime       @updatedAt

  @@index([type])
  @@index([module])
  @@index([menu_code])
}

enum PermissionType {
  MENU    // 菜单权限
  BUTTON  // 按钮权限
  API     // API 权限
  DATA    // 数据权限（仅在 DataScope 字段控制）
}

model RolePermission {
  id            String     @id @default(cuid())
  role_id       String
  role          Role       @relation(fields: [role_id], references: [id], onDelete: Cascade)
  permission_id String
  permission    Permission @relation(fields: [permission_id], references: [id], onDelete: Cascade)
  created_at    DateTime   @default(now())

  @@unique([role_id, permission_id])
  @@index([role_id])
  @@index([permission_id])
}
```

### 3.5 Menu 表

```prisma
/// 菜单表 — 前端侧边栏与面包屑所需的全部菜单项
model Menu {
  id         String   @id @default(cuid())
  code       String   @unique   // 对应 Permission.code 中 type=MENU 的项
  parent_id  String?
  parent     Menu?    @relation("MenuTree", fields: [parent_id], references: [id], onDelete: Restrict)
  children   Menu[]   @relation("MenuTree")
  name       String
  icon       String?
  path       String   // 前端路由路径，如 /admin/users
  redirect   String?
  sort_order Int      @default(0)  // 数字越小越靠前
  visible    Boolean  @default(true)
  type       MenuType @default(MENU)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([parent_id])
  @@index([sort_order])
}

enum MenuType { GROUP MENU BUTTON }
```

### 3.6 DataScope 数据范围

数据权限**不单独建表**，通过 `Role.data_scope` 字段和 Permission 表的 `DATA` 类型组合实现。Service 层在数据查询时调用 `DataScopeService.buildWhereClause(user, 'user')` 动态追加 `WHERE organization_id = ?` 或 `WHERE id = ?` 条件。**严禁**在 Repository 层写死"管理员能看所有数据"的逻辑。

---

## 4. 权限四象限

| 象限 | 控制对象 | 实现位置 | 验证时机 |
|------|----------|----------|----------|
| **4.1 菜单权限** | 前端侧边栏的可见菜单项 | `Menu` 表 + 前端 `useMenus()` | 用户登录后初始化 |
| **4.2 按钮权限** | 前端页面上"新增 / 删除"等操作按钮 | `<Can permission="user:create">` 组件 | 组件挂载时 |
| **4.3 API 权限** | 后端 Controller 的具体接口 | `@Permissions('user:create')` + `PermissionsGuard` | 每个请求 |
| **4.4 数据权限** | Service 层返回的记录行 | `DataScopeService.buildWhereClause()` | 每次查询 |

**API 权限示例**：

```typescript
@Post('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin')
@Permissions('user:create')
async createUser(@Body() dto: CreateUserDto) { return this.userService.create(dto); }
```

> **强烈建议**：任何 Admin 接口同时使用 `@Roles()` 与 `@Permissions()` — 前者粗粒度、后者细粒度。

**数据权限 SQL 片段**：

| DataScope | SQL 追加（以 User 为例） |
|-----------|--------------------------|
| `ALL` | （无 WHERE 追加） |
| `ORGANIZATION` | `WHERE organization_id = :current_user_org_id` |
| `DEPARTMENT` | `WHERE department_id = :current_user_dept_id` |
| `SELF` | `WHERE id = :current_user_id` |

```typescript
// apps/backend/src/modules/user/user.service.ts
async list(pagination: PaginationDto) {
  const me = this.currentUser.get();
  const where = await this.dataScope.buildWhereClause(me, 'user');
  return this.repo.findMany({ ...pagination, where });
}
```

---

## 5. 角色矩阵

### 5.1 内置六角色

| code | 名称 | level | data_scope | is_system | 说明 |
|------|------|-------|-----------|-----------|------|
| `super_admin` | 超级管理员 | 100 | ALL | ✅ | 所有权限，包括角色管理；不可禁用 |
| `admin` | 管理员 | 80 | ALL | ✅ | 除角色管理外所有权限 |
| `operator` | 运营 | 60 | ALL | ✅ | 公告 / 工单 / 用户管理 |
| `finance` | 财务 | 50 | ALL | ✅ | 订单 / 账单 / 发票 / 充值 |
| `auditor` | 审计 | 40 | ALL | ✅ | 日志只读 |
| `user` | 普通用户 | 10 | SELF | ✅ | 前台用户 |

### 5.2 默认权限点映射表

> ✅ = 拥有该权限 · 完整权限点定义见 §7.3

- **用户中心**：`user:list/detail`（admin/op/fin/sa/aud + user 限自己）、`user:create/update`（admin/op/sa）、`user:delete`（admin/sa）、`user:update_role`（仅 sa）、`user:update_status`（admin/op/sa）、`user:reset_password`（admin/sa）、`user:recharge`（admin/fin/sa）
- **API Key**：`apikey:list`（admin/op/sa/aud + user 限自己）、`apikey:create/update/delete`（admin/op/sa + user）、`apikey:reset`（admin/sa）
- **订单**：`order:list/detail`（admin/op/fin/sa/aud + user 限自己）、`order:refund` / `order:manual_recharge`（admin/fin/sa）、`order:export`（admin/fin/sa）
- **账单 / 发票 / 充值**：`*:list`（admin/fin/sa/aud + user 限自己）、`*:review/export`（admin/fin/sa）
- **模型**：`model:list`（admin/sa/aud）、`model:create/update/delete/pricing`（admin/sa）
- **渠道**：`channel:list`（admin/sa/aud）、`channel:create/update/delete/test`（admin/sa）
- **角色 / 权限**：`role:*` `permission:*`（**仅 super_admin**）
- **菜单**：`menu:list`（admin/sa）、`menu:update`（仅 sa）
- **运营**：`announcement:*` `ticket:*`（admin/op/sa）
- **安全**：`blacklist:*` `ip_rule:*`（admin/sa + `blacklist:list` auditor）
- **系统**：`system:settings:read` `system:smtp:read` `system:redis:monitor`（admin/sa）、`system:settings:update` `system:smtp:update`（仅 sa）
- **日志**：`log:*:list`（admin/sa/aud）
- **Dashboard**：`dashboard:*`（所有管理员角色）

> 简写：admin=A, operator=O, finance=F, super_admin=S/SA, auditor=AU, user=U

### 5.3 角色继承

**不实现自动继承**。理由：

1. 显式优于隐式 — `admin` 拥有 `user:delete` 是因为表里写了，不是因为"它继承 operator"。
2. 避免"超集陷阱" — 删 `operator` 的某权限时不应影响 `admin`。
3. 审计友好 — 任何权限调整在 `role_permissions` 表里一目了然。

**例外**：`super_admin` 拥有**所有权限**通过 `PermissionsGuard` 内置短路（见 §6.2）实现，不通过 `role_permissions` 表配置。

---

## 6. 鉴权链路（重点）

### 6.1 前端：Next.js Middleware 守卫 `/admin/*`

**位置**：`apps/frontend/middleware.ts`（新建） · **匹配**：`matcher: ['/admin/:path*']`

**流程图**：

```
请求进入 /admin/*
       │
       ▼
┌────────────────────────┐
│ 1. 提取 JWT             │  ← Cookie: toaiapi_token 或 Authorization
└───────────┬────────────┘
            ├─── 缺失 ──▶ 302 /login?redirect=<原路径>
            ▼
┌────────────────────────┐
│ 2. parseJwt(payload)   │  ← 解析 payload（不验签，服务端最终验）
└───────────┬────────────┘
            ├─── 失败 ──▶ 302 /login?redirect=<原路径>
            ▼
┌────────────────────────┐
│ 3. 检查 type='access'   │
│    检查 exp 未过期      │
└───────────┬────────────┘
            ├─── 失败 ──▶ 302 /login?redirect=<原路径>
            ▼
┌────────────────────────┐
│ 4. role ∈ {ADMIN,      │
│    SUPER_ADMIN}?       │
└───────────┬────────────┘
            ├─── 不匹配 ──▶ 302 /403
            ▼
┌────────────────────────┐
│ 5. NextResponse.next() │
│    放行                 │
└────────────────────────┘
```

**完整代码实现**（可直接复制）：

```typescript
// apps/frontend/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin 后台路由守卫 — 修复 /admin 无鉴权漏洞
 * SECURITY: 此处只做"快速失败"，不进行 JWT 验签；服务端 Guard 才是信任根。
 */
const COOKIE_NAME = 'toaiapi_token';
const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);
const LOGIN_PATH = '/login';
const FORBIDDEN_PATH = '/403';

interface JwtPayload { sub?: string; role?: string; exp?: number; type?: string; }

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8')) as JwtPayload;
  } catch { return null; }
}

function redirectToLogin(req: NextRequest, path: string, search: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = `?redirect=${encodeURIComponent(path + search)}`;
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // 1. 提取 JWT
  let token = request.cookies.get(COOKIE_NAME)?.value
    ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return redirectToLogin(request, pathname, search);
  // 2. 解析 payload
  const payload = parseJwt(token);
  if (!payload?.sub || !payload?.role) return redirectToLogin(request, pathname, search);
  // 3. 校验 type 与 exp
  if (payload.type !== 'access') return redirectToLogin(request, pathname, search);
  if (payload.exp && payload.exp * 1000 < Date.now()) return redirectToLogin(request, pathname, search);
  // 4. 角色判断
  if (!ADMIN_ROLES.has(payload.role.toUpperCase())) {
    const url = request.nextUrl.clone();
    url.pathname = FORBIDDEN_PATH;
    return NextResponse.redirect(url);
  }
  // 5. 放行
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
```

### 6.2 后端：NestJS Guard 三道关

所有 Admin 接口必须经过 **JwtAuthGuard → RolesGuard → PermissionsGuard**。

**流程图**：

```
HTTP Request /api/v1/admin/xxx
       │
       ▼
┌──────────────────────────┐
│ 1. JwtAuthGuard          │ ← 必携有效 JWT；HS256 验签 + exp + type='access' + user.status
│    失败 → 401             │
└───────────┬──────────────┘
            │ 通过
            ▼
┌──────────────────────────┐
│ 2. RolesGuard            │ ← 粗粒度角色判断
│    失败 → 403             │
└───────────┬──────────────┘
            │ 通过
            ▼
┌──────────────────────────┐
│ 3. PermissionsGuard      │ ← 细粒度权限点；super_admin 短路；Redis 缓存/DB 回源
│    失败 → 403             │
└───────────┬──────────────┘
            │ 通过
            ▼
┌──────────────────────────┐
│ 4. Handler → Service     │ ← 注入 DataScope 过滤
└──────────────────────────┘
```

**`@Permissions()` 装饰器**（新建）：

```typescript
// apps/backend/src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const PERMISSIONS_KEY = 'permissions';

/** 权限点装饰器（AND 关系） */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

**`PermissionsGuard` 完整实现**：

```typescript
// apps/backend/src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUserInfo } from '../decorators/current-user.decorator';

export const PERMISSIONS_KEY = 'permissions';
const CACHE_TTL_SECONDS = 30 * 60;
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY, [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request['user'] as CurrentUserInfo | undefined;
    if (!user) throw new ForbiddenException('Authentication required');
    if (user.role.toUpperCase() === SUPER_ADMIN_ROLE) return true; // super_admin 短路

    const cacheKey = `rbac:user:${user.id}:permissions`;
    let userPerms: Set<string> | null = null;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) userPerms = new Set(JSON.parse(cached) as string[]);
    } catch (e) {
      this.logger.error('Redis unavailable, falling back to DB', e as Error);
    }
    if (!userPerms) {
      userPerms = await this.loadPermsFromDb(user.id);
      await this.redis.set(cacheKey, JSON.stringify([...userPerms]), CACHE_TTL_SECONDS);
    }
    const missing = required.filter((p) => !userPerms!.has(p));
    if (missing.length > 0) {
      this.logger.warn(`User ${user.id} lacks permissions: ${missing.join(', ')}`);
      throw new ForbiddenException(`Missing permissions: ${missing.join(', ')}`);
    }
    return true;
  }

  /** User → UserRole → Role → RolePermission → Permission */
  private async loadPermsFromDb(userId: string): Promise<Set<string>> {
    const rows = await this.prisma.userRole.findMany({
      where: { user_id: userId, OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }] },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    const set = new Set<string>();
    for (const ur of rows) {
      if (!ur.role.is_active) continue;
      for (const rp of ur.role.permissions) set.add(rp.permission.code);
    }
    return set;
  }
}
```

### 6.3 异常处理

| HTTP | 含义 | 触发场景 | 前端处理 |
|------|------|----------|----------|
| **401** | 未登录 / Token 无效 | 缺 JWT、签名错误、过期、type≠'access'、user.status≠ACTIVE | 清 token，跳 `/login?redirect=<当前>` |
| **403 角色不符** | 角色不满足 `@Roles()` | `user.role` 不在 `@Roles()` 列表中 | 跳 `/403` |
| **403 权限点不足** | 不满足 `@Permissions()` | 用户缺少 `user:create` 等 | 跳 `/403` 并展示"缺少权限：xxx" |
| **403 数据范围越权** | DataScope 拒绝 | 跨企业查询 | 跳 `/403` 并提示"数据范围受限" |
| **429** | 限流 | 1 分钟内调用超过 N 次 | 提示"操作过于频繁" |

后端异常过滤器统一处理（沿用 `apps/backend/src/common/filters/http-exception.filter.ts`），无需额外实现。

---

## 7. 权限点命名规范

### 7.1 格式

```
<resource>:<action>
```

- **resource**：资源域，复数形式
- **action**：操作动词，仅限下列 8 种之一

> **禁止**：驼峰（`userList` ❌）、下划线（`user_list` ❌）、嵌套（`admin.user.create` ❌）、冗余前缀（`admin:user:create` ❌）。

### 7.2 Action 词表

| Action | 含义 | HTTP 映射 | 示例 |
|--------|------|----------|------|
| `list` | 列表查询 | `GET /:resource` | `GET /api/v1/admin/users` |
| `detail` | 详情查询 | `GET /:resource/:id` | `GET /api/v1/admin/users/:id` |
| `create` | 创建 | `POST /:resource` | `POST /api/v1/admin/users` |
| `update` | 更新 | `PATCH /:resource/:id` | `PATCH /api/v1/admin/users/:id` |
| `delete` | 删除 | `DELETE /:resource/:id` | `DELETE /api/v1/admin/users/:id` |
| `export` | 导出 | `GET /:resource/export` | `GET /api/v1/admin/bills/export` |
| `import` | 导入 | `POST /:resource/import` | `POST /api/v1/admin/users/import` |
| `<业务动词>` | 自定义 | 自定义 | `refund` / `reset` / `approve` / `review` |

### 7.3 完整权限点列表（按模块，约 71 项）

- **用户中心（11）**：`user:list` `user:detail` `user:create` `user:update` `user:delete` `user:update_role` `user:update_status` `user:reset_password` `user:recharge` `user:freeze` `user:export`
- **用户分组（4）**：`user_group:list` `user_group:create` `user_group:update` `user_group:delete`
- **API Key（6）**：`apikey:list` `apikey:create` `apikey:update` `apikey:delete` `apikey:reset` `apikey:export`
- **订单（5）**：`order:list` `order:detail` `order:refund` `order:manual_recharge` `order:export`
- **充值（3）**：`recharge:list` `recharge:create` `recharge:export`
- **账单（3）**：`bill:list` `bill:detail` `bill:export`
- **发票（3）**：`invoice:list` `invoice:review` `invoice:export`
- **模型（5）**：`model:list` `model:create` `model:update` `model:delete` `model:pricing`
- **渠道（5）**：`channel:list` `channel:create` `channel:update` `channel:delete` `channel:test`
- **角色（5）**：`role:list` `role:create` `role:update` `role:delete` `role:assign`
- **权限（1）**：`permission:list`
- **菜单（2）**：`menu:list` `menu:update`
- **运营（7）**：`announcement:list` `announcement:create` `announcement:update` `announcement:delete` `ticket:list` `ticket:reply` `ticket:close`
- **安全（5）**：`blacklist:list` `blacklist:create` `blacklist:delete` `ip_rule:list` `ip_rule:create`
- **系统（6）**：`system:settings:read` `system:settings:update` `system:smtp:read` `system:smtp:update` `system:redis:monitor` `system:status`
- **日志（4）**：`log:operation:list` `log:request:list` `log:security:list` `log:login:list`
- **Dashboard（3）**：`dashboard:overview` `dashboard:model_stat` `dashboard:channel_stat`

---

## 8. 权限缓存策略

### 8.1 Redis Key 设计

| Key 格式 | Value | 内容 | TTL |
|----------|-------|------|-----|
| `rbac:user:{userId}:permissions` | String (JSON) | 权限点集合 | 30 min |
| `rbac:user:{userId}:menus` | String (JSON) | 菜单树（已过滤） | 30 min |
| `rbac:user:{userId}:data_scope` | Hash | `{ resource: 'ALL'\|'ORG'\|'SELF' }` | 30 min |
| `rbac:user:{userId}:roles` | String (JSON) | 角色 code 列表 | 30 min |

> **30 分钟 TTL 的理由**：太短（< 5 分钟）→ 命中率低；太长（> 2 小时）→ 权限变更生效延迟。

### 8.2 主动失效

| 事件 | 删除的 Key | 调用位置 |
|------|-----------|----------|
| 角色权限点变更 | 该角色下所有用户的 `rbac:user:*:permissions` | `RoleService.assignPermission()` |
| 用户角色授予/撤销 | `rbac:user:{userId}:*` 全部 | `UserRoleService.assign()/revoke()` |
| 用户被禁用/删除 | `rbac:user:{userId}:*` 全部 | `UserService.updateStatus()` |
| 角色被禁用 | 该角色下所有用户的 `rbac:user:*:permissions` | `RoleService.update()` |

**实现**：

```typescript
// apps/backend/src/modules/rbac/services/permission-cache.service.ts
@Injectable()
export class PermissionCacheService {
  constructor(private readonly redis: RedisService) {}

  async invalidateUser(userId: string): Promise<void> {
    const keys = [
      `rbac:user:${userId}:permissions`,
      `rbac:user:${userId}:menus`,
      `rbac:user:${userId}:data_scope`,
      `rbac:user:${userId}:roles`,
    ];
    await Promise.all(keys.map((k) => this.redis.del(k)));
  }

  async invalidateRole(roleId: string): Promise<number> {
    const userIds = await this.prisma.userRole.findMany({
      where: { role_id: roleId }, select: { user_id: true },
    });
    await Promise.all(userIds.map((u) => this.invalidateUser(u.user_id)));
    return userIds.length;
  }
}
```

### 8.3 缓存预热（登录后立即执行）

```typescript
// AuthService.login 末尾
async login(dto: LoginDto) {
  // ... 原有逻辑 ...
  const tokens = await this.generateTokens(user.id, user.email, user.role);
  await this.permissionCache.warmup(user.id); // 预热 RBAC 缓存
  return { user, tokens };
}

async warmup(userId: string): Promise<void> {
  const [perms, menus, scopes, roles] = await Promise.all([
    this.loadPermsFromDb(userId), this.loadMenusFromDb(userId),
    this.loadDataScopeFromDb(userId), this.loadRolesFromDb(userId),
  ]);
  await Promise.all([
    this.redis.setJson(`rbac:user:${userId}:permissions`, [...perms], 1800),
    this.redis.setJson(`rbac:user:${userId}:menus`, menus, 1800),
    this.redis.setJson(`rbac:user:${userId}:data_scope`, scopes, 1800),
    this.redis.setJson(`rbac:user:${userId}:roles`, roles, 1800),
  ]);
}
```

---

## 9. 前端按钮级权限

### 9.1 组件 `<Can>`

**位置**：`apps/frontend/src/components/auth/Can.tsx`

```typescript
'use client';
import { usePermission } from '@/hooks/use-permission';

interface CanProps {
  /** 权限点；多个为 AND 关系 */
  permission: string | string[];
  /** 任意一个权限点满足即可（OR），与 permission 互斥 */
  anyOf?: string[];
  /** 无权限时显示的兜底内容（默认隐藏） */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/** @example
 * <Can permission="user:create">
 *   <Button onClick={openCreateModal}>新增用户</Button>
 * </Can>
 * <Can anyOf={['user:update', 'user:delete']}>
 *   <Button>编辑 / 删除</Button>
 * </Can>
 */
export function Can({ permission, anyOf, fallback = null, children }: CanProps) {
  const required = anyOf ?? (Array.isArray(permission) ? permission : [permission]);
  const has = usePermission(required, !!anyOf);
  return <>{has ? children : fallback}</>;
}
```

### 9.2 Hook `usePermission` + AuthStore

```typescript
// apps/frontend/src/hooks/use-permission.ts
'use client';
import { useAuthStore } from '@/stores/auth-store';

/** @param isAny - true=OR（任一满足）/ false=AND（全部满足） */
export function usePermission(codes: string[], isAny = false): boolean {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  return isAny ? codes.some((c) => permissions.includes(c)) : codes.every((c) => permissions.includes(c));
}

// apps/frontend/src/stores/auth-store.ts
interface AuthUser {
  id: string; email: string; displayName: string; role: string;
  /** 权限点 code 列表（已去重） */
  permissions: string[];
}
```

**登录后获取权限点**：

```typescript
// apps/frontend/src/services/auth.service.ts
async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await fetch('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  return {
    id: json.data.id, email: json.data.email, displayName: json.data.displayName,
    role: json.data.role, permissions: json.data.permissions ?? [],
  };
}
```

### 9.3 与菜单的联动

```typescript
// apps/frontend/src/components/layout/Sidebar.tsx
'use client';
import { useAuthStore } from '@/stores/auth-store';

export function Sidebar() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  const menuTree = useMenuTree(); // 来自 /api/v1/admin/menus，已按权限过滤
  return (
    <nav>
      {menuTree.map((group) => (
        <div key={group.code}>
          <h3>{group.name}</h3>
          {group.children?.map((item) => {
            // 双重保险：菜单接口已过滤，前端再过滤一次
            if (!permissions.includes(item.code)) return null;
            return <SidebarItem key={item.code} item={item} />;
          })}
        </div>
      ))}
    </nav>
  );
}
```

---

## 10. Admin 路由保护（重点，必须完整）

### 10.1 问题描述

**漏洞**：

| 位置 | 现状 | 风险 |
|------|------|------|
| `apps/frontend/src/app/admin/page.tsx` | 完全无鉴权 | 严重 — 泄露运营数据 |
| `/admin/*`（未来子页面） | 当前无 Middleware | 严重 — 子页面同样无鉴权 |
| `/api/v1/admin/**` | 后端 Guard 已有 | 中 — 前端绕过时无拦截 |

**攻击向量**：

1. 攻击者直接访问 `https://toaiapi.com/admin` → **当前可直接看到 Dashboard**
2. 攻击者 `fetch('https://api.toaiapi.com/api/v1/admin/users')` → 后端返回 401
3. 攻击者修改前端代码绕过 Middleware → 仍被后端 401/403 拦截（双保险）

### 10.2 修复方案

**前端 Middleware**：见 §6.1 完整代码（`apps/frontend/middleware.ts`）。

**关键点**：

1. **不验签** — Edge Runtime 验签需 JWT_SECRET，增加复杂度且收益低；服务端 Guard 才是信任根。
2. **不持久化角色信息** — 仅从 JWT payload 临时读取。
3. **跳转时保留原路径** — `?redirect=` 参数让用户登录后跳回。
4. **静态资源自动排除** — `matcher` 不包含 `/_next/*`、`.ico`。

**后端双保险**：

```typescript
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin', 'super_admin')
@Controller('admin/v1')
export class AdminV1Controller { /* ... */ }
```

> **路径变更说明**：原 `/api/v1/admin/...` 改为 `/api/v1/admin/v1/...`，留出 `v2/` 用于未来迭代；也可保持现有路径，由 PR review 决定。

### 10.3 验收用例

| # | 场景 | 预期 | 验证方法 |
|---|------|------|----------|
| 1 | 未登录访问 `/admin` | 302 → `/login?redirect=%2Fadmin` | e2e：检查 `Location` 响应头 |
| 2 | 普通 user 登录后访问 `/admin` | 302 → `/403` | e2e：登录 USER，访问 `/admin` |
| 3 | admin 登录后访问 `/admin` | 进入 Dashboard | e2e：检查页面包含"控制台" |
| 4 | super_admin 访问 `/admin` | 正常进入 | e2e |
| 5 | 伪造 Cookie 调 `/api/v1/admin/users` | 401（JwtAuthGuard 拦截） | 集成测试：构造伪造 JWT |
| 6 | 普通 user 携带有效 JWT 调 admin API | 403（RolesGuard 拦截） | 集成测试 |
| 7 | operator 调 `/api/v1/admin/users` | 200 或 403（按权限点） | 集成测试 |
| 8 | 修改前端代码删掉 `middleware.ts` | API 仍返回 401/403 | 安全审计 + 集成测试 |

---

## 11. 紧急预案（重点）

### 11.1 风险

**场景**：由于 RBAC 误配置、数据库迁移错误、缓存污染、误删 super_admin 角色等，导致**所有管理员无法登录或无法访问任何 Admin 接口**。

**示例**：

1. DBA 误执行 `DELETE FROM role_permissions WHERE role_id = '<super_admin_role_id>'`
2. 工程师错误发布把 `admin` 角色权限点全清空的 migration
3. 攻击者拿到 admin 凭证后篡改 `UserRole` 表
4. Redis 缓存被污染（即使数据库正常也无法调用 API）

### 11.2 缓解措施

#### 措施 1：内置 super_admin 账号（永不删除）

```bash
# .env.production
SUPER_ADMIN_EMAIL=admin@toaiapi.com
SUPER_ADMIN_PASSWORD=<首次部署时随机生成，存到 Vault>
```

**保护逻辑**：

```typescript
// 在 UserService.delete() / updateStatus(BANNED) / updateRole() 前调用
async function ensureSuperAdminProtection(userId: string): Promise<void> {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (user && user.email === process.env.SUPER_ADMIN_EMAIL) {
    throw new ConflictException('Cannot modify the built-in super admin account');
  }
}
```

#### 措施 2：启动时自动恢复脚本

**位置**：`apps/backend/src/scripts/restore-super-admin.ts` · **执行时机**：`main.ts` 启动 NestJS 前调用。

```typescript
// apps/backend/src/scripts/restore-super-admin.ts
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { Logger } from '@nestjs/common';
const logger = new Logger('RestoreSuperAdmin');

/** 启动时自动恢复 super_admin 账号。流程：upsert 用户 → 重建 super_admin 角色 →
 *  重建该角色的所有权限（从 DB 读取）→ 建立 UserRole 关联。执行时间 < 60 秒。 */
export async function restoreSuperAdmin(prisma: PrismaClient): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) { logger.warn('SUPER_ADMIN env not set, skip restore'); return; }
  const start = Date.now();
  logger.log(`Restoring super admin: ${email}`);

  // 1. upsert 用户
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
  });
  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash: passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE', deleted_at: null },
    create: { email, password_hash: passwordHash, display_name: 'Super Admin', role: 'SUPER_ADMIN', status: 'ACTIVE' },
  });

  // 2. 确保 super_admin 角色存在
  const role = await prisma.role.upsert({
    where: { code: 'super_admin' },
    update: { is_active: true, is_system: true, level: 100, data_scope: 'ALL' },
    create: { code: 'super_admin', name: '超级管理员', level: 100, is_system: true, is_active: true, data_scope: 'ALL', description: '系统内置超级管理员，拥有所有权限' },
  });

  // 3. 重建 super_admin 角色的所有权限
  const allPerms = await prisma.permission.findMany({ select: { id: true } });
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { role_id_permission_id: { role_id: role.id, permission_id: perm.id } },
      update: {}, create: { role_id: role.id, permission_id: perm.id },
    });
  }

  // 4. 建立 UserRole 关联
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
    update: { expires_at: null }, create: { user_id: user.id, role_id: role.id },
  });
  logger.log(`Super admin restored in ${Date.now() - start}ms. User=${user.id} Role=${role.id} Perms=${allPerms.length}`);
}
```

**`main.ts` 集成**：

```typescript
import { restoreSuperAdmin } from './scripts/restore-super-admin';
async function bootstrap() {
  const prisma = new PrismaClient();
  try { await restoreSuperAdmin(prisma); }
  catch (e) { console.error('Failed to restore super admin', e); /* 不阻止启动 */ }
  finally { await prisma.$disconnect(); }
  const app = await NestFactory.create(AppModule);
  /* ... */
}
bootstrap();
```

#### 措施 3：紧急恢复接口（带 IP 白名单）

**路径**：`POST /api/v1/auth/emergency-grant` · **鉴权**：必须在 `EMERGENCY_WHITELIST_IPS` 列表内。

```typescript
@Post('emergency-grant')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: '紧急授权（仅限白名单 IP）',
  description: '当 RBAC 系统异常导致所有管理员被锁死时使用' })
async emergencyGrant(@Body() dto: EmergencyGrantDto) {
  return this.authService.emergencyGrant(dto.email, dto.reason);
}
```

```bash
# .env.production
EMERGENCY_WHITELIST_IPS=10.0.0.0/8,172.16.0.0/12,114.114.114.114
```

**每次调用必须**：发送告警邮件至 `SECURITY_ALERT_EMAIL` + 写入 `security_logs`（level=CRITICAL）。

### 11.3 数据库 Migration 回滚

**规则**：每个 RBAC migration 必须包含 `down.sql` 或可被 `prisma migrate reset` 干净回滚。

**Migration 命名规范**：

```
prisma/migrations/
├── 20260606_000000_rbac_create_role_permission_tables/{migration.sql,down.sql}
├── 20260606_000001_rbac_seed_builtin_roles/{migration.sql,down.sql}
└── 20260606_000002_rbac_seed_builtin_permissions/{migration.sql,down.sql}
```

**回滚演练（每月 1 次）**：

```bash
pg_dump toaiapi > backup_before_rbac_rollback.sql  # 1. 备份
cd apps/backend
npx prisma migrate resolve --rolled-back 20260606_000002_rbac_seed_builtin_permissions  # 2. 回滚
npx prisma migrate resolve --rolled-back 20260606_000001_rbac_seed_builtin_roles
npx prisma migrate resolve --rolled-back 20260606_000000_rbac_create_role_permission_tables
psql toaiapi -c "SELECT id, email, role FROM users WHERE role='SUPER_ADMIN';"  # 3. 验证
```

---

## 12. 审计与日志

### 12.1 security_logs 表

```prisma
/// 安全审计日志表（高频写入，不设外键避免锁竞争）
model SecurityLog {
  id          String          @id @default(cuid())
  level       SecurityLogLevel
  /// 事件类型：AUTH_FAIL / PERMISSION_DENIED / ROLE_CHANGED / EMERGENCY_GRANT 等
  event       String
  user_id     String?
  user_email  String?
  path        String?
  method      String?
  required_permission String?
  ip          String?
  user_agent  String?
  context     Json?
  created_at  DateTime        @default(now())

  @@index([user_id, created_at])
  @@index([event, created_at])
  @@index([level, created_at])
  @@index([ip, created_at])
}

enum SecurityLogLevel { INFO WARN ERROR CRITICAL }
```

### 12.2 必须记录的事件

| event | level | 触发点 |
|-------|-------|--------|
| `AUTH_FAIL_INVALID_TOKEN` / `AUTH_FAIL_USER_INACTIVE` | WARN | JwtAuthGuard / JwtStrategy 抛 401 |
| `PERMISSION_DENIED_ROLE` / `PERMISSION_DENIED_PERMISSION` | WARN | RolesGuard / PermissionsGuard 抛 403 |
| `PERMISSION_DENIED_DATA_SCOPE` | WARN | DataScopeService 拒绝 |
| `ROLE_CHANGED` / `PERMISSION_CHANGED` | INFO | UserRoleService / RolePermissionService 增删 |
| `EMERGENCY_GRANT` | CRITICAL | /auth/emergency-grant 调用 |
| `SUPER_ADMIN_PROTECTION_TRIGGERED` | WARN | 尝试修改 super_admin 被拒 |
| `CACHE_PURGE` | INFO | 主动失效缓存 |

### 12.3 日志写入

```typescript
// apps/backend/src/common/services/security-logger.service.ts
@Injectable()
export class SecurityLoggerService {
  constructor(private readonly prisma: PrismaService) {}
  async log(e: { level: SecurityLogLevel; event: string; userId?: string; userEmail?: string;
    path?: string; method?: string; requiredPermission?: string; ip?: string;
    userAgent?: string; context?: Record<string, any>; }): Promise<void> {
    try { await this.prisma.securityLog.create({ data: e }); }
    catch (err) { /* 审计日志写入失败不能影响主业务 */
      console.error('Failed to write security log', err);
    }
  }
}
```

---

## 13. 实施步骤

### 步骤 1：Schema 迁移
- [ ] `prisma/schema.prisma` 新增 `Role` / `Permission` / `RolePermission` / `UserRole` / `Menu` / `SecurityLog` 6 个 model
- [ ] 新增 enum：`DataScope` / `PermissionType` / `MenuType` / `SecurityLogLevel`
- [ ] 执行 `npx prisma migrate dev --name rbac_init`
- [ ] 编写 `down.sql` 验证可回滚

### 步骤 2：内置数据
- [ ] 新增 `prisma/seed/rbac.seed.ts`：6 个内置角色 + 71 个权限点 + 角色-权限映射（§5.2）+ 菜单树
- [ ] 接入 `prisma/seed/index.ts` 主流程
- [ ] 启动时执行 `restoreSuperAdmin`（§11.2）

### 步骤 3：NestJS Guard 实现
- [ ] 新增 `apps/backend/src/common/decorators/permissions.decorator.ts`
- [ ] 新增 `apps/backend/src/common/guards/permissions.guard.ts`
- [ ] 新增 `apps/backend/src/common/services/permission-cache.service.ts`
- [ ] 新增 `apps/backend/src/modules/rbac/` 模块（service / controller / repository / module）
- [ ] 在 `app.module.ts` 注册 `RbacModule`
- [ ] `AdminController` 顶部 `UseGuards` 链中增加 `PermissionsGuard`

### 步骤 4：Next.js Middleware
- [ ] 新增 `apps/frontend/middleware.ts`（§6.1）
- [ ] 新增 `apps/frontend/src/app/403/page.tsx`
- [ ] 在 `apps/frontend/src/app/admin/layout.tsx` 增加 server-side 二次校验（推荐）
- [ ] 验证 `next.config.mjs` 未禁用 Middleware

### 步骤 5：前端 Can 组件
- [ ] 新增 `apps/frontend/src/hooks/use-permission.ts`
- [ ] 新增 `apps/frontend/src/components/auth/Can.tsx`
- [ ] `apps/frontend/src/stores/auth-store.ts` 加入 `permissions: string[]`
- [ ] `apps/frontend/src/services/auth.service.ts` 的 `fetchCurrentUser()` 注入 `permissions`
- [ ] `/api/v1/auth/me` 返回 `permissions` 字段

### 步骤 6：缓存预热
- [ ] `AuthService.login()` 末尾调用 `permissionCache.warmup(userId)`
- [ ] `AuthService.refreshTokens()` 末尾重新预热

### 步骤 7：紧急恢复
- [ ] 新增 `apps/backend/src/scripts/restore-super-admin.ts`
- [ ] 在 `main.ts` 启动前调用
- [ ] 新增 `POST /api/v1/auth/emergency-grant`
- [ ] 新增 `EmergencyIpGuard` 做 IP 白名单

### 步骤 8：审计日志
- [ ] 所有 Guard / Service 失败路径调用 `SecurityLoggerService.log()`
- [ ] `AdminController` 操作日志记录修改人 / 时间 / diff

---

## 14. 验收标准

### 14.1 安全验收
- [ ] `/admin` 路由 100% 需要鉴权（未登录 → 302 /login；非管理员 → 302 /403）
- [ ] 普通 `user` 角色无法访问任何 `/api/v1/admin/**`（后端 403）
- [ ] 伪造 JWT 调任何 admin API 均返回 401
- [ ] 修改前端 Middleware 绕过仍被后端 Guard 拦截
- [ ] 所有 71 个权限点均能正确控制对应接口

### 14.2 性能验收
- [ ] Redis 缓存命中率 ≥ 95%（Prometheus 指标 `rbac_cache_hit_ratio`）
- [ ] 登录后第一次请求的 RBAC 鉴权延迟 ≤ 5ms（命中预热）
- [ ] 缓存未命中回源到 DB 的 P99 延迟 ≤ 50ms

### 14.3 可用性验收
- [ ] 紧急恢复脚本可在 **60 秒内**恢复 super_admin 权限（含 argon2 哈希）
- [ ] `POST /auth/emergency-grant` 可在非白名单 IP 调用时返回 403
- [ ] Redis 不可用时降级到 DB，服务不中断

### 14.4 审计验收
- [ ] 100% 的 401 / 403 鉴权失败落 `security_logs` 表
- [ ] 所有 `role:*` `permission:*` 写操作记录操作人 / 时间 / diff
- [ ] 紧急恢复接口每次调用都发送告警邮件 + 落 CRITICAL 级别日志

### 14.5 测试用例验收
- [ ] e2e：§10.3 表中 8 个验收用例全部通过
- [ ] 单元：`PermissionsGuard` 覆盖以下场景：super_admin 短路、缓存命中、缓存未命中回源 DB、缺少任一权限点抛 ForbiddenException、多个权限点为 AND 关系
- [ ] 集成：每个内置角色对 71 个权限点的访问矩阵测试通过

---

## 附录 A：与现有代码的对接清单

| 现有文件 | 影响 | 处理方式 |
|----------|------|----------|
| `apps/backend/src/common/guards/jwt-auth.guard.ts` | 无 | 复用 |
| `apps/backend/src/common/guards/roles.guard.ts` | 无 | 复用，作为粗粒度第一道 |
| `apps/backend/src/common/decorators/roles.decorator.ts` | 无 | 复用 |
| `apps/backend/src/modules/auth/strategies/jwt.strategy.ts` | payload 可选增加 `permissions` 字段 | 扩展 |
| `apps/backend/src/modules/admin/admin.controller.ts` | 顶部加 `PermissionsGuard` + 方法级 `@Permissions` | 增强 |
| `apps/backend/prisma/schema.prisma` | 新增 6 张表 + 4 个 enum | 扩展 |
| `apps/backend/prisma/seed/admin.seed.ts` | 增加 super_admin 保护 | 增强 |
| `apps/backend/src/modules/auth/auth.service.ts` | 登录后预热缓存 | 增强 |
| `apps/frontend/src/app/admin/page.tsx` | 保持不变，鉴权由 Middleware 负责 | 无修改 |
| `apps/frontend/src/lib/api.ts` | 增加携带 `Authorization` 头的 helper | 增强 |
| `apps/frontend/src/app/admin/layout.tsx` | 新建，含二次校验与用户上下文 | 新建 |

## 附录 B：相关文档

- `docs/03-admin/01-admin-prd.md` — Admin 后台产品需求（依赖本文档定义权限点）
- `docs/03-admin/03-database-schema.md` — 数据库 Schema 详细设计
- `docs/03-admin/04-api-spec.md` — Admin API 规范（每个接口标注权限点）
- `docs/03-admin/05-admin-ui-spec.md` — Admin UI 规范（使用 `<Can>` 组件）
- `docs/03-admin/06-frontend-route-map.md` — 前端路由与菜单映射
- `docs/03-admin/07-integration-plan.md` — 实施计划
- `.ai/security-rules.md` — 现有安全规范
- `.ai/architecture-rules.md` — 严格分层架构

---

**文档结束。** 本文档为 Spec 阶段产物，不包含代码实现。代码实现在 Apply 阶段按 §13 步骤执行。
