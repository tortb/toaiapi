# 监控系统 — 技术规范

## 状态：V4.0 计划中

## 技术栈

| 技术 | 用途 |
|------|------|
| Prometheus | Metrics 采集 |
| Grafana | 可视化仪表盘 |
| Loki | 日志聚合 |
| OpenTelemetry | 分布式追踪 |

## 监控维度

### 1. 应用指标

| 指标 | 类型 | 说明 |
|------|------|------|
| http_requests_total | Counter | HTTP 请求总数 |
| http_request_duration_ms | Histogram | 请求延迟分布 |
| http_request_errors_total | Counter | 错误请求总数 |
| active_connections | Gauge | 活跃连接数 |

### 2. Gateway 指标

| 指标 | 类型 | 说明 |
|------|------|------|
| gateway_requests_total | Counter | Gateway 请求总数 |
| gateway_latency_ms | Histogram | Gateway 延迟 |
| gateway_errors_total | Counter | Gateway 错误 |
| provider_latency_ms | Histogram | Provider 延迟（按 provider） |
| provider_errors_total | Counter | Provider 错误（按 provider） |
| channel_health | Gauge | 渠道健康状态 |

### 3. 计费指标

| 指标 | 类型 | 说明 |
|------|------|------|
| tokens_consumed_total | Counter | Token 消耗总量 |
| revenue_total | Counter | 收入总额（分） |
| active_users | Gauge | 活跃用户数 |
| balance_total | Gauge | 平台总余额 |

### 4. 基础设施指标

| 指标 | 类型 | 说明 |
|------|------|------|
| redis_connected_clients | Gauge | Redis 连接数 |
| redis_memory_used_bytes | Gauge | Redis 内存使用 |
| postgres_connections | Gauge | PG 连接数 |
| postgres_query_duration_ms | Histogram | PG 查询延迟 |

## Grafana Dashboard

### Dashboard 1: API Overview

- 请求量趋势（QPS）
- 延迟分布（P50/P95/P99）
- 错误率
- 状态码分布

### Dashboard 2: Gateway

- Provider 请求量
- Provider 延迟对比
- Channel 健康状态
- 故障转移次数

### Dashboard 3: Billing

- Token 消耗趋势
- 收入趋势
- 模型使用分布
- Top 用户

### Dashboard 4: Infrastructure

- CPU/内存使用
- 数据库连接数
- Redis 内存
- 磁盘 I/O

## 告警规则

| 告警 | 条件 | 级别 |
|------|------|------|
| 高错误率 | 5xx > 5% 持续 5 分钟 | Critical |
| 高延迟 | P95 > 5s 持续 5 分钟 | Warning |
| Provider 全挂 | 所有 Channel ERROR | Critical |
| 余额告警 | 用户余额 < 1 元 | Info |
| 磁盘空间 | < 20% | Warning |
| 数据库连接 | > 80% | Warning |

## OpenTelemetry

```typescript
// 链路追踪
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('toaiapi');

async function handleRequest() {
  return tracer.startActiveSpan('gateway.handleChatCompletion', async (span) => {
    try {
      span.setAttribute('model', modelName);
      span.setAttribute('channel_id', channelId);
      // ... 业务逻辑
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## 日志规范

```typescript
// 结构化日志
logger.info('Request processed', {
  userId,
  model,
  channelId,
  tokens: { input, output, cached, reasoning },
  cost,
  latencyMs,
  statusCode,
});

// 错误日志
logger.error('Provider error', {
  provider,
  channel,
  error: error.message,
  stack: error.stack,
});
```
