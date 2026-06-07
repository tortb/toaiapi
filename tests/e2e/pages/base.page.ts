/**
 * 页面基类
 *
 * 所有 Page Object 继承此类，提供通用操作和断言方法。
 */

import { type Page, type Locator, expect } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  /** 等待页面加载完成（body 可见） */
  async waitForLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }

  /** 等待网络空闲 */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState("networkidle");
  }

  /** 获取当前 URL 路径 */
  getPath(): string {
    return new URL(this.page.url()).pathname;
  }

  /** 断言当前路径 */
  async expectPath(path: string) {
    await expect(this.page).toHaveURL(new RegExp(`${path}($|\\?)`));
  }

  /** 断言页面标题包含文本 */
  async expectTitle(text: string) {
    await expect(
      this.page.getByRole("heading", { name: text }),
    ).toBeVisible();
  }

  /** 获取错误提示文本 */
  async getErrorMessage(): Promise<string | null> {
    const errorDiv = this.page.locator(".bg-red-50").first();
    if (await errorDiv.isVisible()) {
      return await errorDiv.textContent();
    }
    return null;
  }

  /** 断言出现错误提示 */
  async expectError(text: string) {
    await expect(this.page.locator(".bg-red-50").first()).toContainText(text);
  }

  /** 等待并获取 toast 消息 */
  async expectToast(text: string) {
    await expect(this.page.getByText(text).first()).toBeVisible({
      timeout: 10_000,
    });
  }

  /** 截图（调试用） */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
