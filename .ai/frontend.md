# ToAIAPI Frontend Design System

> 本文件是前端开发的权威规范。所有 AI 生成的前端代码必须遵守。
> 适用于：Claude Code、Cursor、Mimo、Trae、Copilot Agent 等 AI 工具。

---

## 1. 项目定位

**ToAIAPI** 是企业级 AI API 聚合平台。

**目标用户**：开发者、企业客户、AI 创业团队、SaaS 公司

**产品关键词**：企业级 · 稳定 · 专业 · 可信 · 高级感 · 中文优先

**禁止风格**：花哨动画 · 炫酷渐变 · 网红风 · 游戏风 · 卡通风 · 二次元风

**风格参考**：60% Linear · 20% Stripe · 20% Vercel

---

## 2. 设计哲学

ToAIAPI 不是营销网站，是**开发者生产力工具**。

| 优先级 | 目标 | 说明 |
|--------|------|------|
| P0 | 可读性 | 信息清晰、层级分明 |
| P1 | 操作效率 | 减少点击、快速定位 |
| P2 | 视觉高级感 | 简洁、克制、专业 |

**不要为了美观牺牲信息密度。**

---

## 3. 技术栈（强制）

| 类别 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js App Router | `/src/app/` 目录结构 |
| 语言 | TypeScript strict | 禁止 `any`，所有 Props 必须定义 interface |
| 样式 | TailwindCSS v4 | 使用 CSS 变量语义化 token |
| 组件库 | shadcn/ui 模式 | `components/ui/` 下的 primitive 组件 |
| 图标 | Lucide React | 禁止 emoji、彩色图标、混合图标库 |
| 状态 | Zustand | 全局状态（auth 等） |
| 数据获取 | React Query | 服务端数据获取与缓存（待引入） |
| 表单 | React Hook Form + Zod | 表单验证（待引入） |
| 类名 | `cn()` from `@/lib/utils` | clsx + tailwind-merge |

**禁止**：
- CSS Modules（统一用 Tailwind）
- 内联 style 属性（除非计算值）
- 第三方 UI 库（Ant Design、MUI 等）
- jQuery 或任何非 React 方案

---

## 4. 色彩系统

### 4.1 设计 Token（CSS 变量）

所有颜色通过 `globals.css` 中的 HSL 变量定义，Tailwind 通过 `hsl(var(--name))` 引用。

```css
:root {
  --background: 220 50% 4%;        /* #09090B 近黑 */
  --foreground: 210 40% 98%;       /* #FAFAFA 近白 */

  --card: 220 50% 7%;              /* #111113 卡片 */
  --card-foreground: 210 40% 98%;

  --primary: 217 91% 60%;          /* #3B82F6 蓝色主色 */
  --primary-foreground: 0 0% 100%;

  --secondary: 215 28% 17%;        /* #27272A 次要 */
  --secondary-foreground: 215 20% 80%;

  --muted: 215 28% 17%;            /* 静音色 */
  --muted-foreground: 215 20% 65%; /* #A1A1AA 次文字 */

  --accent: 239 84% 67%;           /* 强调色 */
  --accent-foreground: 234 100% 93%;

  --destructive: 0 84% 60%;        /* #EF4444 错误 */
  --success: 142 71% 45%;          /* #22C55E 成功 */
  --warning: 38 92% 50%;           /* #F59E0B 警告 */

  --border: 215 28% 17%;           /* #27272A 边框 */
  --input: 215 28% 17%;
  --ring: 217 91% 60%;
  --radius: 0.75rem;               /* 12px */
}
```

### 4.2 Tailwind 使用规则

```tsx
// ✅ 正确 — 使用语义化 token
<div className="bg-card text-foreground border border-border">
<span className="text-muted-foreground">次要文字</span>
<Button className="bg-primary text-primary-foreground">

// ❌ 错误 — 硬编码颜色值
<div className="bg-[#111113] text-white">
<span className="text-[#A1A1AA]">次要文字</span>
```

### 4.3 禁止的色彩用法

