/**
 * 全局 Setup
 *
 * 在所有测试运行前执行一次：
 * 1. 验证后端服务健康
 * 2. 管理员登录 → 临时关闭邮箱验证
 * 3. 注册测试用户
 * 4. 恢复邮箱验证设置
 * 5. 创建测试用 API Key
 * 6. 保存 storageState
 */

import { test as setup, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  adminLogin,
  registerUser,
  createApiKey,
  healthCheck,
  updateSystemSetting,
  getSystemSettings,
} from "./utils/api-helper";
import { createTestUser, getAdminCredentials } from "./utils/test-data";

const AUTH_DIR = path.resolve(__dirname, "playwright/.auth");
const AUTH_FILE = path.join(AUTH_DIR, "user.json");
const TEST_DATA_FILE = path.join(AUTH_DIR, "test-data.json");

setup("全局初始化：注册测试用户并保存登录态", async ({ request }) => {
  // 1. 后端健康检查
  const healthy = await healthCheck(request);
  expect(healthy).toBeTruthy();

  // 2. 管理员登录
  const admin = getAdminCredentials();
  const adminTokens = await adminLogin(request, admin.email, admin.password);
  expect(adminTokens.accessToken).toBeTruthy();

  // 3. 临时关闭邮箱验证
  //    先读取当前值，注册后恢复
  let originalValue = "true";
  try {
    const settings = await getSystemSettings(
      request,
      adminTokens.accessToken,
      "register",
    );
    const ev = settings.find((s: any) => s.key === "email_verify");
    if (ev) originalValue = ev.value;
  } catch {
    // 忽略
  }

  try {
    await updateSystemSetting(
      request,
      adminTokens.accessToken,
      "register",
      "email_verify",
      "false",
    );
  } catch (e) {
    console.warn("关闭邮箱验证失败，继续尝试注册:", e);
  }

  // 4. 创建测试用户
  const user = createTestUser();
  let tokens: Awaited<ReturnType<typeof registerUser>>;
  try {
    tokens = await registerUser(
      request,
      user.email,
      user.password,
      user.displayName,
    );
    expect(tokens.accessToken).toBeTruthy();
  } finally {
    // 5. 恢复邮箱验证（无论注册是否成功）
    try {
      await updateSystemSetting(
        request,
        adminTokens.accessToken,
        "register",
        "email_verify",
        originalValue,
      );
    } catch {
      // 忽略恢复失败
    }
  }

  // 6. 创建一个测试用 API Key
  const apiKey = await createApiKey(request, tokens.accessToken, "e2e-setup-key");
  expect(apiKey.key).toBeTruthy();

  // 7. 保存测试数据供 spec 使用
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(
    TEST_DATA_FILE,
    JSON.stringify({ user, tokens, apiKey }, null, 2),
  );

  // 8. 构造 storageState（模拟浏览器 localStorage）
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: process.env.BASE_URL || "http://localhost:3000",
        localStorage: [
          {
            name: "toaiapi_access_token",
            value: tokens.accessToken,
          },
          {
            name: "toaiapi_refresh_token",
            value: tokens.refreshToken,
          },
          {
            name: "toaiapi_user",
            value: JSON.stringify({
              id: tokens.userId,
              email: tokens.email,
              displayName: user.displayName,
              role: "USER",
            }),
          },
        ],
      },
    ],
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(storageState, null, 2));
});
