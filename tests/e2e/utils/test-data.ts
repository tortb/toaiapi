/**
 * 测试数据工厂
 *
 * 所有测试数据使用时间戳后缀保证幂等性，
 * 每次运行生成唯一邮箱/名称，避免测试间冲突。
 */

const TIMESTAMP = Date.now();
const PREFIX = process.env.TEST_USER_PREFIX || "e2e-test";

export function generateEmail(): string {
  return `${PREFIX}-${TIMESTAMP}-${Math.random().toString(36).slice(2, 8)}@test.local`;
}

export function generatePassword(): string {
  return process.env.TEST_USER_PASSWORD || "TestPass@123";
}

export function generateDisplayName(): string {
  return `测试用户-${TIMESTAMP}`;
}

export function generateApiKeyName(): string {
  return `e2e-key-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** 获取管理员凭据 */
export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@toaiapi.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123456",
  };
}

/** 获取 API Gateway 测试配置 */
export function getGatewayTestConfig() {
  return {
    apiKey: process.env.TEST_API_KEY || "",
    model: process.env.TEST_MODEL || "gpt-4o-mini",
  };
}

/** 测试用户数据快照（一次注册流程中复用） */
export interface TestUser {
  email: string;
  password: string;
  displayName: string;
}

export function createTestUser(): TestUser {
  return {
    email: generateEmail(),
    password: generatePassword(),
    displayName: generateDisplayName(),
  };
}
