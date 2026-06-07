/**
 * API 密钥管理页面 Page Object
 *
 * 对应路由：/dashboard/apikeys
 */

import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ApiKeysPage extends BasePage {
  static readonly PATH = "/dashboard/apikeys";

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto(ApiKeysPage.PATH);
    await this.waitForLoad();
  }

  /** 等待表格数据加载完成 */
  async waitForDataLoaded() {
    // 等待 loading 消失或表格内容出现
    await this.page.waitForTimeout(1000);
  }

  /* ─── 创建密钥 ─── */

  /** 点击"创建密钥"按钮 */
  async clickCreateKey() {
    await this.page
      .getByRole("button", { name: "创建密钥" })
      .click();
  }

  /** 在创建弹窗中填写密钥名称 */
  async fillKeyName(name: string) {
    await this.page
      .getByLabel("密钥名称")
      .fill(name);
  }

  /** 提交创建弹窗 */
  async submitCreateModal() {
    await this.page
      .getByRole("dialog")
      .getByRole("button", { name: "保存" })
      .click();
  }

  /** 取消创建弹窗 */
  async cancelCreateModal() {
    await this.page
      .getByRole("dialog")
      .getByRole("button", { name: "取消" })
      .click();
  }

  /** 完整创建密钥流程 */
  async createKey(name: string) {
    await this.clickCreateKey();
    await this.page.getByRole("dialog").waitFor({ state: "visible" });
    await this.fillKeyName(name);
    await this.submitCreateModal();
    // 等待弹窗关闭
    await this.page.getByRole("dialog").waitFor({
      state: "hidden",
      timeout: 10_000,
    });
  }

  /* ─── 列表操作 ─── */

  /** 获取表格所有行 */
  getRows() {
    return this.page.locator("table tbody tr");
  }

  /** 获取指定行（按名称列匹配） */
  getRowByName(name: string) {
    return this.page.locator("table tbody tr").filter({ hasText: name });
  }

  /** 获取指定行的状态 Badge */
  getStatusBadge(name: string) {
    return this.getRowByName(name).locator("td").filter({ hasText: /活动|禁用/ });
  }

  /** 获取密钥数量 */
  async getKeyCount(): Promise<number> {
    const rows = this.getRows();
    return await rows.count();
  }

  /** 断言指定名称的密钥存在 */
  async expectKeyExists(name: string) {
    await expect(this.getRowByName(name)).toBeVisible({ timeout: 10_000 });
  }

  /** 断言指定名称的密钥不存在 */
  async expectKeyNotExists(name: string) {
    await expect(this.getRowByName(name)).not.toBeVisible();
  }

  /** 断言密钥状态为"活动" */
  async expectKeyActive(name: string) {
    const row = this.getRowByName(name);
    await expect(row.getByText("活动")).toBeVisible();
  }

  /** 断言密钥状态为"禁用" */
  async expectKeyDisabled(name: string) {
    const row = this.getRowByName(name);
    await expect(row.getByText("禁用")).toBeVisible();
  }

  /* ─── 启用/禁用 ─── */

  /** 切换指定行的启用/禁用状态 */
  async toggleKey(name: string) {
    const row = this.getRowByName(name);
    await row.getByRole("button", { name: /禁用|启用/ }).click();
  }

  /* ─── 删除 ─── */

  /** 删除指定行的密钥（会弹出 confirm 对话框） */
  async deleteKey(name: string) {
    const row = this.getRowByName(name);
    // 监听 confirm 对话框并自动确认
    this.page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "删除" }).click();
    // 等待删除请求完成
    await this.page.waitForTimeout(1000);
  }

  /* ─── 空状态 ─── */

  /** 断言显示空状态 */
  async expectEmptyState() {
    await expect(this.page.getByText("暂无 API 密钥")).toBeVisible();
    await expect(
      this.page.getByText("创建第一个密钥"),
    ).toBeVisible();
  }

  /* ─── 页面结构 ─── */

  /** 断言页面标题正确 */
  async expectPageTitle() {
    await expect(
      this.page.getByRole("heading", { name: "API 密钥" }),
    ).toBeVisible();
  }

  /** 断言安全建议卡片存在 */
  async expectSecurityTips() {
    await expect(this.page.getByText("安全建议")).toBeVisible();
  }

  /** 断言快速集成卡片存在 */
  async expectQuickIntegration() {
    await expect(this.page.getByText("快速集成")).toBeVisible();
  }

  /* ─── 创建弹窗 ─── */

  /** 断言创建弹窗可见 */
  async expectCreateModalVisible() {
    await expect(
      this.page.getByRole("dialog").getByText("创建 API 密钥"),
    ).toBeVisible();
  }

  /** 断言创建弹窗不可见 */
  async expectCreateModalHidden() {
    await expect(
      this.page.getByRole("dialog"),
    ).not.toBeVisible();
  }
}