- ❌ 紫色渐变、彩虹色
- ❌ 发光效果（glow）
- ❌ 毛玻璃泛滥（仅 Landing 页面 header 允许 `.glass`）
- ❌ 霓虹色、荧光色
- ❌ 多彩背景

---

## 5. 布局系统

### 5.1 Dashboard 布局

```
┌─────────────────────────────────────────────┐
│ Sidebar (w-60)  │  Main Content             │
│                 │  ┌──────────────────────┐  │
│ ┌─────────────┐ │  │ Page Header          │  │
│ │ Logo        │ │  │                      │  │
│ ├─────────────┤ │  ├──────────────────────┤  │
│ │ Nav Items   │ │  │ Stats Cards (grid)   │  │
│ │             │ │  ├──────────────────────┤  │
│ │             │ │  │ Content Area         │  │
│ ├─────────────┤ │  │                      │  │
│ │ User Info   │ │  │                      │  │
│ │ Logout      │ │  └──────────────────────┘  │
│ └─────────────┘ │                             │
└─────────────────────────────────────────────┘
```

### 5.2 尺寸规范

| 元素 | 值 | Tailwind |
|------|-----|----------|
| 页面最大宽度 | 1440px | `max-w-screen-2xl` |
| 内容区域内边距 | 24px | `p-6` |
| 卡片间距 | 16px | `gap-4` |
| 模块间距 | 24px | `gap-6` |
| 侧边栏宽度 | 240px | `w-60` |
| 顶栏高度 | 56px | `h-14` |

### 5.3 页面结构模板

每个 Dashboard 页面必须遵循：

```tsx
export default function XxxPage() {
  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">页面标题</h1>
        <p className="text-muted-foreground">页面描述</p>
      </div>

      {/* 2. Stats Cards（如有） */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard ... />
      </div>

      {/* 3. Content Area */}
      <div>
        {/* 表格、表单、列表等 */}
      </div>
    </div>
  );
}
```

---

## 6. 组件规范

### 6.1 通用尺寸

| 组件 | 高度 | 圆角 | 字号 | 字重 |
|------|------|------|------|------|
| Button | 40px (`h-10`) | 8px (`rounded-lg`) | 14px (`text-sm`) | 500 (`font-medium`) |
| Input | 40px (`h-10`) | 8px (`rounded-lg`) | 14px (`text-sm`) | 400 |
| Badge | auto | 9999px (`rounded-full`) | 12px (`text-xs`) | 500 |
| Card | auto | 12px (`rounded-xl`) | — | — |
| Table Row | 52px | — | 14px (`text-sm`) | — |

### 6.2 Card 组件

```tsx
// 标准卡片
<div className="rounded-xl border border-border bg-card p-6">
  <h3 className="text-sm font-medium text-muted-foreground">标题</h3>
  <p className="mt-1 text-2xl font-bold tracking-tight">¥125.52</p>
</div>
```

### 6.3 Button 规范

现有 5 个 variant：`default` / `secondary` / `outline` / `ghost` / `destructive`

- 主操作用 `default`（蓝色渐变）
- 次要操作用 `secondary` 或 `outline`
- 文字链接用 `ghost`
- 危险操作用 `destructive`

```tsx
<Button>主要操作</Button>
<Button variant="secondary">次要操作</Button>
<Button variant="destructive">删除</Button>
```

### 6.4 Badge 规范

用于状态标识：

```tsx
<Badge variant="success">成功</Badge>
<Badge variant="warning">处理中</Badge>
<Badge variant="destructive">失败</Badge>
<Badge variant="secondary">已关闭</Badge>
```

### 6.5 数据展示规范

**数字必须突出**，与说明文字形成视觉层级：

```tsx
// ✅ 正确
<div>
  <p className="text-sm text-muted-foreground">API 余额</p>
  <p className="mt-1 text-2xl font-bold tracking-tight">¥125.52</p>
</div>

// ❌ 错误 — 数字和说明一样大
<div>
  <p>API 余额</p>
  <p>¥125.52</p>
</div>
```

数字格式化：
- 金额：`formatAmount(cents)` — 输入分，显示 `¥xx.xx`
- Token：`formatTokens(tokens)` — 显示 `12.5M`、`1.2K`
- 日期：`formatDate(dateStr)` — 显示 `2026/06/05 14:30`

