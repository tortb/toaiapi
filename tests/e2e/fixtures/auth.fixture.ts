/**
 * 认证 Fixture
 *
 * 提供已登录状态的 page 和 API 辅助方法，
 * 每个测试独立上下文，互不干扰。
 */

import { test as base, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  registerUser,
  createApiKey,
  deleteApiKey,
  type AuthTokens,
} from "../utils/api-helper";
import { createTestUser, type TestUser } from "../utils/test-data";

const TEST_DATA_FILE = path.resolve(
  __dirname,
  "../playwright/.auth/test-data.json",
);

/** 全局 setup 产生的测试数据 */
interface SetupData {
  user: TestUser;
  tokens: AuthTokens;
  apiKey: { id: string; key: string; keyPrefix: string };
}

function loadSetupData(): SetupData {
  return JSON.parse(fs.readFileSync(TEST_DATA_FILE, "utf-8"));
}

/** 自定义 fixture 类型 */
type E2EFixtures = {
  /** 已登录的 page（通过 localStorage 注入 token） */
  authenticatedPage: Page;
  /** 测试用户的 token */
  userToken: string;
  /** 测试用户的 API Key（setup 阶段创建的） */
  testApiKey: string;
  /** 动态创建临时 API Key，测试结束后自动清理 */
  tempApiKey: Promise<{ id: string; key: string; cleanup: () => Promise<void> }>;
};

export const test = base.extend<E2EFixtures>({
  userToken: async ({}, use) => {
    const data = loadSetupData();
    await use(data.tokens.accessToken);
  },

  testApiKey: async ({}, use) => {
    const data = loadSetupData();
    await use(data.apiKey.key);
  },

  authenticatedPage: async ({ browser, baseURL }, use) => {
    const data = loadSetupData();
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: baseURL || "http://localhost:3000",
            localStorage: [
              {
                name: "toaiapi_access_token",
                value: data.tokens.accessToken,
              },
              {
                name: "toaiapi_refresh_token",
                value: data.tokens.refreshToken,
              },
              {
                name: "toaiapi_user",
                value: JSON.stringify({
                  id: data.tokens.userId,
                  email: data.tokens.email,
                  displayName: data.user.displayName,
                  role: "USER",
                }),
              },
            ],
          },
        ],
      },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  tempApiKey: async ({ request, userToken }, use) => {
    const name = `temp-${Date.now()}`;
    const created = await createApiKey(request, userToken, name);
    await use({
      id: created.id,
      key: created.key,
      cleanup: () => deleteApiKey(request, userToken, created.id),
    });
  },
});

export { expect } from "@playwright/test";
export { loadSetupData };
