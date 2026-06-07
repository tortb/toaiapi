# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/api-gateway.spec.ts >> API Key 验证 >> 无效 API Key 被拒绝，返回 401
- Location: tests/api-gateway.spec.ts:135:7

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/api/v1/chat/completions
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json
    - X-API-Key: sk-toai-invalid-key-12345
    - content-length: 69

```