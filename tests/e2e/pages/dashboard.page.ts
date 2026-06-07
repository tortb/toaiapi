/**
 * Dashboard 概览页面 Page Object
 *
 * 对应路由：/dashboard/overview
 */

import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  static readonly PATH = "/dashboard/overview";

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto(DashboardPage.PATH);
    await this.waitForLoad();
  }

  /* ─── 侧边栏导航 ─── */

  /** 点击侧边栏导航项 */
  async clickNavItem(label: string) {
    await this.page.locator("aside").getByText(label, { exact: true }).click();
  }

  /** 断言侧边栏导航项存在 */
  async expectNavItem(label: string) {
    await expect(
      this.page.locator("aside").getByText(label, { exact: true }),
    ).toBeVisible();
  }

  /** 断言侧边栏激活状态 */
  async expectNavItemActive(label: string) {
    const navItem = this.page
      .locator("aside")
      .getByText(label, { exact: true })
      .locator("..");
    // 激活项有 bg-soft 类
    await expect(navItem).toHaveClass(/bg-soft/);
  }

  /* ─── 顶栏 ─── */

  /** 断言顶栏页面标题 */
  async expectTopbarTitle(title: string) {
    await expect(
      this.page.locator("header h1").getByText(title),
    ).toBeVisible();
  }

  /** 获取用户头像首字母 */
  async getUserInitial(): Promise<string> {
    const avatar = this.page
      .locator("header")
      .locator(".rounded-full.bg-primary");
    return (await avatar.textContent()) || "";
  }

  /** 打开用户菜单 */
  async openUserMenu() {
    await this.page
      .locator("header")
      .locator(".rounded-full.bg-primary")
      .locator("..")
      .click();
  }

  /** 断言用户菜单可见 */
  async expectUserMenuVisible() {
    await expect(this.page.getByText("退出登录")).toBeVisible();
  }

  /** 点击退出登录 */
  async clickLogout() {
    await this.openUserMenu();
    await this.expectUserMenuVisible();
    await this.page.getByText("退出登录").click();
  }

  /* ─── 页面内容 ─── */

  /** 断言概览页面加载（检查统计卡片区域） */
  async expectOverviewLoaded() {
    // 概览页应该有周期选择器
    await expect(this.page.getByText("近7天")).toBeVisible({ timeout: 15_000 });
  }

  /** 断言跳转到登录页 */
  async expectRedirectToLogin() {
    await expect(this.page).toHaveURL(/\/login/, { timeout: 10_000 });
  }

  /* ─── 设置页面导航 ─── */

  /** 导航到设置页面 */
  async gotoSettings() {
    await this.page.goto("/dashboard/settings");
    await this.waitForLoad();
  }

  /** 断言设置页面加载 */
  async expectSettingsLoaded() {
    await expect(
      this.page.getByText("常规设置"),
    ).toBeVisible({ timeout: 15_000 });
  }
}
