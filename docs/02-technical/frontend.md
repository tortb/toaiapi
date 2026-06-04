# 前端技术规范

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.x | React 框架 |
| React | 19.x | UI 库 |
| TypeScript | 5.x | 类型安全 |
| TailwindCSS | 4.x | 样式 |
| Shadcn/ui | — | 组件库 |
| Zustand | — | 状态管理 |
| React Query | — | 数据获取 |

## 设计原则

**风格定位：60% Linear + 20% Stripe + 20% Vercel**

### 允许

- 深色模式优先
- 中文优先
- 极简设计
- 企业级 SaaS 风格
- 8pt 网格系统
- 高对比度文本

### 禁止

- 大面积渐变
- 炫酷动画
- 玻璃拟态
- 营销风格
- 花哨装饰

## 应用结构

### 用户前端 (apps/frontend)

```
src/app/
├── (root)/               # Landing Page (/)
├── (auth)/               # 认证页面
│   ├── login/            # /login
│   ├── register/         # /register
│   ├── forgot-password/  # /forgot-password
│   └── reset-password/   # /reset-password
├── (dashboard)/          # 用户面板
│   ├── page.tsx          # / (Dashboard)
│   ├── api-keys/         # /api-keys
│   ├── usage/            # /usage
│   └── settings/         # /settings
└── (marketing)/          # 营销页面
    ├── models/           # /models
    └── status/           # /status
```

### 管理后台 (apps/admin)

```
src/app/
├── (auth)/               # 管理员登录
│   └── login/            # /login
└── (admin)/              # 管理面板
    ├── page.tsx          # / (Dashboard)
    ├── providers/        # /providers
    ├── channels/         # /channels
    ├── models/           # /models
    └── users/            # /users
```

## 组件规范

### 统一组件

| 组件 | 说明 |
|------|------|
| Button | 主要/次要/危险/幽灵 |
| Card | 内容卡片 |
| Table | 数据表格（排序/筛选/分页） |
| Modal | 模态对话框 |
| Drawer | 抽屉面板 |
| Form | 表单（校验/错误提示） |
| Badge | 状态标签 |
| Alert | 提示信息 |
| Toast | 轻提示 |
| Skeleton | 加载骨架屏 |

### 命名规范

- 组件文件：`kebab-case.tsx`（如 `data-table.tsx`）
- 组件名：`PascalCase`（如 `DataTable`）
- Hook 文件：`use-xxx.ts`（如 `use-auth.ts`）
- 工具文件：`xxx.utils.ts`

## API 调用

```typescript
// services/api.ts
const api = {
  auth: {
    login: (data: LoginDto) => client.post('/auth/login', data),
    register: (data: RegisterDto) => client.post('/auth/register', data),
    refresh: (token: string) => client.post('/auth/refresh', { refreshToken: token }),
  },
  users: {
    me: () => client.get('/users/me'),
    update: (data: UpdateUserDto) => client.patch('/users/me', data),
  },
  apiKeys: {
    list: () => client.get('/api-keys'),
    create: (data: CreateApiKeyDto) => client.post('/api-keys', data),
    delete: (id: string) => client.delete(`/api-keys/${id}`),
    enable: (id: string) => client.patch(`/api-keys/${id}/enable`),
    disable: (id: string) => client.patch(`/api-keys/${id}/disable`),
  },
  balance: {
    get: () => client.get('/balance'),
    transactions: (page?: number) => client.get('/balance/transactions', { params: { page } }),
    logs: (page?: number) => client.get('/balance/logs', { params: { page } }),
  },
  admin: {
    providers: { /* CRUD */ },
    channels: { /* CRUD */ },
    models: { /* CRUD */ },
    users: { /* list, get, updateRole, updateStatus */ },
  },
};
```

## 状态管理

```typescript
// stores/auth-store.ts (Zustand)
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}
```

## 路由守卫

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // Dashboard 路由需要认证
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin 路由需要管理员权限
  if (request.nextUrl.pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}
```

## 字体

- 主字体：MiSans / HarmonyOS Sans SC
- 等宽字体：JetBrains Mono / Fira Code

## 颜色系统

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-tertiary: #1a1a1a;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --border: #27272a;
  --accent: #3b82f6;
  --danger: #ef4444;
  --success: #22c55e;
}
```
