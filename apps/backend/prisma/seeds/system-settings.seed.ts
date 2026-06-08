/**
 * 系统设置种子数据
 *
 * 15 个分类的默认参数配置。
 * 运行方式：npx tsx prisma/seeds/system-settings.seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** 种子数据定义 */
const SEED_DATA: Record<string, Array<{ key: string; value: string; type?: string }>> = {
  // ─── 基础设置 ───
  basic: [
    { key: 'site_name', value: 'ToAIAPI' },
    { key: 'site_subtitle', value: '企业级 AI API 网关' },
    { key: 'logo_url', value: '' },
    { key: 'favicon_url', value: '' },
    { key: 'copyright', value: '© 2026 ToAIAPI. All rights reserved.' },
    { key: 'icp_number', value: '' },
    { key: 'icp_number_show', value: 'false', type: 'boolean' },
    { key: 'psb_number', value: '' },
    { key: 'psb_number_show', value: 'false', type: 'boolean' },
    { key: 'contact_email', value: '' },
    { key: 'support_email', value: '' },
    { key: 'default_language', value: 'zh-CN' },
    { key: 'default_timezone', value: 'Asia/Shanghai' },
  ],

  // ─── 网站设置 ───
  website: [
    { key: 'maintenance_mode', value: 'false', type: 'boolean' },
    { key: 'maintenance_notice', value: '' },
    { key: 'home_notice', value: '' },
    { key: 'login_notice', value: '' },
    { key: 'register_notice', value: '' },
    { key: 'footer_content', value: '' },
    { key: 'seo_title', value: 'ToAIAPI - 企业级 AI API 网关' },
    { key: 'seo_description', value: '一站式 AI API 代理平台，支持 OpenAI、Anthropic、Google 等主流模型' },
    { key: 'seo_keywords', value: 'AI API,OpenAI,Claude,GPT,API代理' },
  ],

  // ─── 用户设置 ───
  user: [
    { key: 'allow_register', value: 'true', type: 'boolean' },
    { key: 'allow_delete_account', value: 'false', type: 'boolean' },
    { key: 'allow_change_email', value: 'true', type: 'boolean' },
    { key: 'allow_change_username', value: 'true', type: 'boolean' },
    { key: 'allow_create_api_key', value: 'true', type: 'boolean' },
    { key: 'allow_delete_api_key', value: 'true', type: 'boolean' },
    { key: 'allow_webhook', value: 'false', type: 'boolean' },
    { key: 'allow_organization', value: 'false', type: 'boolean' },
  ],

  // ─── 注册设置 ───
  register: [
    { key: 'email_verify', value: 'true', type: 'boolean' },
    { key: 'captcha_enabled', value: 'false', type: 'boolean' },
    { key: 'invite_code_required', value: 'false', type: 'boolean' },
    { key: 'whitelist_enabled', value: 'false', type: 'boolean' },
    { key: 'whitelist_emails', value: '' },
    { key: 'default_balance', value: '0', type: 'number' },
    { key: 'default_quota', value: '1000000', type: 'number' },     // 100 万 Token
    { key: 'default_group', value: 'default' },
    { key: 'default_role', value: 'USER' },
  ],

  // ─── 财务设置 ───
  finance: [
    { key: 'min_recharge', value: '0.01', type: 'number' },         // 0.01 元
    { key: 'max_recharge', value: '100000', type: 'number' },       // 10 万元
    { key: 'gift_ratio', value: '0', type: 'number' },              // 赠送比例（%）
    { key: 'refund_enabled', value: 'false', type: 'boolean' },
    { key: 'withdraw_enabled', value: 'false', type: 'boolean' },
    { key: 'auto_refund', value: 'false', type: 'boolean' },
    { key: 'invoice_enabled', value: 'true', type: 'boolean' },
  ],

  // ─── 风控设置 ───
  rate_limit: [
    { key: 'rpm', value: '60', type: 'number' },                   // 单分钟请求数
    { key: 'rph', value: '1000', type: 'number' },                 // 单小时请求数
    { key: 'rpd', value: '10000', type: 'number' },                // 单日请求数
    { key: 'ip_limit', value: '100', type: 'number' },             // 单 IP 限制
    { key: 'key_limit', value: '100', type: 'number' },            // 单 Key 限制
    { key: 'token_limit', value: '1000000', type: 'number' },      // Token 限制
    { key: 'concurrent_limit', value: '10', type: 'number' },      // 并发限制
  ],

  // ─── 安全设置 ───
  security: [
    { key: 'login_lock_enabled', value: 'true', type: 'boolean' },
    { key: 'login_max_attempts', value: '5', type: 'number' },
    { key: 'login_lock_duration', value: '1800', type: 'number' }, // 30 分钟
    { key: 'two_factor_enabled', value: 'false', type: 'boolean' },
    { key: 'password_min_length', value: '8', type: 'number' },
    { key: 'password_require_uppercase', value: 'true', type: 'boolean' },
    { key: 'password_require_number', value: 'true', type: 'boolean' },
    { key: 'password_require_special', value: 'false', type: 'boolean' },
    { key: 'session_expire', value: '86400', type: 'number' },     // 24 小时
    { key: 'jwt_access_expire', value: '900', type: 'number' },    // 15 分钟
    { key: 'jwt_refresh_expire', value: '604800', type: 'number' }, // 7 天
    { key: 'ip_whitelist', value: '' },
    { key: 'ip_blacklist', value: '' },
  ],

  // ─── API 设置 ───
  api: [
    { key: 'api_prefix', value: '/api/v1' },
    { key: 'api_version', value: 'v1' },
    { key: 'request_timeout', value: '300000', type: 'number' },   // 5 分钟
    { key: 'max_concurrent', value: '100', type: 'number' },
    { key: 'max_tokens', value: '128000', type: 'number' },
    { key: 'cache_enabled', value: 'true', type: 'boolean' },
    { key: 'stream_enabled', value: 'true', type: 'boolean' },
  ],

  // ─── 通知设置 ───
  notification: [
    { key: 'email_enabled', value: 'true', type: 'boolean' },
    { key: 'webhook_enabled', value: 'false', type: 'boolean' },
    { key: 'webhook_url', value: '' },
    { key: 'notify_recharge_success', value: 'true', type: 'boolean' },
    { key: 'notify_low_balance', value: 'true', type: 'boolean' },
    { key: 'notify_low_balance_threshold', value: '10', type: 'number' }, // 10 元
    { key: 'notify_provider_error', value: 'true', type: 'boolean' },
    { key: 'notify_system_error', value: 'true', type: 'boolean' },
    { key: 'notify_invoice_request', value: 'true', type: 'boolean' },
  ],

  // ─── 存储设置 ───
  storage: [
    { key: 'upload_enabled', value: 'true', type: 'boolean' },
    { key: 'max_file_size', value: '10', type: 'number' },         // 10 MB
    { key: 'allowed_file_types', value: 'jpg,jpeg,png,gif,pdf' },
  ],

  // ─── 开发者设置 ───
  developer: [
    { key: 'debug_mode', value: 'false', type: 'boolean' },
    { key: 'log_level', value: 'info' },
    { key: 'system_monitor', value: 'true', type: 'boolean' },
  ],

  // ─── 验证码设置（阿里云 ESA AI 验证码）───
  // 每个 URL 对应独立的 Scene ID，identity/region/mode 为全局共享
  captcha: [
    { key: 'captcha_identity', value: '' },
    { key: 'captcha_region', value: 'cn' },
    { key: 'captcha_mode', value: 'popup' },
    // 注册 /api/v1/auth/register
    { key: 'captcha_register_enabled', value: 'true', type: 'boolean' },
    { key: 'captcha_register_scene_id', value: '' },
    // 登录 /api/v1/auth/login
    { key: 'captcha_login_enabled', value: 'false', type: 'boolean' },
    { key: 'captcha_login_scene_id', value: '' },
    // 忘记密码 /api/v1/auth/forgot-password
    { key: 'captcha_forgot_password_enabled', value: 'false', type: 'boolean' },
    { key: 'captcha_forgot_password_scene_id', value: '' },
    // 发送邮箱验证码 /api/v1/auth/send-email-code
    { key: 'captcha_send_email_code_enabled', value: 'false', type: 'boolean' },
    { key: 'captcha_send_email_code_scene_id', value: '' },
  ],
};

async function main() {
  console.log('🌱 开始初始化系统设置种子数据...\n');

  let totalCreated = 0;

  for (const [category, settings] of Object.entries(SEED_DATA)) {
    for (const { key, value, type } of settings) {
      const existing = await prisma.systemSetting.findUnique({ where: { key } });
      if (!existing) {
        await prisma.systemSetting.create({
          data: { category, key, value, type: type ?? 'string' },
        });
        totalCreated++;
        console.log(`  ✅ ${category}/${key} = ${value}`);
      }
    }
  }

  console.log(`\n🎉 完成！共创建 ${totalCreated} 条系统设置`);
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