---

## 7. 图标规范

统一使用 **Lucide React**：

```tsx
import { LayoutDashboard, KeyRound, Settings } from 'lucide-react';

<LayoutDashboard className="h-4 w-4" />
```

| 场景 | 尺寸 | 颜色 |
|------|------|------|
| 导航图标 | `h-4 w-4` | 跟随文字色 |
| 卡片图标 | `h-5 w-5` | `text-muted-foreground` |
| 按钮图标 | `h-4 w-4` | 跟随按钮文字色 |

**禁止**：
- ❌ Emoji 作为图标
- ❌ 彩色图标
- ❌ 混合使用不同图标库
- ❌ SVG 内联（用 Lucide 组件）

---

## 8. 动效规范

### 8.1 允许的动效

| 类型 | 时长 | 用途 |
|------|------|------|
| hover opacity | 150ms | 按钮、链接 |
| hover background | 150ms | 列表项、卡片 |
| hover border | 150ms | 输入框、卡片 |
| 页面入场 | `animate-fade-in` | 内容区 |
| 列表入场 | `animate-fade-in-up` | 卡片列表 |
| 加载骨架 | `animate-pulse` | Skeleton |

### 8.2 禁止的动效

- ❌ bounce（弹跳）
- ❌ zoom（缩放入场）
- ❌ shake（抖动）
- ❌ flip（翻转）
- ❌ 无限旋转（除 loading spinner）
- ❌ 粒子效果
- ❌ 打字机效果

---

## 9. 页面路由规划

### 9.1 用户端（Dashboard）

| 路由 | 页面 | 状态 |
|------|------|------|
| `/` | 仪表盘概览 | ✅ 已有（需重构） |
| `/api-keys` | API Key 管理 | ✅ 已有 |
| `/usage` | 使用记录 | ✅ 已有 |
| `/settings` | 账户设置 | ✅ 已有 |
| `/recharge` | 充值中心 | 🔴 待开发 |
| `/orders` | 订单中心 | 🔴 待开发 |
| `/billing` | 财务中心 | 🔴 待开发 |
| `/models` | 模型列表 | ✅ 已有（marketing） |

### 9.2 管理端（Admin）

| 路由 | 页面 | 状态 |
|------|------|------|
| `/admin` | 管理仪表盘 | 🔴 待开发 |
| `/admin/orders` | 订单管理 | 🔴 待开发 |
| `/admin/payments` | 支付管理 | 🔴 待开发 |
| `/admin/finance` | 财务报表 | 🔴 待开发 |
| `/admin/users` | 用户管理 | 🔴 待开发 |
| `/admin/channels` | 渠道管理 | 🔴 待开发 |
| `/admin/models` | 模型管理 | 🔴 待开发 |

### 9.3 页面规范 — 充值中心 `/recharge`

```
┌─────────────────────────────────────┐
│ 余额卡片                            │
│ 当前余额: ¥125.52                   │
├─────────────────────────────────────┤
│ 充值金额选择（卡片选择器，非下拉框） │
│ [¥10] [¥20] [¥50] [¥100]           │
│ [¥200] [¥500] [¥1000] [自定义]     │
├─────────────────────────────────────┤
│ 支付方式（卡片选择器）              │
│ [支付宝] [微信支付] [易支付]        │
├─────────────────────────────────────┤
│ 订单确认                            │
│ 充值金额: ¥100                      │
│ 支付方式: 支付宝                    │
│ [确认支付]                          │
├─────────────────────────────────────┤
│ 充值记录（表格）                    │
│ 订单号 | 金额 | 方式 | 状态 | 时间  │
└─────────────────────────────────────┘
```

### 9.4 页面规范 — 订单中心 `/orders`

```
┌─────────────────────────────────────┐
│ 订单统计卡片                        │
│ 总订单 | 成功率 | 总金额 | 本月     │
├─────────────────────────────────────┤
│ 筛选栏                              │
│ [状态▼] [支付方式▼] [日期范围] [搜索]│
├─────────────────────────────────────┤
│ 订单表格                            │
│ 订单号 | 金额 | 方式 | 状态 | 时间  │
│ 分页                               │
└─────────────────────────────────────┘
```

