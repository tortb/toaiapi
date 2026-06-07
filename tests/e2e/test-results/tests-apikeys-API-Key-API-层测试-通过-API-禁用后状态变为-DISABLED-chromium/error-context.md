# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/apikeys.spec.ts >> API Key API 层测试 >> 通过 API 禁用后状态变为 DISABLED
- Location: tests/apikeys.spec.ts:344:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "DISABLED"
Received: "ACTIVE"
```

# Test source

```ts
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
  284 |     await authenticatedPage.goto("/dashboard/apikeys");
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
> 355 |     expect(found.status).toBe("DISABLED");
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  356 | 
  357 |     // 恢复并清理
  358 |     await enableApiKey(request, userToken, created.id);
  359 |     await deleteApiKey(request, userToken, created.id);
  360 |   });
  361 | });
  362 | 
```