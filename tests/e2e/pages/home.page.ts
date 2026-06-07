/**
 * 首页 Page Object
 *
 * 对应路由：/
 */

import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  static readonly PATH = "/";

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto(HomePage.PATH);
    await this.waitForLoad();
  }

  /* ─── 顶部导航 ─── */

  /** 断言导航链接存在 */
  async expectNavLink(label: string) {
    await expect(
      this.page.locator("header nav").getByText(label, { exact: true }),
    ).toBeVisible();
  }

  /** 点击导航链接 */
  async clickNavLink(label: string) {
    await this.page
      .locator("header nav")
      .getByText(label, { exact: true })
      .click();
  }

  /** 断言登录按钮存在 */
  async expectLoginButton() {
    await expect(
      this.page.locator("header").getByRole("link", { name: "登录" }),
    ).toBeVisible();
  }

  /** 断言注册按钮存在 */
  async expectRegisterButton() {
    await expect(
      this.page.locator("header").getByRole("link", { name: "注册" }),
    ).toBeVisible();
  }

  /** 断言控制台按钮存在（已登录状态） */
  async expectConsoleButton() {
    await expect(
      this.page.locator("header").getByRole("link", { name: "控制台" }),
    ).toBeVisible();
  }

  /** 点击登录按钮 */
  async clickLogin() {
    await this.page
      .locator("header")
      .getByRole("link", { name: "登录" })
      .click();
  }

  /** 点击注册按钮 */
  async clickRegister() {
    await this.page
      .locator("header")
      .getByRole("link", { name: "注册" })
      .click();
  }

  /** 点击控制台按钮 */
  async clickConsole() {
    await this.page
      .locator("header")
      .getByRole("link", { name: "控制台" })
      .click();
  }

  /* ─── 页脚 ─── */

  /** 断言页脚存在 */
  async expectFooter() {
    await expect(this.page.locator("footer")).toBeVisible();
  }

  /** 断言页脚链接存在 */
  async expectFooterLink(label: string) {
    await expect(
      this.page.locator("footer").getByText(label).first(),
    ).toBeVisible();
  }
}
