/**
 * API Key 管理 E2E 测试
 *
 * 覆盖：创建、列表展示、启用/禁用、删除
 * 使用已登录的浏览器上下文，通过 API 辅助清理数据保证幂等
 */

import { test, expect } from "../fixtures/auth.fixture";
import { generateApiKeyName } from "../utils/test-data";
import {
  createApiKey,
  deleteApiKey,
  disableApiKey,
  enableApiKey,
  getApiKeys,
} from "../utils/api-helper";

// ─── 页面结构 ───

test.describe("API Key 页面结构", () => {
  test("页面正常渲染，标题和操作按钮完整", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 页面标题
    await expect(
      authenticatedPage.getByRole("heading", { name: "API 密钥" }),
    ).toBeVisible();

    // 创建按钮
    await expect(
      authenticatedPage.getByRole("button", { name: "创建密钥" }),
    ).toBeVisible();

    // 侧边栏卡片
    await expect(authenticatedPage.getByText("安全建议")).toBeVisible();
    await expect(authenticatedPage.getByText("快速集成")).toBeVisible();
  });

  test("无密钥时显示空状态", async ({ authenticatedPage, userToken }) => {
    // 先清理该用户所有密钥
    const keys = await getApiKeys(
      authenticatedPage.context().request,
      userToken,
    );
    for (const key of keys) {
      await deleteApiKey(authenticatedPage.context().request, userToken, key.id);
    }

    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("networkidle");
    await authenticatedPage.waitForTimeout(1500);

    // 空状态提示
    await expect(authenticatedPage.getByText("暂无 API 密钥")).toBeVisible();
    await expect(
      authenticatedPage.getByRole("button", { name: "创建第一个密钥" }),
    ).toBeVisible();
  });
});

// ─── 创建 Key ───

