import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"], ["list"]]
    : [["html", { open: "on-failure" }], ["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    /* 全局 setup：注册测试用户、保存 storageState */
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    /* 浏览器测试：需要登录态的 UI 测试（排除纯 API 测试） */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /tests\/(?!api-gateway).*\.spec\.ts/,
    },
    /* 纯 API 测试：不依赖浏览器，直接调用后端 */
    {
      name: "api-only",
      testMatch: /tests\/api-gateway\.spec\.ts/,
      use: {
        baseURL: API_BASE_URL,
      },
      dependencies: ["setup"],
    },
  ],

  outputDir: "test-results/",
});
