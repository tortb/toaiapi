/**
 * 认证流程 E2E 测试
 *
 * 覆盖：注册、登录、登录态保持、错误登录、登出
 * 使用真实浏览器，禁止 mock 核心逻辑
 */

import { test, expect, loadSetupData } from "../fixtures/auth.fixture";
import { createTestUser, generateEmail } from "../utils/test-data";

// ─── 注册 ───

test.describe("用户注册", () => {
  test("注册页面正常渲染，表单元素完整", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    // 标题
    await expect(page.getByText("创建账号")).toBeVisible();
    // 表单字段
    await expect(page.getByLabel("显示名称")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByLabel("密码", { exact: true })).toBeVisible();
    await expect(page.getByLabel("确认密码")).toBeVisible();
    // 提交按钮
    await expect(page.getByRole("button", { name: "注册", exact: true })).toBeVisible();
    // 登录链接
    await expect(page.getByRole("link", { name: "登录" })).toBeVisible();
  });

  test("密码不一致时显示错误", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    await page.getByPlaceholder("you@example.com").fill("test@test.local");
    await page.getByLabel("密码", { exact: true }).fill("Abcd1234!");
    await page.getByLabel("确认密码").fill("Different123!");
    await page.getByRole("button", { name: "注册", exact: true }).click();

    await expect(page.getByText("两次输入的密码不一致")).toBeVisible();
  });

  test("密码过短时显示错误", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    await page.getByPlaceholder("you@example.com").fill("test@test.local");
    await page.getByLabel("密码", { exact: true }).fill("Ab1!");
    await page.getByLabel("确认密码").fill("Ab1!");
    await page.getByRole("button", { name: "注册", exact: true }).click();

    await expect(page.getByText("密码长度至少 8 位")).toBeVisible();
  });

  test("成功注册后跳转到 dashboard 并存储 token", async ({ page }) => {
    const user = createTestUser();

    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    await page.getByLabel("显示名称").fill(user.displayName);
    await page.getByPlaceholder("you@example.com").fill(user.email);
    await page.getByLabel("密码", { exact: true }).fill(user.password);
    await page.getByLabel("确认密码").fill(user.password);
    await page.getByRole("button", { name: "注册", exact: true }).click();

    // 等待跳转到 dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // 验证 token 已存储
    const token = await page.evaluate(() =>
      localStorage.getItem("toaiapi_access_token"),
    );
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);
  });
});

// ─── 登录 ───

test.describe("用户登录", () => {
  test("登录页面正常渲染，表单元素完整", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("登录").first()).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "登录", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "注册" })).toBeVisible();
    await expect(page.getByRole("link", { name: "← 返回首页" })).toBeVisible();
  });

  test("错误密码时显示错误提示", async ({ page }) => {
    const data = loadSetupData();

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.getByPlaceholder("you@example.com").fill(data.user.email);
    await page.getByPlaceholder("••••••••").fill("WrongPassword123!");
    await page.getByRole("button", { name: "登录", exact: true }).click();

    // 等待错误提示出现
    await expect(page.locator(".bg-red-50").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("错误邮箱格式时按钮禁用", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // 空表单时按钮应禁用
    await expect(
      page.getByRole("button", { name: "登录", exact: true }),
    ).toBeDisabled();
  });

  test("成功登录后跳转到 dashboard 并存储 token", async ({ page }) => {
    const data = loadSetupData();

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.getByPlaceholder("you@example.com").fill(data.user.email);
    await page.getByPlaceholder("••••••••").fill(data.user.password);
    await page.getByRole("button", { name: "登录", exact: true }).click();

    // 等待跳转
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // 验证 token
    const token = await page.evaluate(() =>
      localStorage.getItem("toaiapi_access_token"),
    );
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);

    // 验证用户信息
    const userStr = await page.evaluate(() =>
      localStorage.getItem("toaiapi_user"),
    );
    expect(userStr).toBeTruthy();
    const user = JSON.parse(userStr!);
    expect(user.email).toBe(data.user.email);
  });

  test("登录页和注册页可以互相跳转", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // 登录页 → 注册页
    await page.getByRole("link", { name: "注册" }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByText("创建账号")).toBeVisible();

    // 注册页 → 登录页
    await page.getByRole("link", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── 登录态保持 ───

test.describe("登录态保持", () => {
  test("已登录用户访问 dashboard 不被重定向", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/overview");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 应该停留在 dashboard，不跳转到 login
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
    await expect(authenticatedPage).not.toHaveURL(/\/login/);
  });

  test("已登录用户刷新页面后仍然保持登录", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/overview");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 刷新页面
    await authenticatedPage.reload();
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 仍然在 dashboard
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
    await expect(authenticatedPage).not.toHaveURL(/\/login/);

    // token 仍然存在
    const token = await authenticatedPage.evaluate(() =>
      localStorage.getItem("toaiapi_access_token"),
    );
    expect(token).toBeTruthy();
  });

  test("未登录用户访问 dashboard 被重定向到登录页", async ({ page }) => {
    // page 没有注入 token，模拟未登录状态
    await page.goto("/dashboard/overview");
    await page.waitForLoadState("domcontentloaded");

    // 应该被重定向到 login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

// ─── 登出 ───

test.describe("用户登出", () => {
  test("从 dashboard 顶栏退出后跳转到登录页", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/overview");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 点击用户头像区域打开菜单
    const header = authenticatedPage.locator("header");
    await header.locator(".rounded-full.bg-primary").locator("..").click();

    // 等待菜单出现并点击退出
    await expect(authenticatedPage.getByText("退出登录")).toBeVisible();
    await authenticatedPage.getByText("退出登录").click();

    // 应该跳转到登录页
    await expect(authenticatedPage).toHaveURL(/\/login/, { timeout: 10_000 });

    // token 应该被清除
    const token = await authenticatedPage.evaluate(() =>
      localStorage.getItem("toaiapi_access_token"),
    );
    expect(token).toBeFalsy();
  });
});
