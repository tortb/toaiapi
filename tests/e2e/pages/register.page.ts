/**
 * 注册页面 Page Object
 *
 * 对应路由：/register
 */

import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class RegisterPage extends BasePage {
  static readonly PATH = "/register";

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto(RegisterPage.PATH);
    await this.waitForLoad();
  }

  async fillDisplayName(name: string) {
    await this.page.getByLabel("显示名称").fill(name);
  }

  async fillEmail(email: string) {
    await this.page.getByPlaceholder("you@example.com").fill(email);
  }

  async fillPassword(password: string) {
    await this.page
      .getByLabel("密码", { exact: true })
      .fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.page
      .getByLabel("确认密码")
      .fill(password);
  }

  async submit() {
    await this.page
      .getByRole("button", { name: "注册", exact: true })
      .click();
  }

  /** 完整注册流程 */
  async register(
    displayName: string,
    email: string,
    password: string,
  ) {
    await this.fillDisplayName(displayName);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    await this.submit();
  }

  async expectSubmitting() {
    await expect(
      this.page.getByRole("button", { name: "注册中..." }),
    ).toBeVisible();
  }

  /** 断言注册关闭消息 */
  async expectRegistrationClosed() {
    await expect(this.page.getByText("注册已关闭")).toBeVisible();
  }

  /** 断言密码不一致错误 */
  async expectPasswordMismatch() {
    await expect(this.page.getByText("两次输入的密码不一致")).toBeVisible();
  }

  /** 断言密码过短错误 */
  async expectPasswordTooShort() {
    await expect(this.page.getByText("密码长度至少 8 位")).toBeVisible();
  }

  /** 断言登录链接 */
  async expectLoginLink() {
    await expect(
      this.page.getByRole("link", { name: "登录" }),
    ).toBeVisible();
  }

  /** 断言跳转到 dashboard */
  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  }

  /** 验证 localStorage 中的 token */
  async expectTokensStored() {
    const token = await this.page.evaluate(() =>
      localStorage.getItem("toaiapi_access_token"),
    );
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);
  }
}
