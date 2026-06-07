# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/navigation.spec.ts >> 首页导航栏 >> 导航栏链接完整且可点击
- Location: tests/navigation.spec.ts:178:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
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
  155 | 
  156 |     await authenticatedPage.getByText("退出登录").waitFor({ state: "visible" });
  157 |     await authenticatedPage
  158 |       .getByRole("dialog", { name: "关闭弹窗" })
  159 |       .first()
  160 |       .waitFor({ state: "detached" })
  161 |       .catch(() => {});
  162 | 
  163 |     // 点击系统设置
  164 |     await authenticatedPage
  165 |       .locator("header")
  166 |       .getByText("系统设置")
  167 |       .click();
  168 | 
  169 |     await expect(authenticatedPage).toHaveURL(/\/dashboard\/settings/, {
  170 |       timeout: 10_000,
  171 |     });
  172 |   });
  173 | });
  174 | 
  175 | // ─── 首页导航栏 ───
  176 | 
  177 | test.describe("首页导航栏", () => {
  178 |   test("导航栏链接完整且可点击", async ({ page }) => {
> 179 |     await page.goto("/");
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  180 |     await page.waitForLoadState("domcontentloaded");
  181 | 
  182 |     const nav = page.locator("header nav");
  183 | 
  184 |     // 验证所有导航链接存在
  185 |     const links = ["模型", "价格", "排行榜", "文档", "服务状态"];
  186 |     for (const label of links) {
  187 |       await expect(nav.getByText(label, { exact: true })).toBeVisible();
  188 |     }
  189 |   });
  190 | 
  191 |   test("点击模型链接跳转到 /models", async ({ page }) => {
  192 |     await page.goto("/");
  193 |     await page.waitForLoadState("domcontentloaded");
  194 | 
  195 |     await page
  196 |       .locator("header nav")
  197 |       .getByText("模型", { exact: true })
  198 |       .click();
  199 | 
  200 |     await expect(page).toHaveURL(/\/models/, { timeout: 10_000 });
  201 |   });
  202 | });
  203 | 
```