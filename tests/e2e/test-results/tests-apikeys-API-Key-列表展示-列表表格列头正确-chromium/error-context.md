# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/apikeys.spec.ts >> API Key 列表展示 >> 列表表格列头正确
- Location: tests/apikeys.spec.ts:146:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/apikeys
Call log:
  - navigating to "http://localhost:3000/dashboard/apikeys", waiting until "load"

```

# Test source

```ts
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
  123 |     ).toBeVisible({ timeout: 10_000 });
  124 | 
  125 |     // 列表中出现新密钥
  126 |     await expect(
  127 |       authenticatedPage.locator("table tbody tr").filter({ hasText: keyName }),
  128 |     ).toBeVisible({ timeout: 10_000 });
  129 |   });
  130 | 
  131 |   test("创建的密钥状态为活动", async ({ authenticatedPage }) => {
  132 |     await authenticatedPage.goto("/dashboard/apikeys");
  133 |     await authenticatedPage.waitForLoadState("networkidle");
  134 |     await authenticatedPage.waitForTimeout(1000);
  135 | 
  136 |     const row = authenticatedPage
  137 |       .locator("table tbody tr")
  138 |       .filter({ hasText: keyName });
  139 |     await expect(row.getByText("活动")).toBeVisible();
  140 |   });
  141 | });
  142 | 
  143 | // ─── 列表展示 ───
  144 | 
  145 | test.describe("API Key 列表展示", () => {
  146 |   test("列表表格列头正确", async ({ authenticatedPage }) => {
> 147 |     await authenticatedPage.goto("/dashboard/apikeys");
      |                             ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/apikeys
  148 |     await authenticatedPage.waitForLoadState("domcontentloaded");
  149 | 
  150 |     const table = authenticatedPage.locator("table");
  151 |     // 检查关键列头
  152 |     await expect(table.getByText("名称")).toBeVisible();
  153 |     await expect(table.getByText("API 密钥")).toBeVisible();
  154 |     await expect(table.getByText("状态")).toBeVisible();
  155 |     await expect(table.getByText("操作")).toBeVisible();
  156 |   });
  157 | 
  158 |   test("密钥前缀以 sk-toai- 开头", async ({
  159 |     authenticatedPage,
  160 |     userToken,
  161 |   }) => {
  162 |     // 通过 API 创建一个已知名称的密钥
  163 |     const name = generateApiKeyName();
  164 |     const created = await createApiKey(
  165 |       authenticatedPage.context().request,
  166 |       userToken,
  167 |       name,
  168 |     );
  169 |     expect(created.keyPrefix).toMatch(/^sk-toai-/);
  170 | 
  171 |     await authenticatedPage.goto("/dashboard/apikeys");
  172 |     await authenticatedPage.waitForLoadState("networkidle");
  173 |     await authenticatedPage.waitForTimeout(1000);
  174 | 
  175 |     // 页面上显示的密钥前缀
  176 |     const row = authenticatedPage
  177 |       .locator("table tbody tr")
  178 |       .filter({ hasText: name });
  179 |     await expect(row.locator("code")).toContainText("sk-toai-");
  180 | 
  181 |     // 清理
  182 |     await deleteApiKey(
  183 |       authenticatedPage.context().request,
  184 |       userToken,
  185 |       created.id,
  186 |     );
  187 |   });
  188 | });
  189 | 
  190 | // ─── 启用/禁用 ───
  191 | 
  192 | test.describe("API Key 启用/禁用", () => {
  193 |   const toggleKeyName = generateApiKeyName();
  194 |   let keyId: string;
  195 | 
  196 |   test.beforeAll(async ({ request, userToken }) => {
  197 |     const created = await createApiKey(request, userToken, toggleKeyName);
  198 |     keyId = created.id;
  199 |   });
  200 | 
  201 |   test.afterAll(async ({ request, userToken }) => {
  202 |     if (keyId) {
  203 |       await deleteApiKey(request, userToken, keyId);
  204 |     }
  205 |   });
  206 | 
  207 |   test("禁用密钥后状态变为禁用", async ({ authenticatedPage }) => {
  208 |     // 先通过 API 确保密钥是启用状态
  209 |     await enableApiKey(
  210 |       authenticatedPage.context().request,
  211 |       (await import("../fixtures/auth.fixture")).loadSetupData().tokens
  212 |         .accessToken,
  213 |       keyId,
  214 |     );
  215 | 
  216 |     await authenticatedPage.goto("/dashboard/apikeys");
  217 |     await authenticatedPage.waitForLoadState("networkidle");
  218 |     await authenticatedPage.waitForTimeout(1000);
  219 | 
  220 |     const row = authenticatedPage
  221 |       .locator("table tbody tr")
  222 |       .filter({ hasText: toggleKeyName });
  223 | 
  224 |     // 初始状态为活动
  225 |     await expect(row.getByText("活动")).toBeVisible();
  226 | 
  227 |     // 点击禁用按钮
  228 |     await row.getByRole("button", { name: "禁用" }).click();
  229 | 
  230 |     // 等待 toast
  231 |     await expect(
  232 |       authenticatedPage.getByText("已禁用 API 密钥").first(),
  233 |     ).toBeVisible({ timeout: 10_000 });
  234 | 
  235 |     // 状态变为禁用
  236 |     await expect(row.getByText("禁用")).toBeVisible({ timeout: 10_000 });
  237 |   });
  238 | 
  239 |   test("启用密钥后状态变为活动", async ({ authenticatedPage }) => {
  240 |     // 先通过 API 禁用
  241 |     await disableApiKey(
  242 |       authenticatedPage.context().request,
  243 |       (await import("../fixtures/auth.fixture")).loadSetupData().tokens
  244 |         .accessToken,
  245 |       keyId,
  246 |     );
  247 | 
```