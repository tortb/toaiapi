# AI 提示词 — 前端开发

## 通用前端开发提示词

```
你是 ToAIAPI 的前端开发工程师，也是 Linear + Stripe + Vercel 设计团队成员。

技术栈：
- Next.js 15 + React 19
- TypeScript strict
- TailwindCSS 4
- Shadcn/ui
- Zustand (状态管理)

设计风格：
- 60% Linear（极简、深色、专注）
- 20% Stripe（企业级、专业）
- 20% Vercel（现代、清晰）

原则：
- 深色模式优先
- 中文优先
- 8pt 网格系统
- 高对比度文本

禁止：
- 大面积渐变
- 炫酷动画
- 玻璃拟态
- 营销风格

组件命名：
- 文件名：kebab-case.tsx
- 组件名：PascalCase

请实现：
{页面/组件描述}

输出：
1. 组件结构
2. TailwindCSS 样式
3. TypeScript 类型
4. 响应式适配
```

## 新页面提示词

```
为 ToAIAPI 创建 {页面名} 页面。

路径：{路由路径}
所属应用：frontend / admin

页面功能：
{功能描述}

要求：
1. 使用 Server Component 或 Client Component（根据需要）
2. 数据获取使用 fetch / React Query
3. 表单使用 react-hook-form + zod 校验
4. 错误处理使用 ErrorBoundary
5. 加载状态使用 Skeleton
6. 移动端响应式

参考页面：
- apps/frontend/src/app/(dashboard)/api-keys/page.tsx
- apps/admin/src/app/(admin)/users/page.tsx

输出完整代码。
```

## 数据表格提示词

```
为 ToAIAPI 创建数据表格组件。

数据：{数据类型}
功能：
- 列展示：{列名列表}
- 排序：支持
- 筛选：{筛选条件}
- 分页：支持
- 操作：{操作列表}

要求：
1. 使用 Shadcn/ui Table 组件
2. URL 同步筛选参数
3. 加载状态
4. 空状态提示
5. 移动端卡片视图

参考组件：
- apps/admin/src/components/data-table.tsx
```

## 表单提示词

```
为 ToAIAPI 创建 {表单名} 表单。

字段：
{字段列表及校验规则}

要求：
1. 使用 react-hook-form
2. zod schema 校验
3. 实时校验反馈
4. 提交状态处理
5. 错误提示
6. 移动端适配

API 调用：
{API 端点和请求格式}
```

## Admin 后台提示词

```
为 ToAIAPI Admin 后台创建 {页面名} 页面。

路径：/admin/{路径}
权限：ADMIN / SUPER_ADMIN

页面功能：
{功能描述}

要求：
1. 使用 Admin 布局：apps/admin/src/app/(admin)/layout.tsx
2. API 调用使用 services/api.ts
3. 认证使用 stores/auth-store.ts
4. 组件复用 apps/admin/src/components/ 下的组件
5. 深色主题
6. 表格 + 表单 + 确认弹窗

参考页面：
- apps/admin/src/app/(admin)/users/page.tsx
- apps/admin/src/app/(admin)/providers/page.tsx
```
