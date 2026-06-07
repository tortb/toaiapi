/**
 * UI 导航稳定性 E2E 测试
 *
 * 覆盖：关键页面可访问性、路由跳转、侧边栏导航、未登录保护
 * 不依赖特定业务数据，只验证页面渲染和路由行为
 */

import { test, expect } from "../fixtures/auth.fixture";

// ─── 公开页面可访问性 ───

test.describe("公开页面可访问", () => {
  const publicPages = [
    { path: "/", expectText: null }, // 首页内容动态，只检查 200
    { path: "/login", expectText: "登录" },
    { path: "/register", expectText: "创建账号" },
    { path: "/models", expectText: null },
    { path: "/pricing", expectText: null },
    { path: "/status", expectText: null },
    { path: "/docs", expectText: null },
    { path: "/leaderboard", expectText: null },
  ];

  for (const { path, expectText } of publicPages) {
    test(`${path} 页面可正常访问`, async ({ page }) => {
      const response = await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      // HTTP 状态码正确
      expect(response?.status()).toBeLessThan(400);

      // 如果指定了期望文本，验证渲染
      if (expectText) {
        await expect(page.getByText(expectText).first()).toBeVisible();
      }
    });
  }
});

// ─── Dashboard 页面需要登录 ───

test.describe("Dashboard 页面登录保护", () => {
  const protectedPages = [
    "/dashboard/overview",
    "/dashboard/apikeys",
    "/dashboard/usage",
    "/dashboard/billing",
    "/dashboard/logs",
    "/dashboard/settings",
  ];

  for (const path of protectedPages) {
    test(`未登录访问 ${path} 被重定向到登录页`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
  }
});

// ─── Dashboard 侧边栏导航 ───

test.describe("Dashboard 侧边栏导航", () => {
  test("侧边栏所有导航项可点击且路由正确", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/overview");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    const sidebar = authenticatedPage.locator("aside");
    const navItems = [
      { label: "概览", path: "/dashboard/overview" },
      { label: "API 密钥", path: "/dashboard/apikeys" },
      { label: "使用统计", path: "/dashboard/usage" },
      { label: "账单中心", path: "/dashboard/billing" },
      { label: "请求日志", path: "/dashboard/logs" },
      { label: "系统设置", path: "/dashboard/settings" },
    ];

    for (const { label, path } of navItems) {
      await sidebar.getByText(label, { exact: true }).click();
      await authenticatedPage.waitForLoadState("domcontentloaded");

      // 验证 URL 包含目标路径
      await expect(authenticatedPage).toHaveURL(new RegExp(path), {
        timeout: 10_000,
      });
    }
  });

  test("返回前台链接跳转到首页", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/overview");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    await authenticatedPage
      .locator("aside")
      .getByText("返回前台")
      .click();

    await expect(authenticatedPage).toHaveURL(/\/$/, { timeout: 10_000 });
  });
});

// ─── Dashboard ↔ 首页跳转 ───

test.describe("跨区域路由跳转", () => {
  test("首页点击控制台跳转到 dashboard", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 已登录状态应该显示"控制台"按钮
    await authenticatedPage
      .locator("header")
      .getByRole("link", { name: "控制台" })
      .click();

    await expect(authenticatedPage).toHaveURL(/\/dashboard/, {
      timeout: 10_000,
    });
  });

  test("/dashboard 自动重定向到 /dashboard/overview", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/dashboard");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    await expect(authenticatedPage).toHaveURL(/\/dashboard\/overview/, {
      timeout: 10_000,
    });
  });
});

// ─── 顶栏用户菜单 ───

test.describe("顶栏用户菜单", () => {
  test("用户菜单包含系统设置和退出登录", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/overview");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    // 点击用户头像
    const header = authenticatedPage.locator("header");
    await header.locator(".rounded-full.bg-primary").locator("..").click();

    // 菜单项
    await expect(authenticatedPage.getByText("系统设置").last()).toBeVisible();
    await expect(authenticatedPage.getByText("退出登录")).toBeVisible();
  });

  test("从用户菜单跳转到系统设置", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/overview");
    await authenticatedPage.waitForLoadState("domcontentloaded");

    const header = authenticatedPage.locator("header");
    await header.locator(".rounded-full.bg-primary").locator("..").click();

    await authenticatedPage.getByText("退出登录").waitFor({ state: "visible" });
    await authenticatedPage
      .getByRole("dialog", { name: "关闭弹窗" })
      .first()
      .waitFor({ state: "detached" })
      .catch(() => {});

    // 点击系统设置
    await authenticatedPage
      .locator("header")
      .getByText("系统设置")
      .click();

    await expect(authenticatedPage).toHaveURL(/\/dashboard\/settings/, {
      timeout: 10_000,
    });
  });
});

// ─── 首页导航栏 ───

test.describe("首页导航栏", () => {
  test("导航栏链接完整且可点击", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const nav = page.locator("header nav");

    // 验证所有导航链接存在
    const links = ["模型", "价格", "排行榜", "文档", "服务状态"];
    for (const label of links) {
      await expect(nav.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("点击模型链接跳转到 /models", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await page
      .locator("header nav")
      .getByText("模型", { exact: true })
      .click();

    await expect(page).toHaveURL(/\/models/, { timeout: 10_000 });
  });
});
