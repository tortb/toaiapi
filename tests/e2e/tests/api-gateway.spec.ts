/**
 * API Gateway 端到端测试
 *
 * 覆盖：使用 API Key 调用 /v1/chat/completions、错误 Key 拒绝、
 *       公开端点可用性、模型列表
 * 通过 Playwright request context 直接测试后端 API
 */

import { test, expect } from "../fixtures/auth.fixture";
import { getGatewayTestConfig, generateApiKeyName } from "../utils/test-data";
import {
  chatCompletion,
  createApiKey,
  deleteApiKey,
  healthCheck,
} from "../utils/api-helper";

// ─── 公开端点 ───

test.describe("公开 API 端点", () => {
  test("健康检查端点正常", async ({ request }) => {
    const healthy = await healthCheck(request);
    expect(healthy).toBeTruthy();
  });

  test("公开模型列表端点可用", async ({ request }) => {
    const res = await request.get("/api/v1/models/public");
    expect(res.status()).toBeLessThan(400);

    const json = await res.json();
    expect(json.code).toBe(0);
    expect(json.data).toBeTruthy();
  });

  test("服务状态端点可用", async ({ request }) => {
    const res = await request.get("/api/v1/status");
    expect(res.status()).toBeLessThan(400);

    const json = await res.json();
    expect(json.code).toBe(0);
  });

  test("公开配置端点可用", async ({ request }) => {
    const res = await request.get("/api/v1/public-config");
    expect(res.status()).toBeLessThan(400);

    const json = await res.json();
    expect(json.code).toBe(0);
    expect(json.data).toBeTruthy();
  });
});

// ─── 使用 API Key 调用 Chat Completion ───

test.describe("Chat Completion API 调用", () => {
  const config = getGatewayTestConfig();

  // 如果没有配置真实 API Key，跳过网关调用测试
  test.skip(!config.apiKey, "未配置 TEST_API_KEY 环境变量，跳过网关调用测试");

  test("使用有效 API Key 发起同步请求，返回正确格式", async ({
    request,
    testApiKey,
  }) => {
    const res = await chatCompletion(
      request,
      config.apiKey || testApiKey,
      config.model,
      [
        { role: "user", content: "Say exactly: hello world" },
      ],
      false,
    );

    expect(res.status()).toBe(200);

    const json = await res.json();
    // OpenAI 兼容格式验证
    expect(json.id).toBeTruthy();
    expect(json.object).toBe("chat.completion");
    expect(json.model).toBeTruthy();
    expect(json.choices).toBeTruthy();
    expect(json.choices.length).toBeGreaterThan(0);
    expect(json.choices[0].message).toBeTruthy();
    expect(json.choices[0].message.role).toBe("assistant");
    expect(json.choices[0].message.content).toBeTruthy();
    expect(json.usage).toBeTruthy();
    expect(json.usage.prompt_tokens).toBeGreaterThan(0);
    expect(json.usage.completion_tokens).toBeGreaterThan(0);
    expect(json.usage.total_tokens).toBeGreaterThan(0);
  });

  test("使用有效 API Key 发起流式请求，返回 SSE 格式", async ({
    request,
    testApiKey,
  }) => {
    const res = await chatCompletion(
      request,
      config.apiKey || testApiKey,
      config.model,
      [
        { role: "user", content: "Say: streaming test" },
      ],
      true,
    );

    expect(res.status()).toBe(200);

    // 验证 SSE 内容类型
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toMatch(/text\/event-stream|text\/plain/);

    // 读取流式响应
    const body = await res.text();
    const lines = body.split("\n").filter((l: string) => l.startsWith("data: "));

    // 至少有一个数据块
    expect(lines.length).toBeGreaterThan(0);

    // 最后一个数据块应该是 [DONE]
    const lastDataLine = lines[lines.length - 1];
    expect(lastDataLine).toContain("[DONE]");

    // 第一个数据块应该包含有效 JSON
    const firstChunk = JSON.parse(lines[0].replace("data: ", ""));
    expect(firstChunk.object).toBe("chat.completion.chunk");
    expect(firstChunk.choices).toBeTruthy();
    expect(firstChunk.choices[0].delta).toBeTruthy();
  });
});

// ─── 错误 Key 拒绝 ───

test.describe("API Key 验证", () => {
  test("无效 API Key 被拒绝，返回 401", async ({ request }) => {
    const res = await request.post("/api/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "sk-toai-invalid-key-12345",
      },
      data: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
      }),
    });

    expect(res.status()).toBe(401);

    const json = await res.json();
    expect(json.code).toBe(401);
  });

  test("缺少 API Key 被拒绝", async ({ request }) => {
    const res = await request.post("/api/v1/chat/completions", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
      }),
    });

    // 应该返回 401 或 403
    expect([401, 403]).toContain(res.status());
  });

  test("使用 Bearer 方式传递 API Key", async ({ request, testApiKey }) => {
    const config = getGatewayTestConfig();
    const key = config.apiKey || testApiKey;

    const res = await request.post("/api/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      data: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: "Say: bearer test" }],
      }),
    });

    if (config.apiKey) {
      // 有真实 key 时应该成功
      expect(res.status()).toBe(200);
    } else {
      // 测试 key 可能没有余额，但不应是 401
      const json = await res.json();
      expect(json.code).not.toBe(401);
    }
  });
});

// ─── 模型列表 ───

test.describe("模型列表 API", () => {
  test("公开模型列表返回数组", async ({ request }) => {
    const res = await request.get("/api/v1/models/public");
    const json = await res.json();

    expect(json.code).toBe(0);
    expect(Array.isArray(json.data)).toBeTruthy();

    // 如果有模型，验证结构
    if (json.data.length > 0) {
      const model = json.data[0];
      expect(model.name || model.id).toBeTruthy();
    }
  });

  test("使用 API Key 查询可用模型列表", async ({ request, testApiKey }) => {
    const config = getGatewayTestConfig();
    const key = config.apiKey || testApiKey;

    const res = await request.get("/api/v1/models", {
      headers: { "X-API-Key": key },
    });

    if (config.apiKey) {
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.code).toBe(0);
    }
  });
});

// ─── 请求格式验证 ───

test.describe("请求格式验证", () => {
  test("缺少 model 字段返回错误", async ({ request, testApiKey }) => {
    const res = await request.post("/api/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": testApiKey,
      },
      data: JSON.stringify({
        messages: [{ role: "user", content: "test" }],
      }),
    });

    // 应该返回 400
    expect(res.status()).toBe(400);

    const json = await res.json();
    expect(json.code).toBe(400);
  });

  test("空 messages 数组返回错误", async ({ request, testApiKey }) => {
    const res = await request.post("/api/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": testApiKey,
      },
      data: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [],
      }),
    });

    expect(res.status()).toBe(400);
  });
});
