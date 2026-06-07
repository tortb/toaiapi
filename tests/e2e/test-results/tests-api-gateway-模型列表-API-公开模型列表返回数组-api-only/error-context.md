# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/api-gateway.spec.ts >> 模型列表 API >> 公开模型列表返回数组
- Location: tests/api-gateway.spec.ts:195:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  100 |       config.model,
  101 |       [
  102 |         { role: "user", content: "Say: streaming test" },
  103 |       ],
  104 |       true,
  105 |     );
  106 | 
  107 |     expect(res.status()).toBe(200);
  108 | 
  109 |     // 验证 SSE 内容类型
  110 |     const contentType = res.headers()["content-type"] || "";
  111 |     expect(contentType).toMatch(/text\/event-stream|text\/plain/);
  112 | 
  113 |     // 读取流式响应
  114 |     const body = await res.text();
  115 |     const lines = body.split("\n").filter((l: string) => l.startsWith("data: "));
  116 | 
  117 |     // 至少有一个数据块
  118 |     expect(lines.length).toBeGreaterThan(0);
  119 | 
  120 |     // 最后一个数据块应该是 [DONE]
  121 |     const lastDataLine = lines[lines.length - 1];
  122 |     expect(lastDataLine).toContain("[DONE]");
  123 | 
  124 |     // 第一个数据块应该包含有效 JSON
  125 |     const firstChunk = JSON.parse(lines[0].replace("data: ", ""));
  126 |     expect(firstChunk.object).toBe("chat.completion.chunk");
  127 |     expect(firstChunk.choices).toBeTruthy();
  128 |     expect(firstChunk.choices[0].delta).toBeTruthy();
  129 |   });
  130 | });
  131 | 
  132 | // ─── 错误 Key 拒绝 ───
  133 | 
  134 | test.describe("API Key 验证", () => {
  135 |   test("无效 API Key 被拒绝，返回 401", async ({ request }) => {
  136 |     const res = await request.post("/api/v1/chat/completions", {
  137 |       headers: {
  138 |         "Content-Type": "application/json",
  139 |         "X-API-Key": "sk-toai-invalid-key-12345",
  140 |       },
  141 |       data: JSON.stringify({
  142 |         model: "gpt-4o-mini",
  143 |         messages: [{ role: "user", content: "test" }],
  144 |       }),
  145 |     });
  146 | 
  147 |     expect(res.status()).toBe(401);
  148 | 
  149 |     const json = await res.json();
  150 |     expect(json.code).toBe(401);
  151 |   });
  152 | 
  153 |   test("缺少 API Key 被拒绝", async ({ request }) => {
  154 |     const res = await request.post("/api/v1/chat/completions", {
  155 |       headers: { "Content-Type": "application/json" },
  156 |       data: JSON.stringify({
  157 |         model: "gpt-4o-mini",
  158 |         messages: [{ role: "user", content: "test" }],
  159 |       }),
  160 |     });
  161 | 
  162 |     // 应该返回 401 或 403
  163 |     expect([401, 403]).toContain(res.status());
  164 |   });
  165 | 
  166 |   test("使用 Bearer 方式传递 API Key", async ({ request, testApiKey }) => {
  167 |     const config = getGatewayTestConfig();
  168 |     const key = config.apiKey || testApiKey;
  169 | 
  170 |     const res = await request.post("/api/v1/chat/completions", {
  171 |       headers: {
  172 |         "Content-Type": "application/json",
  173 |         Authorization: `Bearer ${key}`,
  174 |       },
  175 |       data: JSON.stringify({
  176 |         model: config.model,
  177 |         messages: [{ role: "user", content: "Say: bearer test" }],
  178 |       }),
  179 |     });
  180 | 
  181 |     if (config.apiKey) {
  182 |       // 有真实 key 时应该成功
  183 |       expect(res.status()).toBe(200);
  184 |     } else {
  185 |       // 测试 key 可能没有余额，但不应是 401
  186 |       const json = await res.json();
  187 |       expect(json.code).not.toBe(401);
  188 |     }
  189 |   });
  190 | });
  191 | 
  192 | // ─── 模型列表 ───
  193 | 
  194 | test.describe("模型列表 API", () => {
  195 |   test("公开模型列表返回数组", async ({ request }) => {
  196 |     const res = await request.get("/api/v1/models/public");
  197 |     const json = await res.json();
  198 | 
  199 |     expect(json.code).toBe(0);
> 200 |     expect(Array.isArray(json.data)).toBeTruthy();
      |                                      ^ Error: expect(received).toBeTruthy()
  201 | 
  202 |     // 如果有模型，验证结构
  203 |     if (json.data.length > 0) {
  204 |       const model = json.data[0];
  205 |       expect(model.name || model.id).toBeTruthy();
  206 |     }
  207 |   });
  208 | 
  209 |   test("使用 API Key 查询可用模型列表", async ({ request, testApiKey }) => {
  210 |     const config = getGatewayTestConfig();
  211 |     const key = config.apiKey || testApiKey;
  212 | 
  213 |     const res = await request.get("/api/v1/models", {
  214 |       headers: { "X-API-Key": key },
  215 |     });
  216 | 
  217 |     if (config.apiKey) {
  218 |       expect(res.status()).toBe(200);
  219 |       const json = await res.json();
  220 |       expect(json.code).toBe(0);
  221 |     }
  222 |   });
  223 | });
  224 | 
  225 | // ─── 请求格式验证 ───
  226 | 
  227 | test.describe("请求格式验证", () => {
  228 |   test("缺少 model 字段返回错误", async ({ request, testApiKey }) => {
  229 |     const res = await request.post("/api/v1/chat/completions", {
  230 |       headers: {
  231 |         "Content-Type": "application/json",
  232 |         "X-API-Key": testApiKey,
  233 |       },
  234 |       data: JSON.stringify({
  235 |         messages: [{ role: "user", content: "test" }],
  236 |       }),
  237 |     });
  238 | 
  239 |     // 应该返回 400
  240 |     expect(res.status()).toBe(400);
  241 | 
  242 |     const json = await res.json();
  243 |     expect(json.code).toBe(400);
  244 |   });
  245 | 
  246 |   test("空 messages 数组返回错误", async ({ request, testApiKey }) => {
  247 |     const res = await request.post("/api/v1/chat/completions", {
  248 |       headers: {
  249 |         "Content-Type": "application/json",
  250 |         "X-API-Key": testApiKey,
  251 |       },
  252 |       data: JSON.stringify({
  253 |         model: "gpt-4o-mini",
  254 |         messages: [],
  255 |       }),
  256 |     });
  257 | 
  258 |     expect(res.status()).toBe(400);
  259 |   });
  260 | });
  261 | 
```