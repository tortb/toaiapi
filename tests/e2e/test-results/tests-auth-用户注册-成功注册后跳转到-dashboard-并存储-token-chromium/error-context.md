# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/auth.spec.ts >> 用户注册 >> 成功注册后跳转到 dashboard 并存储 token
- Location: tests/auth.spec.ts:55:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/register
Call log:
  - navigating to "http://localhost:3000/register", waiting until "load"

```

# Test source

```ts
  1   | /**
  2   |  * 认证流程 E2E 测试
  3   |  *
  4   |  * 覆盖：注册、登录、登录态保持、错误登录、登出
  5   |  * 使用真实浏览器，禁止 mock 核心逻辑
  6   |  */
  7   | 
  8   | import { test, expect, loadSetupData } from "../fixtures/auth.fixture";
  9   | import { createTestUser, generateEmail } from "../utils/test-data";
  10  | 
  11  | // ─── 注册 ───
  12  | 
  13  | test.describe("用户注册", () => {
  14  |   test("注册页面正常渲染，表单元素完整", async ({ page }) => {
  15  |     await page.goto("/register");
  16  |     await page.waitForLoadState("domcontentloaded");
  17  | 
  18  |     // 标题
  19  |     await expect(page.getByText("创建账号")).toBeVisible();
  20  |     // 表单字段
  21  |     await expect(page.getByLabel("显示名称")).toBeVisible();
  22  |     await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  23  |     await expect(page.getByLabel("密码", { exact: true })).toBeVisible();
  24  |     await expect(page.getByLabel("确认密码")).toBeVisible();
  25  |     // 提交按钮
  26  |     await expect(page.getByRole("button", { name: "注册", exact: true })).toBeVisible();
  27  |     // 登录链接
  28  |     await expect(page.getByRole("link", { name: "登录" })).toBeVisible();
  29  |   });
  30  | 
  31  |   test("密码不一致时显示错误", async ({ page }) => {
  32  |     await page.goto("/register");
  33  |     await page.waitForLoadState("domcontentloaded");
  34  | 
  35  |     await page.getByPlaceholder("you@example.com").fill("test@test.local");
  36  |     await page.getByLabel("密码", { exact: true }).fill("Abcd1234!");
  37  |     await page.getByLabel("确认密码").fill("Different123!");
  38  |     await page.getByRole("button", { name: "注册", exact: true }).click();
  39  | 
  40  |     await expect(page.getByText("两次输入的密码不一致")).toBeVisible();
  41  |   });
  42  | 
  43  |   test("密码过短时显示错误", async ({ page }) => {
  44  |     await page.goto("/register");
  45  |     await page.waitForLoadState("domcontentloaded");
  46  | 
  47  |     await page.getByPlaceholder("you@example.com").fill("test@test.local");
  48  |     await page.getByLabel("密码", { exact: true }).fill("Ab1!");
  49  |     await page.getByLabel("确认密码").fill("Ab1!");
  50  |     await page.getByRole("button", { name: "注册", exact: true }).click();
  51  | 
  52  |     await expect(page.getByText("密码长度至少 8 位")).toBeVisible();
  53  |   });
  54  | 
  55  |   test("成功注册后跳转到 dashboard 并存储 token", async ({ page }) => {
  56  |     const user = createTestUser();
  57  | 
> 58  |     await page.goto("/register");
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/register
  59  |     await page.waitForLoadState("domcontentloaded");
  60  | 
  61  |     await page.getByLabel("显示名称").fill(user.displayName);
  62  |     await page.getByPlaceholder("you@example.com").fill(user.email);
  63  |     await page.getByLabel("密码", { exact: true }).fill(user.password);
  64  |     await page.getByLabel("确认密码").fill(user.password);
  65  |     await page.getByRole("button", { name: "注册", exact: true }).click();
  66  | 
  67  |     // 等待跳转到 dashboard
  68  |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  69  | 
  70  |     // 验证 token 已存储
  71  |     const token = await page.evaluate(() =>
  72  |       localStorage.getItem("toaiapi_access_token"),
  73  |     );
  74  |     expect(token).toBeTruthy();
  75  |     expect(token!.length).toBeGreaterThan(10);
  76  |   });
  77  | });
  78  | 
  79  | // ─── 登录 ───
  80  | 
  81  | test.describe("用户登录", () => {
  82  |   test("登录页面正常渲染，表单元素完整", async ({ page }) => {
  83  |     await page.goto("/login");
  84  |     await page.waitForLoadState("domcontentloaded");
  85  | 
  86  |     await expect(page.getByText("登录").first()).toBeVisible();
  87  |     await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  88  |     await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  89  |     await expect(
  90  |       page.getByRole("button", { name: "登录", exact: true }),
  91  |     ).toBeVisible();
  92  |     await expect(page.getByRole("link", { name: "注册" })).toBeVisible();
  93  |     await expect(page.getByRole("link", { name: "← 返回首页" })).toBeVisible();
  94  |   });
  95  | 
  96  |   test("错误密码时显示错误提示", async ({ page }) => {
  97  |     const data = loadSetupData();
  98  | 
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
```