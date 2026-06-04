# ERD — 实体关系图

## 完整 ERD（文本版）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ToAIAPI Database ERD                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐
│   Organization   │       │   Subscription   │
│──────────────────│       │      Plan        │
│ id          PK   │       │──────────────────│
│ name             │       │ id          PK   │
│ slug        UQ   │       │ name        UQ   │
│ logo_url         │       │ monthly_price    │
│ description      │       │ yearly_price     │
│ balance (fen)    │       │ monthly_quota    │
│ created_at       │       │ rate_limit       │
│ updated_at       │       │ token_limit      │
└────────┬─────────┘       │ features (JSON)  │
         │                 │ created_at       │
         │ 1:N             │ updated_at       │
         ▼                 └──────────────────┘
┌──────────────────┐
│      User        │
│──────────────────│
│ id          PK   │◀──────────────────────────────────────────────┐
│ email       UQ   │                                               │
│ phone       UQ   │       ┌──────────────────┐                   │
│ password_hash    │       │   UserBalance    │                   │
│ display_name     │       │──────────────────│                   │
│ avatar_url       │       │ id          PK   │                   │
│ role (enum)      │       │ user_id     UQ FK│◀── 1:1 ──────────┤
│ status (enum)    │       │ amount (fen)     │                   │
│ github_id   UQ   │       │ frozen (fen)     │                   │
│ google_id   UQ   │       └──────────────────┘                   │
│ wechat_id   UQ   │                                               │
│ organization_id  │       ┌──────────────────┐                   │
│ deleted_at       │       │ UserSubscription │                   │
│ created_at       │       │──────────────────│                   │
│ updated_at       │       │ id          PK   │                   │
└──┬──┬──┬──┬──────┘       │ user_id     UQ FK│◀── 1:1 ──────────┤
   │  │  │  │               │ type (enum)      │                   │
   │  │  │  │               │ status (enum)    │                   │
   │  │  │  │               │ plan_id          │                   │
   │  │  │  │               │ used_quota       │                   │
   │  │  │  │               │ start_date       │                   │
   │  │  │  │               │ end_date         │                   │
   │  │  │  │               │ auto_renew       │                   │
   │  │  │  │               └──────────────────┘                   │
   │  │  │  │                                                       │
   │  │  │  │ 1:N    ┌──────────────────┐                          │
   │  │  │  └───────▶│    UserTransaction│                          │
   │  │  │           │──────────────────│                          │
   │  │  │           │ id          PK   │                          │
   │  │  │           │ user_id     FK   │                          │
   │  │  │           │ type (enum)      │                          │
   │  │  │           │ amount (fen)     │                          │
   │  │  │           │ balance_after    │                          │
   │  │  │           │ remark           │                          │
   │  │  │           │ order_id         │                          │
   │  │  │           │ created_at       │                          │
   │  │  │           └──────────────────┘                          │
   │  │  │                                                          │
   │  │  │ 1:N    ┌──────────────────┐    1:1    ┌──────────────┐ │
   │  │  └───────▶│      Order       │◀──────────│   Payment    │ │
   │  │           │──────────────────│           │──────────────│ │
   │  │           │ id          PK   │           │ id      PK   │ │
   │  │           │ user_id     FK   │           │ order_id UQ FK│ │
   │  │           │ order_no    UQ   │           │ trade_no     │ │
   │  │           │ amount (fen)     │           │ buyer_id     │ │
   │  │           │ paid_amount      │           │ status       │ │
   │  │           │ status (enum)    │           │ refund_amount│ │
   │  │           │ product_type     │           │ refunded_at  │ │
   │  │           │ product_id       │           │ created_at   │ │
   │  │           │ product_name     │           │ updated_at   │ │
   │  │           │ payment_method   │           └──────────────┘ │
   │  │           │ created_at       │                             │
   │  │           │ updated_at       │                             │
   │  │           └──────────────────┘                             │
   │  │                                                            │
   │  │ 1:N    ┌──────────────────┐                                │
   │  └───────▶│     ApiKey       │                                │
   │           │──────────────────│                                │
   │           │ id          PK   │                                │
   │           │ user_id     FK   │                                │
   │           │ name             │                                │
   │           │ key_hash    UQ   │                                │
   │           │ key_prefix  UQ   │                                │
   │           │ is_active        │                                │
   │           │ expires_at       │                                │
   │           │ rate_limit       │                                │
   │           │ token_limit      │                                │
   │           │ model_limit[]    │                                │
   │           │ ip_whitelist[]   │                                │
   │           │ created_at       │                                │
   │           │ updated_at       │                                │
   │           └──────────────────┘                                │
   │                                                               │
   │ 1:N    ┌──────────────────┐                                   │
   └───────▶│   RequestLog     │                                   │
            │──────────────────│                                   │
            │ id          PK   │                                   │
            │ user_id          │ (无 FK)                            │
            │ api_key_id       │ (无 FK)                            │
            │ model_id         │ (无 FK)                            │
            │ channel_id       │ (无 FK)                            │
            │ request_path     │                                   │
            │ request_method   │                                   │
            │ prompt_tokens    │                                   │
            │ completion_tokens│                                   │
            │ cached_tokens    │                                   │
            │ reasoning_tokens │                                   │
            │ total_tokens     │                                   │
            │ cost (fen)       │                                   │
            │ status_code      │                                   │
            │ latency_ms       │                                   │
            │ created_at       │                                   │
            └──────────────────┘                                   │

┌──────────────────┐    1:N    ┌──────────────────┐
│     Provider     │──────────▶│     Channel      │
│──────────────────│           │──────────────────│
│ id          PK   │           │ id          PK   │
│ name        UQ   │           │ provider_id  FK  │
│ display_name     │           │ name             │
│ base_url         │           │ base_url         │
│ is_active        │           │ api_key (加密)    │
│ created_at       │           │ weight (1-100)   │
│ updated_at       │           │ priority (0-100) │
└──────────────────┘           │ status (enum)    │
                               │ total_requests   │
┌──────────────────┐           │ failed_requests  │
│      Model       │           │ avg_latency_ms   │
│──────────────────│           │ rate_limit       │
│ id          PK   │           │ token_limit      │
│ name        UQ   │           │ created_at       │
│ display_name     │           │ updated_at       │
│ provider_id      │           └────────┬─────────┘
│ max_context      │                    │
│ supports_streaming│                   │ N:N (via ChannelModel)
│ supports_tools   │                    │
│ supports_vision  │           ┌────────▼─────────┐
│ is_active        │           │   ChannelModel   │
│ created_at       │           │──────────────────│
│ updated_at       │           │ channel_id  FK   │
└──────┬───────────┘           │ model_id    FK   │
       │                       │ alias            │
       │ 1:1                   └──────────────────┘
       ▼
┌──────────────────┐
│   ModelPricing   │
│──────────────────│
│ id          PK   │
│ model_id    UQ FK│
│ input_price      │ (分/百万Token)
│ output_price     │
│ cached_price     │
│ reasoning_price  │
│ multiplier       │ (默认 1.0)
│ created_at       │
│ updated_at       │
└──────────────────┘
```

## 注意事项

1. **RequestLog 无外键约束** — 日志表高频写入，不设外键避免锁竞争
2. **Model.provider_id 无外键** — 字符串引用，应用层保证一致性
3. **金额字段均为 Int** — 单位为分（fen）
4. **Channel.api_key 加密存储** — AES-256-GCM
5. **ApiKey.key_hash 唯一** — Argon2id 哈希
