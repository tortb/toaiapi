# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/apikeys.spec.ts >> API Key 删除 >> 删除密钥后从列表中移除
- Location: tests/apikeys.spec.ts:275:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/apikeys
Call log:
  - navigating to "http://localhost:3000/dashboard/apikeys", waiting until "load"

```

# Test source

```ts
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
  248 |     await authenticatedPage.goto("/dashboard/apikeys");
  249 |     await authenticatedPage.waitForLoadState("networkidle");
  250 |     await authenticatedPage.waitForTimeout(1000);
  251 | 
  252 |     const row = authenticatedPage
  253 |       .locator("table tbody tr")
  254 |       .filter({ hasText: toggleKeyName });
  255 | 
  256 |     // 初始状态为禁用
  257 |     await expect(row.getByText("禁用")).toBeVisible();
  258 | 
  259 |     // 点击启用按钮
  260 |     await row.getByRole("button", { name: "启用" }).click();
  261 | 
  262 |     // 等待 toast
  263 |     await expect(
  264 |       authenticatedPage.getByText("已启用 API 密钥").first(),
  265 |     ).toBeVisible({ timeout: 10_000 });
  266 | 
  267 |     // 状态变为活动
  268 |     await expect(row.getByText("活动")).toBeVisible({ timeout: 10_000 });
  269 |   });
  270 | });
  271 | 
  272 | // ─── 删除 ───
  273 | 
  274 | test.describe("API Key 删除", () => {
  275 |   test("删除密钥后从列表中移除", async ({ authenticatedPage, userToken }) => {
  276 |     // 通过 API 创建一个待删除的密钥
  277 |     const name = generateApiKeyName();
  278 |     const created = await createApiKey(
  279 |       authenticatedPage.context().request,
  280 |       userToken,
  281 |       name,
  282 |     );
  283 | 
> 284 |     await authenticatedPage.goto("/dashboard/apikeys");
      |                             ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/dashboard/apikeys
  285 |     await authenticatedPage.waitForLoadState("networkidle");
  286 |     await authenticatedPage.waitForTimeout(1000);
  287 | 
  288 |     // 确认密钥在列表中
  289 |     const row = authenticatedPage
  290 |       .locator("table tbody tr")
  291 |       .filter({ hasText: name });
  292 |     await expect(row).toBeVisible();
  293 | 
  294 |     // 注册 confirm 对话框自动确认
  295 |     authenticatedPage.on("dialog", (dialog) => dialog.accept());
  296 | 
  297 |     // 点击删除
  298 |     await row.getByRole("button", { name: "删除" }).click();
  299 | 
  300 |     // 等待 toast
  301 |     await expect(
  302 |       authenticatedPage.getByText("已删除 API 密钥").first(),
  303 |     ).toBeVisible({ timeout: 10_000 });
  304 | 
  305 |     // 密钥从列表中消失
  306 |     await expect(row).not.toBeVisible({ timeout: 10_000 });
  307 |   });
  308 | });
  309 | 
  310 | // ─── API 层直接测试 ───
  311 | 
  312 | test.describe("API Key API 层测试", () => {
  313 |   test("通过 API 创建并查询密钥", async ({ request, userToken }) => {
  314 |     const name = generateApiKeyName();
  315 |     const created = await createApiKey(request, userToken, name);
  316 | 
  317 |     // 验证返回值
  318 |     expect(created.id).toBeTruthy();
  319 |     expect(created.key).toMatch(/^sk-toai-/);
  320 |     expect(created.keyPrefix).toBeTruthy();
  321 | 
  322 |     // 查询列表
  323 |     const keys = await getApiKeys(request, userToken);
  324 |     const found = keys.find((k: any) => k.id === created.id);
  325 |     expect(found).toBeTruthy();
  326 |     expect(found.name).toBe(name);
  327 |     expect(found.status).toBe("ACTIVE");
  328 | 
  329 |     // 清理
  330 |     await deleteApiKey(request, userToken, created.id);
  331 |   });
  332 | 
  333 |   test("通过 API 删除密钥后查询不到", async ({ request, userToken }) => {
  334 |     const name = generateApiKeyName();
  335 |     const created = await createApiKey(request, userToken, name);
  336 | 
  337 |     await deleteApiKey(request, userToken, created.id);
  338 | 
  339 |     const keys = await getApiKeys(request, userToken);
  340 |     const found = keys.find((k: any) => k.id === created.id);
  341 |     expect(found).toBeFalsy();
  342 |   });
  343 | 
  344 |   test("通过 API 禁用后状态变为 DISABLED", async ({
  345 |     request,
  346 |     userToken,
  347 |   }) => {
  348 |     const name = generateApiKeyName();
  349 |     const created = await createApiKey(request, userToken, name);
  350 | 
  351 |     await disableApiKey(request, userToken, created.id);
  352 | 
  353 |     const keys = await getApiKeys(request, userToken);
  354 |     const found = keys.find((k: any) => k.id === created.id);
  355 |     expect(found.status).toBe("DISABLED");
  356 | 
  357 |     // 恢复并清理
  358 |     await enableApiKey(request, userToken, created.id);
  359 |     await deleteApiKey(request, userToken, created.id);
  360 |   });
  361 | });
  362 | 
```