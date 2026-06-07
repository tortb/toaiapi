# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/auth.spec.ts >> 登录态保持 >> 未登录用户访问 dashboard 被重定向到登录页
- Location: tests/auth.spec.ts:197:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/overview
Call log:
  - navigating to "http://localhost:3000/dashboard/overview", waiting until "load"

```

# Test source

```ts
  99  |     await page.goto("/login");
  100 |     await page.waitForLoadState("domcontentloaded");
  101 | 
  102 |     await page.getByPlaceholder("you@example.com").fill(data.user.email);
  103 |     await page.getByPlaceholder("••••••••").fill("WrongPassword123!");
  104 |     await page.getByRole("button", { name: "登录", exact: true }).click();
  105 | 
  106 |     // 等待错误提示出现
  107 |     await expect(page.locator(".bg-red-50").first()).toBeVisible({
  108 |       timeout: 10_000,
  109 |     });
  110 |   });
  111 | 
  112 |   test("错误邮箱格式时按钮禁用", async ({ page }) => {
  113 |     await page.goto("/login");
  114 |     await page.waitForLoadState("domcontentloaded");
  115 | 
  116 |     // 空表单时按钮应禁用
  117 |     await expect(
  118 |       page.getByRole("button", { name: "登录", exact: true }),
  119 |     ).toBeDisabled();
  120 |   });
  121 | 
  122 |   test("成功登录后跳转到 dashboard 并存储 token", async ({ page }) => {
  123 |     const data = loadSetupData();
  124 | 
  125 |     await page.goto("/login");
  126 |     await page.waitForLoadState("domcontentloaded");
  127 | 
  128 |     await page.getByPlaceholder("you@example.com").fill(data.user.email);
  129 |     await page.getByPlaceholder("••••••••").fill(data.user.password);
  130 |     await page.getByRole("button", { name: "登录", exact: true }).click();
  131 | 
  132 |     // 等待跳转
  133 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  134 | 
  135 |     // 验证 token
  136 |     const token = await page.evaluate(() =>
  137 |       localStorage.getItem("toaiapi_access_token"),
  138 |     );
  139 |     expect(token).toBeTruthy();
  140 |     expect(token!.length).toBeGreaterThan(10);
  141 | 
  142 |     // 验证用户信息
  143 |     const userStr = await page.evaluate(() =>
  144 |       localStorage.getItem("toaiapi_user"),
  145 |     );
  146 |     expect(userStr).toBeTruthy();
  147 |     const user = JSON.parse(userStr!);
  148 |     expect(user.email).toBe(data.user.email);
  149 |   });
  150 | 
  151 |   test("登录页和注册页可以互相跳转", async ({ page }) => {
  152 |     await page.goto("/login");
  153 |     await page.waitForLoadState("domcontentloaded");
  154 | 
  155 |     // 登录页 → 注册页
  156 |     await page.getByRole("link", { name: "注册" }).click();
  157 |     await expect(page).toHaveURL(/\/register/);
  158 |     await expect(page.getByText("创建账号")).toBeVisible();
  159 | 
  160 |     // 注册页 → 登录页
  161 |     await page.getByRole("link", { name: "登录" }).click();
  162 |     await expect(page).toHaveURL(/\/login/);
  163 |   });
  164 | });
  165 | 
  166 | // ─── 登录态保持 ───
  167 | 
  168 | test.describe("登录态保持", () => {
  169 |   test("已登录用户访问 dashboard 不被重定向", async ({ authenticatedPage }) => {
  170 |     await authenticatedPage.goto("/dashboard/overview");
  171 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  172 | 
  173 |     // 应该停留在 dashboard，不跳转到 login
  174 |     await expect(authenticatedPage).toHaveURL(/\/dashboard/);
  175 |     await expect(authenticatedPage).not.toHaveURL(/\/login/);
  176 |   });
  177 | 
  178 |   test("已登录用户刷新页面后仍然保持登录", async ({ authenticatedPage }) => {
  179 |     await authenticatedPage.goto("/dashboard/overview");
  180 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  181 | 
  182 |     // 刷新页面
  183 |     await authenticatedPage.reload();
  184 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  185 | 
  186 |     // 仍然在 dashboard
  187 |     await expect(authenticatedPage).toHaveURL(/\/dashboard/);
  188 |     await expect(authenticatedPage).not.toHaveURL(/\/login/);
  189 | 
  190 |     // token 仍然存在
  191 |     const token = await authenticatedPage.evaluate(() =>
  192 |       localStorage.getItem("toaiapi_access_token"),
  193 |     );
  194 |     expect(token).toBeTruthy();
  195 |   });
  196 | 
  197 |   test("未登录用户访问 dashboard 被重定向到登录页", async ({ page }) => {
  198 |     // page 没有注入 token，模拟未登录状态
> 199 |     await page.goto("/dashboard/overview");
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/overview
  200 |     await page.waitForLoadState("domcontentloaded");
  201 | 
  202 |     // 应该被重定向到 login
  203 |     await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  204 |   });
  205 | });
  206 | 
  207 | // ─── 登出 ───
  208 | 
  209 | test.describe("用户登出", () => {
  210 |   test("从 dashboard 顶栏退出后跳转到登录页", async ({ authenticatedPage }) => {
  211 |     await authenticatedPage.goto("/dashboard/overview");
  212 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  213 | 
  214 |     // 点击用户头像区域打开菜单
  215 |     const header = authenticatedPage.locator("header");
  216 |     await header.locator(".rounded-full.bg-primary").locator("..").click();
  217 | 
  218 |     // 等待菜单出现并点击退出
  219 |     await expect(authenticatedPage.getByText("退出登录")).toBeVisible();
  220 |     await authenticatedPage.getByText("退出登录").click();
  221 | 
  222 |     // 应该跳转到登录页
  223 |     await expect(authenticatedPage).toHaveURL(/\/login/, { timeout: 10_000 });
  224 | 
  225 |     // token 应该被清除
  226 |     const token = await authenticatedPage.evaluate(() =>
  227 |       localStorage.getItem("toaiapi_access_token"),
  228 |     );
  229 |     expect(token).toBeFalsy();
  230 |   });
  231 | });
  232 | 
```