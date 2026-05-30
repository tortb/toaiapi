# ToAIAPI Architecture Rules

## 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│                  apps/frontend / apps/admin               │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────┐
│                   API Gateway Layer                       │
│              Rate Limit / Auth / Logging                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   Backend (NestJS)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Auth   │ │  User   │ │ Billing │ │ Payment │       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
│       │           │           │           │              │
│  ┌────▼───────────▼───────────▼───────────▼────┐        │
│  │              Service Layer                    │        │
│  └────────────────────┬─────────────────────────┘        │
│                       │                                   │
│  ┌────────────────────▼─────────────────────────┐        │
│  │            Repository Layer                    │        │
│  └────────────────────┬─────────────────────────┘        │
│                       │                                   │
└───────────────────────┼───────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────┐
│                    Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │    Redis     │  │    SQLite    │    │
│  │   (主库)     │  │   (缓存)    │  │  (本地模式)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## 后端分层架构

### 严格分层

```
Controller → Service → Repository → Prisma
```

每一层的职责：

| 层级 | 职责 | 禁止 |
|------|------|------|
| Controller | 请求/响应处理、参数校验、Swagger 文档 | 直接访问数据库、复杂业务逻辑 |
| Service | 业务逻辑、事务管理、跨模块调用 | 直接操作 HTTP 请求/响应 |
| Repository | 数据访问、Prisma 封装、查询优化 | 包含业务逻辑 |
| DTO | 数据类型定义、验证规则 | 包含业务逻辑 |
| Entity | 数据库表映射 | 包含业务逻辑 |

### 正确示例

```typescript
// Controller - 只处理 HTTP
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }
}

// Service - 业务逻辑
@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly billingService: BillingService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }
    const user = await this.userRepo.create(dto);
    await this.billingService.createBalance(user.id);
    return user;
  }
}

// Repository - 数据访问
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
```

### 禁止示例

```typescript
// ❌ Controller 直接访问数据库
@Controller('users')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto }); // 禁止
  }
}

// ❌ Repository 包含业务逻辑
@Injectable()
export class UserRepository {
  async createUserWithBonus(dto: CreateUserDto) {
    const user = await this.prisma.user.create({ data: dto });
    await this.prisma.balance.create({ // 业务逻辑不应在 Repository
      data: { userId: user.id, amount: 100 },
    });
    return user;
  }
}
```

## 模块划分

### 核心模块

| 模块 | 职责 | 依赖 |
|------|------|------|
| Auth | 认证、授权、JWT、OAuth | User |
| User | 用户注册、信息管理 | - |
| ApiKey | API Key 创建、管理、校验 | User |
| Billing | Token 计费、余额管理 | User, Model |
| Payment | 充值、支付回调、退款 | Billing, User |
| Channel | 渠道管理、负载均衡、故障转移 | Model |
| Model | 模型配置、定价管理 | - |
| Gateway | API 转发、协议兼容 | Auth, ApiKey, Billing, Channel |
| Admin | 管理后台、数据统计 | 所有模块 |
| Organization | 企业管理、团队管理 | User |
| ContentSafety | 内容安全、审核 | - |
| Verification | 实名认证 | User |

### 模块间调用规则

```
✅ 允许：通过 Service 层调用
UserService → BillingService.createBalance()

❌ 禁止：直接访问其他模块的数据库表
UserService → prisma.balance.create()  // 禁止

❌ 禁止：循环依赖
AuthService → UserService → AuthService  // 禁止
```

## API 设计规范

### RESTful 风格

```
GET    /api/v1/users          # 列表
POST   /api/v1/users          # 创建
GET    /api/v1/users/:id      # 详情
PATCH  /api/v1/users/:id      # 更新
DELETE /api/v1/users/:id      # 删除
```

### 响应格式

```typescript
// 成功响应
interface ApiResponse<T> {
  code: 0;
  message: 'success';
  data: T;
}

// 错误响应
interface ApiResponse {
  code: number;
  message: string;
  details?: Record<string, any>;
}

// 分页响应
interface PaginatedResponse<T> {
  code: 0;
  message: 'success';
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}
```

### 版本控制

```
/api/v1/...
/api/v2/...
```

所有 API 必须带版本号。

### Swagger 文档

所有接口必须生成 OpenAPI 文档：

```typescript
@Post()
@ApiOperation({ summary: '创建用户', description: '创建新用户账号' })
@ApiBody({ type: CreateUserDto })
@ApiCreatedResponse({ type: UserResponseDto })
@ApiConflictResponse({ description: '邮箱已注册' })
async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
  // ...
}
```

## 前端架构

### 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 认证相关页面
│   ├── (dashboard)/        # 仪表盘页面
│   ├── (admin)/            # 管理后台
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # 基础 UI 组件 (Shadcn)
│   ├── forms/              # 表单组件
│   └── layouts/            # 布局组件
├── hooks/                  # 自定义 Hooks
├── lib/                    # 工具函数
├── services/               # API 调用封装
├── stores/                 # Zustand 状态管理
├── types/                  # TypeScript 类型定义
└── styles/                 # 全局样式
```

### 状态管理

```typescript
// Zustand Store
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// TanStack Query
const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
  });
};
```

## Monorepo 结构

```
toaiapi/
├── apps/
│   ├── frontend/           # Next.js 前端
│   ├── admin/              # 管理后台
│   └── backend/            # NestJS 后端
├── packages/
│   ├── sdk/                # 客户端 SDK
│   ├── billing/            # 计费核心逻辑
│   ├── gateway/            # 网关核心逻辑
│   ├── auth/               # 认证授权
│   └── common/             # 公共工具
├── docs/                   # 项目文档
├── .ai/                    # AI 开发规则
└── .claude/                # Claude Code 配置
```

### 包间依赖规则

```
✅ apps → packages          # 应用可以依赖包
✅ packages → packages      # 包可以依赖其他包
❌ packages → apps          # 包不能依赖应用
❌ 循环依赖                  # 禁止循环依赖
```