test.describe("创建 API Key", () => {
  const keyName = generateApiKeyName();

  test.afterAll(async ({ request, userToken }) => {
    // 清理：删除测试创建的密钥
    const keys = await getApiKeys(request, userToken);
    const target = keys.find((k: any) => k.name === keyName);
    if (target) {
      await deleteApiKey(request, userToken, target.id);
    }
  });

  test("打开创建弹窗，表单字段完整", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 点击创建
    await authenticatedPage
      .getByRole("button", { name: "创建密钥" })
      .click();

    // 弹窗出现
    const dialog = authenticatedPage.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("创建 API 密钥")).toBeVisible();

    // 表单字段
    await expect(dialog.getByLabel("密钥名称")).toBeVisible();
    await expect(dialog.getByLabel("批量创建数量")).toBeVisible();
    await expect(dialog.getByText("无限配额")).toBeVisible();

    // 取消关闭弹窗
    await dialog.getByRole("button", { name: "取消" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("填写表单并成功创建密钥", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 打开创建弹窗
    await authenticatedPage
      .getByRole("button", { name: "创建密钥" })
      .click();
    const dialog = authenticatedPage.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // 填写名称
    await dialog.getByLabel("密钥名称").fill(keyName);

    // 提交
    await dialog.getByRole("button", { name: "保存" }).click();

    // 弹窗关闭
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // toast 提示
    await expect(
      authenticatedPage.getByText("API 密钥创建成功").first(),
    ).toBeVisible({ timeout: 10_000 });

    // 列表中出现新密钥
    await expect(
      authenticatedPage.locator("table tbody tr").filter({ hasText: keyName }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("创建的密钥状态为活动", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("networkidle");
    await authenticatedPage.waitForTimeout(1000);

    const row = authenticatedPage
      .locator("table tbody tr")
      .filter({ hasText: keyName });
    await expect(row.getByText("活动")).toBeVisible();
  });
});

// ─── 列表展示 ───

test.describe("API Key 列表展示", () => {
  test("列表表格列头正确", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    const table = authenticatedPage.locator("table");
    // 检查关键列头
    await expect(table.getByText("名称")).toBeVisible();
    await expect(table.getByText("API 密钥")).toBeVisible();
    await expect(table.getByText("状态")).toBeVisible();
    await expect(table.getByText("操作")).toBeVisible();
  });

  test("密钥前缀以 sk-toai- 开头", async ({
    authenticatedPage,
    userToken,
  }) => {
    // 通过 API 创建一个已知名称的密钥
    const name = generateApiKeyName();
    const created = await createApiKey(
      authenticatedPage.context().request,
      userToken,
      name,
    );
    expect(created.keyPrefix).toMatch(/^sk-toai-/);

    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("networkidle");
    await authenticatedPage.waitForTimeout(1000);

    // 页面上显示的密钥前缀
    const row = authenticatedPage
      .locator("table tbody tr")
      .filter({ hasText: name });
    await expect(row.locator("code")).toContainText("sk-toai-");

    // 清理
    await deleteApiKey(
      authenticatedPage.context().request,
      userToken,
      created.id,
    );
  });
});

// ─── 启用/禁用 ───

test.describe("API Key 启用/禁用", () => {
  const toggleKeyName = generateApiKeyName();
  let keyId: string;

  test.beforeAll(async ({ request, userToken }) => {
    const created = await createApiKey(request, userToken, toggleKeyName);
    keyId = created.id;
  });

  test.afterAll(async ({ request, userToken }) => {
    if (keyId) {
      await deleteApiKey(request, userToken, keyId);
    }
  });

  test("禁用密钥后状态变为禁用", async ({ authenticatedPage }) => {
    // 先通过 API 确保密钥是启用状态
    await enableApiKey(
      authenticatedPage.context().request,
      (await import("../fixtures/auth.fixture")).loadSetupData().tokens
        .accessToken,
      keyId,
    );

    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("networkidle");
    await authenticatedPage.waitForTimeout(1000);

    const row = authenticatedPage
      .locator("table tbody tr")
      .filter({ hasText: toggleKeyName });

    // 初始状态为活动
    await expect(row.getByText("活动")).toBeVisible();

    // 点击禁用按钮
    await row.getByRole("button", { name: "禁用" }).click();

    // 等待 toast
    await expect(
      authenticatedPage.getByText("已禁用 API 密钥").first(),
    ).toBeVisible({ timeout: 10_000 });

    // 状态变为禁用
    await expect(row.getByText("禁用")).toBeVisible({ timeout: 10_000 });
  });

  test("启用密钥后状态变为活动", async ({ authenticatedPage }) => {
    // 先通过 API 禁用
    await disableApiKey(
      authenticatedPage.context().request,
      (await import("../fixtures/auth.fixture")).loadSetupData().tokens
        .accessToken,
      keyId,
    );

    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("networkidle");
    await authenticatedPage.waitForTimeout(1000);

    const row = authenticatedPage
      .locator("table tbody tr")
      .filter({ hasText: toggleKeyName });

    // 初始状态为禁用
    await expect(row.getByText("禁用")).toBeVisible();

    // 点击启用按钮
    await row.getByRole("button", { name: "启用" }).click();

    // 等待 toast
    await expect(
      authenticatedPage.getByText("已启用 API 密钥").first(),
    ).toBeVisible({ timeout: 10_000 });

    // 状态变为活动
    await expect(row.getByText("活动")).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 删除 ───

test.describe("API Key 删除", () => {
  test("删除密钥后从列表中移除", async ({ authenticatedPage, userToken }) => {
    // 通过 API 创建一个待删除的密钥
    const name = generateApiKeyName();
    const created = await createApiKey(
      authenticatedPage.context().request,
      userToken,
      name,
    );

    await authenticatedPage.goto("/dashboard/apikeys");
    await authenticatedPage.waitForLoadState("networkidle");
    await authenticatedPage.waitForTimeout(1000);

    // 确认密钥在列表中
    const row = authenticatedPage
      .locator("table tbody tr")
      .filter({ hasText: name });
    await expect(row).toBeVisible();

    // 注册 confirm 对话框自动确认
    authenticatedPage.on("dialog", (dialog) => dialog.accept());

    // 点击删除
    await row.getByRole("button", { name: "删除" }).click();

    // 等待 toast
    await expect(
      authenticatedPage.getByText("已删除 API 密钥").first(),
    ).toBeVisible({ timeout: 10_000 });

    // 密钥从列表中消失
    await expect(row).not.toBeVisible({ timeout: 10_000 });
  });
});

// ─── API 层直接测试 ───

test.describe("API Key API 层测试", () => {
  test("通过 API 创建并查询密钥", async ({ request, userToken }) => {
    const name = generateApiKeyName();
    const created = await createApiKey(request, userToken, name);

    // 验证返回值
    expect(created.id).toBeTruthy();
    expect(created.key).toMatch(/^sk-toai-/);
    expect(created.keyPrefix).toBeTruthy();

    // 查询列表
    const keys = await getApiKeys(request, userToken);
    const found = keys.find((k: any) => k.id === created.id);
    expect(found).toBeTruthy();
    expect(found.name).toBe(name);
    expect(found.status).toBe("ACTIVE");

    // 清理
    await deleteApiKey(request, userToken, created.id);
  });

  test("通过 API 删除密钥后查询不到", async ({ request, userToken }) => {
    const name = generateApiKeyName();
    const created = await createApiKey(request, userToken, name);

    await deleteApiKey(request, userToken, created.id);

    const keys = await getApiKeys(request, userToken);
    const found = keys.find((k: any) => k.id === created.id);
    expect(found).toBeFalsy();
  });

  test("通过 API 禁用后状态变为 DISABLED", async ({
    request,
    userToken,
  }) => {
    const name = generateApiKeyName();
    const created = await createApiKey(request, userToken, name);

    await disableApiKey(request, userToken, created.id);

    const keys = await getApiKeys(request, userToken);
    const found = keys.find((k: any) => k.id === created.id);
    expect(found.status).toBe("DISABLED");

    // 恢复并清理
    await enableApiKey(request, userToken, created.id);
    await deleteApiKey(request, userToken, created.id);
  });
});