状态用 Badge：`success`=成功 · `warning`=处理中 · `destructive`=失败 · `secondary`=已关闭

### 9.5 页面规范 — 财务中心 `/billing`

```
┌─────────────────────────────────────┐
│ 消费统计卡片                        │
│ 总消费 | 本月消费 | 余额 | 日均     │
├─────────────────────────────────────┤
│ 最近30天趋势图（柱状图/折线图）     │
├─────────────────────────────────────┤
│ 余额变化记录（表格）                │
├─────────────────────────────────────┤
│ 消费明细记录（表格）                │
└─────────────────────────────────────┘
```

风格参考：Stripe Billing

---

## 10. 响应式规范

| 断点 | 范围 | Tailwind |
|------|------|----------|
| Desktop | ≥1280px | `xl:` |
| Tablet | 768px–1279px | `md:` |
| Mobile | ≤767px | 默认 |

**移动端规则**：
- Sidebar 自动收起，汉堡菜单触发 overlay
- 表格切换为 Card List（竖排卡片）
- 统计卡片单列排列
- 充值金额选择器 2 列网格

```tsx
// 响应式网格示例
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
```

---

## 11. 文件组织

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证页面组
│   ├── (dashboard)/       # 用户端页面组
│   ├── (admin)/           # 管理端页面组（待建）
│   ├── (marketing)/       # 公开页面组
│   └── globals.css        # 全局样式 + 设计 token
├── components/
│   ├── ui/                # 基础组件（button, badge, ...）
│   ├── layouts/           # 布局组件（待建）
│   ├── forms/             # 表单组件（待建）
│   ├── landing/           # Landing 页面组件
│   └── shared/            # 业务共享组件（待建）
├── features/              # 功能模块（按领域组织，待建）
│   ├── recharge/          # 充值模块
│   ├── orders/            # 订单模块
│   └── billing/           # 财务模块
├── hooks/                 # 自定义 hooks（待建）
├── lib/
│   └── utils.ts           # cn(), formatAmount(), etc.
├── services/
│   └── api.ts             # API 调用层
├── stores/
│   └── auth-store.ts      # Zustand stores
└── types/
    └── index.ts           # 共享类型定义
```

### 组件文件规则

- 文件名：`kebab-case.tsx`
- 组件名：`PascalCase`
- 每个文件一个主要组件（default export）
- 子组件可同文件命名导出
- `'use client'` 仅在需要时添加（交互组件）
- Props 必须定义 `interface`，不用 `type`

```tsx
// ✅ 正确
interface StatCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down';
}

export function StatCard({ title, value, trend }: StatCardProps) {
  // ...
}
```

---

## 12. AI 开发检查清单

每次生成前端代码前，必须确认：

- [ ] 使用语义化 Tailwind token（`bg-card` 而非 `bg-[#111113]`）
- [ ] TypeScript 严格类型，无 `any`
- [ ] 响应式支持（至少 `md:` 和默认）
- [ ] 深色主题一致
- [ ] Lucide 图标，无 emoji
- [ ] 数字突出显示（大字号 + 粗体）
- [ ] 中文文案优先
- [ ] 复用现有组件（`components/ui/`）
- [ ] 不创建重复组件
- [ ] 无 ESLint 错误
- [ ] 无障碍（`aria-label`、键盘可达）
- [ ] 禁止花哨动效

---

## 13. 禁止清单

| 类别 | 禁止内容 |
|------|----------|
| 样式 | CSS Modules、内联 style、硬编码颜色 |
| 组件 | Ant Design、MUI、Emoji 图标 |
| 动效 | bounce、zoom、shake、flip、粒子 |
| 代码 | `any` 类型、`console.log`（生产）、魔法数字 |
| 布局 | 弹出一堆 Modal（优先用 Drawer） |
| 数据 | 裸 `useState` + `useEffect` 获取数据（应使用 React Query） |
| 命名 | 中文文件名、驼峰文件名 |
