# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/apikeys.spec.ts >> API Key 页面结构 >> 页面正常渲染，标题和操作按钮完整
- Location: tests/apikeys.spec.ts:21:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/apikeys
Call log:
  - navigating to "http://localhost:3000/dashboard/apikeys", waiting until "load"

```

# Test source

```ts
  1   | /**
  2   |  * API Key 管理 E2E 测试
  3   |  *
  4   |  * 覆盖：创建、列表展示、启用/禁用、删除
  5   |  * 使用已登录的浏览器上下文，通过 API 辅助清理数据保证幂等
  6   |  */
  7   | 
  8   | import { test, expect } from "../fixtures/auth.fixture";
  9   | import { generateApiKeyName } from "../utils/test-data";
  10  | import {
  11  |   createApiKey,
  12  |   deleteApiKey,
  13  |   disableApiKey,
  14  |   enableApiKey,
  15  |   getApiKeys,
  16  | } from "../utils/api-helper";
  17  | 
  18  | // ─── 页面结构 ───
  19  | 
  20  | test.describe("API Key 页面结构", () => {
  21  |   test("页面正常渲染，标题和操作按钮完整", async ({ authenticatedPage }) => {
> 22  |     await authenticatedPage.goto("/dashboard/apikeys");
      |                             ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/apikeys
  23  |     await authenticatedPage.waitForLoadState("domcontentloaded");
  24  | 
  25  |     // 页面标题
  26  |     await expect(
  27  |       authenticatedPage.getByRole("heading", { name: "API 密钥" }),
  28  |     ).toBeVisible();
  29  | 
  30  |     // 创建按钮
  31  |     await expect(
  32  |       authenticatedPage.getByRole("button", { name: "创建密钥" }),
  33  |     ).toBeVisible();
  34  | 
  35  |     // 侧边栏卡片
  36  |     await expect(authenticatedPage.getByText("安全建议")).toBeVisible();
  37  |     await expect(authenticatedPage.getByText("快速集成")).toBeVisible();
  38  |   });
  39  | 
  40  |   test("无密钥时显示空状态", async ({ authenticatedPage, userToken }) => {
  41  |     // 先清理该用户所有密钥
  42  |     const keys = await getApiKeys(
  43  |       authenticatedPage.context().request,
  44  |       userToken,
  45  |     );
  46  |     for (const key of keys) {
  47  |       await deleteApiKey(authenticatedPage.context().request, userToken, key.id);
  48  |     }
  49  | 
  50  |     await authenticatedPage.goto("/dashboard/apikeys");
  51  |     await authenticatedPage.waitForLoadState("networkidle");
  52  |     await authenticatedPage.waitForTimeout(1500);
  53  | 
  54  |     // 空状态提示
  55  |     await expect(authenticatedPage.getByText("暂无 API 密钥")).toBeVisible();
  56  |     await expect(
  57  |       authenticatedPage.getByRole("button", { name: "创建第一个密钥" }),
  58  |     ).toBeVisible();
  59  |   });
  60  | });
  61  | 
  62  | // ─── 创建 Key ───
  63  | 
  64  | test.describe("创建 API Key", () => {
  65  |   const keyName = generateApiKeyName();
  66  | 
  67  |   test.afterAll(async ({ request, userToken }) => {
  68  |     // 清理：删除测试创建的密钥
  69  |     const keys = await getApiKeys(request, userToken);
  70  |     const target = keys.find((k: any) => k.name === keyName);
  71  |     if (target) {
  72  |       await deleteApiKey(request, userToken, target.id);
  73  |     }
  74  |   });
  75  | 
  76  |   test("打开创建弹窗，表单字段完整", async ({ authenticatedPage }) => {
  77  |     await authenticatedPage.goto("/dashboard/apikeys");
  78  |     await authenticatedPage.waitForLoadState("domcontentloaded");
  79  | 
  80  |     // 点击创建
  81  |     await authenticatedPage
  82  |       .getByRole("button", { name: "创建密钥" })
  83  |       .click();
  84  | 
  85  |     // 弹窗出现
  86  |     const dialog = authenticatedPage.getByRole("dialog");
  87  |     await expect(dialog).toBeVisible();
  88  |     await expect(dialog.getByText("创建 API 密钥")).toBeVisible();
  89  | 
  90  |     // 表单字段
  91  |     await expect(dialog.getByLabel("密钥名称")).toBeVisible();
  92  |     await expect(dialog.getByLabel("批量创建数量")).toBeVisible();
  93  |     await expect(dialog.getByText("无限配额")).toBeVisible();
  94  | 
  95  |     // 取消关闭弹窗
  96  |     await dialog.getByRole("button", { name: "取消" }).click();
  97  |     await expect(dialog).not.toBeVisible();
  98  |   });
  99  | 
  100 |   test("填写表单并成功创建密钥", async ({ authenticatedPage }) => {
  101 |     await authenticatedPage.goto("/dashboard/apikeys");
  102 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  103 | 
  104 |     // 打开创建弹窗
  105 |     await authenticatedPage
  106 |       .getByRole("button", { name: "创建密钥" })
  107 |       .click();
  108 |     const dialog = authenticatedPage.getByRole("dialog");
  109 |     await expect(dialog).toBeVisible();
  110 | 
  111 |     // 填写名称
  112 |     await dialog.getByLabel("密钥名称").fill(keyName);
  113 | 
  114 |     // 提交
  115 |     await dialog.getByRole("button", { name: "保存" }).click();
  116 | 
  117 |     // 弹窗关闭
  118 |     await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  119 | 
  120 |     // toast 提示
  121 |     await expect(
  122 |       authenticatedPage.getByText("API 密钥创建成功").first(),
```