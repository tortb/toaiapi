# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/navigation.spec.ts >> Dashboard 页面登录保护 >> 未登录访问 /dashboard/usage 被重定向到登录页
- Location: tests/navigation.spec.ts:53:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/usage
Call log:
  - navigating to "http://localhost:3000/dashboard/usage", waiting until "load"

```

# Test source

```ts
  1   | /**
  2   |  * UI 导航稳定性 E2E 测试
  3   |  *
  4   |  * 覆盖：关键页面可访问性、路由跳转、侧边栏导航、未登录保护
  5   |  * 不依赖特定业务数据，只验证页面渲染和路由行为
  6   |  */
  7   | 
  8   | import { test, expect } from "../fixtures/auth.fixture";
  9   | 
  10  | // ─── 公开页面可访问性 ───
  11  | 
  12  | test.describe("公开页面可访问", () => {
  13  |   const publicPages = [
  14  |     { path: "/", expectText: null }, // 首页内容动态，只检查 200
  15  |     { path: "/login", expectText: "登录" },
  16  |     { path: "/register", expectText: "创建账号" },
  17  |     { path: "/models", expectText: null },
  18  |     { path: "/pricing", expectText: null },
  19  |     { path: "/status", expectText: null },
  20  |     { path: "/docs", expectText: null },
  21  |     { path: "/leaderboard", expectText: null },
  22  |   ];
  23  | 
  24  |   for (const { path, expectText } of publicPages) {
  25  |     test(`${path} 页面可正常访问`, async ({ page }) => {
  26  |       const response = await page.goto(path);
  27  |       await page.waitForLoadState("domcontentloaded");
  28  | 
  29  |       // HTTP 状态码正确
  30  |       expect(response?.status()).toBeLessThan(400);
  31  | 
  32  |       // 如果指定了期望文本，验证渲染
  33  |       if (expectText) {
  34  |         await expect(page.getByText(expectText).first()).toBeVisible();
  35  |       }
  36  |     });
  37  |   }
  38  | });
  39  | 
  40  | // ─── Dashboard 页面需要登录 ───
  41  | 
  42  | test.describe("Dashboard 页面登录保护", () => {
  43  |   const protectedPages = [
  44  |     "/dashboard/overview",
  45  |     "/dashboard/apikeys",
  46  |     "/dashboard/usage",
  47  |     "/dashboard/billing",
  48  |     "/dashboard/logs",
  49  |     "/dashboard/settings",
  50  |   ];
  51  | 
  52  |   for (const path of protectedPages) {
  53  |     test(`未登录访问 ${path} 被重定向到登录页`, async ({ page }) => {
> 54  |       await page.goto(path);
      |                  ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/usage
  55  |       await page.waitForLoadState("domcontentloaded");
  56  | 
  57  |       await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  58  |     });
  59  |   }
  60  | });
  61  | 
  62  | // ─── Dashboard 侧边栏导航 ───
  63  | 
  64  | test.describe("Dashboard 侧边栏导航", () => {
  65  |   test("侧边栏所有导航项可点击且路由正确", async ({ authenticatedPage }) => {
  66  |     await authenticatedPage.goto("/dashboard/overview");
  67  |     await authenticatedPage.waitForLoadState("domcontentloaded");
  68  | 
  69  |     const sidebar = authenticatedPage.locator("aside");
  70  |     const navItems = [
  71  |       { label: "概览", path: "/dashboard/overview" },
  72  |       { label: "API 密钥", path: "/dashboard/apikeys" },
  73  |       { label: "使用统计", path: "/dashboard/usage" },
  74  |       { label: "账单中心", path: "/dashboard/billing" },
  75  |       { label: "请求日志", path: "/dashboard/logs" },
  76  |       { label: "系统设置", path: "/dashboard/settings" },
  77  |     ];
  78  | 
  79  |     for (const { label, path } of navItems) {
  80  |       await sidebar.getByText(label, { exact: true }).click();
  81  |       await authenticatedPage.waitForLoadState("domcontentloaded");
  82  | 
  83  |       // 验证 URL 包含目标路径
  84  |       await expect(authenticatedPage).toHaveURL(new RegExp(path), {
  85  |         timeout: 10_000,
  86  |       });
  87  |     }
  88  |   });
  89  | 
  90  |   test("返回前台链接跳转到首页", async ({ authenticatedPage }) => {
  91  |     await authenticatedPage.goto("/dashboard/overview");
  92  |     await authenticatedPage.waitForLoadState("domcontentloaded");
  93  | 
  94  |     await authenticatedPage
  95  |       .locator("aside")
  96  |       .getByText("返回前台")
  97  |       .click();
  98  | 
  99  |     await expect(authenticatedPage).toHaveURL(/\/$/, { timeout: 10_000 });
  100 |   });
  101 | });
  102 | 
  103 | // ─── Dashboard ↔ 首页跳转 ───
  104 | 
  105 | test.describe("跨区域路由跳转", () => {
  106 |   test("首页点击控制台跳转到 dashboard", async ({ authenticatedPage }) => {
  107 |     await authenticatedPage.goto("/");
  108 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  109 | 
  110 |     // 已登录状态应该显示"控制台"按钮
  111 |     await authenticatedPage
  112 |       .locator("header")
  113 |       .getByRole("link", { name: "控制台" })
  114 |       .click();
  115 | 
  116 |     await expect(authenticatedPage).toHaveURL(/\/dashboard/, {
  117 |       timeout: 10_000,
  118 |     });
  119 |   });
  120 | 
  121 |   test("/dashboard 自动重定向到 /dashboard/overview", async ({
  122 |     authenticatedPage,
  123 |   }) => {
  124 |     await authenticatedPage.goto("/dashboard");
  125 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  126 | 
  127 |     await expect(authenticatedPage).toHaveURL(/\/dashboard\/overview/, {
  128 |       timeout: 10_000,
  129 |     });
  130 |   });
  131 | });
  132 | 
  133 | // ─── 顶栏用户菜单 ───
  134 | 
  135 | test.describe("顶栏用户菜单", () => {
  136 |   test("用户菜单包含系统设置和退出登录", async ({ authenticatedPage }) => {
  137 |     await authenticatedPage.goto("/dashboard/overview");
  138 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  139 | 
  140 |     // 点击用户头像
  141 |     const header = authenticatedPage.locator("header");
  142 |     await header.locator(".rounded-full.bg-primary").locator("..").click();
  143 | 
  144 |     // 菜单项
  145 |     await expect(authenticatedPage.getByText("系统设置").last()).toBeVisible();
  146 |     await expect(authenticatedPage.getByText("退出登录")).toBeVisible();
  147 |   });
  148 | 
  149 |   test("从用户菜单跳转到系统设置", async ({ authenticatedPage }) => {
  150 |     await authenticatedPage.goto("/dashboard/overview");
  151 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  152 | 
  153 |     const header = authenticatedPage.locator("header");
  154 |     await header.locator(".rounded-full.bg-primary").locator("..").click();
```