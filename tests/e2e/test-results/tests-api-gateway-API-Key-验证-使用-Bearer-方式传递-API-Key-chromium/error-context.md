# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/api-gateway.spec.ts >> API Key 验证 >> 使用 Bearer 方式传递 API Key
- Location: tests/api-gateway.spec.ts:166:7

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/api/v1/chat/completions
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json
    - Authorization: Bearer sk-toai-kexXGC9b__LhTGqS397F4pBy7PZM9_3vc_YFU4T2pZml1ttX
    - content-length: 81

```