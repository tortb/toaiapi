/**
 * 登录页面 Page Object
 *
 * 对应路由：/login
 */

import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  /** 页面路径 */
  static readonly PATH = "/login";

  constructor(page: Page) {
    super(page);
  }

  /** 导航到登录页 */
  async goto() {
    await this.page.goto(LoginPage.PATH);
    await this.waitForLoad();
  }

  /** 填写邮箱 */
  async fillEmail(email: string) {
    await this.page.getByPlaceholder("you@example.com").fill(email);
  }

  /** 填写密码 */
  async fillPassword(password: string) {
    await this.page.getByPlaceholder("••••••••").fill(password);
  }

  /** 点击登录按钮 */
  async submit() {
    await this.page.getByRole("button", { name: "登录", exact: true }).click();
  }

  /** 完整登录流程 */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** 断言登录按钮处于加载状态 */
  async expectSubmitting() {
    await expect(
      this.page.getByRole("button", { name: "登录中..." }),
    ).toBeVisible();
  }

  /** 断言登录按钮可点击 */
  async expectButtonEnabled() {
    await expect(
      this.page.getByRole("button", { name: "登录", exact: true }),
    ).toBeEnabled();
  }

  /** 断言登录按钮禁用 */
  async expectButtonDisabled() {
    await expect(
      this.page.getByRole("button", { name: "登录", exact: true }),
    ).toBeDisabled();
  }

  /** 断言跳转到 dashboard */
  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  }

  /** 断言跳转到 admin */
  async expectRedirectToAdmin() {
    await expect(this.page).toHaveURL(/\/admin/, { timeout: 15_000 });
  }

  /** 断言注册链接存在 */
  async expectRegisterLink() {
    await expect(
      this.page.getByRole("link", { name: "注册" }),
    ).toBeVisible();
  }

  /** 点击注册链接 */
  async clickRegisterLink() {
    await this.page.getByRole("link", { name: "注册" }).click();
  }

  /** 断言返回首页链接存在 */
  async expectHomeLink() {
    await expect(
      this.page.getByRole("link", { name: "← 返回首页" }),
    ).toBeVisible();
  }

  /** 验证 localStorage 中的 token */
  async expectTokensStored() {
    const token = await this.page.evaluate(() =>
      localStorage.getItem("toaiapi_access_token"),
    );
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);

    const refreshToken = await this.page.evaluate(() =>
      localStorage.getItem("toaiapi_refresh_token"),
    );
    expect(refreshToken).toBeTruthy();

    const user = await this.page.evaluate(() =>
      localStorage.getItem("toaiapi_user"),
    );
    expect(user).toBeTruthy();
    const parsed = JSON.parse(user!);
    expect(parsed.email).toBeTruthy();
    expect(parsed.id).toBeTruthy();
  }

  /** 验证 localStorage 中无 token */
  async expectNoTokens() {
    const token = await this.page.evaluate(() =>
      localStorage.getItem("toaiapi_access_token"),
    );
    expect(token).toBeFalsy();
  }
}
