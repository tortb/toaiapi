/**
 * ToAIAPI Database Seed Script
 *
 * 功能：
 * - 初始化 8 个主流 AI Provider
 * - 初始化常用 AI Models（含定价）
 * - 创建默认管理员账号（从环境变量读取）
 *
 * 特性：
 * - 幂等执行（使用 upsert）
 * - 重复执行不报错
 * - 输出详细初始化日志
 *
 * 使用方法：
 *   pnpm --filter @toai/backend db:seed
 *   或
 *   npx ts-node prisma/seed.ts
 *
 * 环境变量：
 *   ADMIN_EMAIL    - 管理员邮箱（默认：admin@toaiapi.com）
 *   ADMIN_PASSWORD - 管理员密码（默认：Admin@123456）
 *   DATABASE_URL   - PostgreSQL 连接字符串
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// ============================================================
// Provider 数据
// ============================================================

interface ProviderData {
  name: string;
  display_name: string;
  base_url: string;
}

const PROVIDERS: ProviderData[] = [
  {
    name: 'openai',
    display_name: 'OpenAI',
    base_url: 'https://api.openai.com',
  },
  {
    name: 'anthropic',
    display_name: 'Anthropic',
    base_url: 'https://api.anthropic.com',
  },
  {
    name: 'google',
    display_name: 'Google',
    base_url: 'https://generativelanguage.googleapis.com',
  },
  {
    name: 'deepseek',
    display_name: 'DeepSeek',
    base_url: 'https://api.deepseek.com',
  },
  {
    name: 'openrouter',
    display_name: 'OpenRouter',
    base_url: 'https://openrouter.ai/api',
  },
  {
    name: 'moonshot',
    display_name: 'Moonshot (Kimi)',
    base_url: 'https://api.moonshot.cn',
  },
  {
    name: 'grok',
    display_name: 'Grok (xAI)',
    base_url: 'https://api.x.ai',
  },
  {
    name: 'qwen',
    display_name: 'Qwen (通义千问)',
    base_url: 'https://dashscope.aliyuncs.com/compatible-mode',
  },
];

// ============================================================
// Model 数据
// ============================================================

interface ModelPricing {
  input_price: number;
  output_price: number;
  cached_price?: number;
  reasoning_price?: number;
}

interface ModelData {
  name: string;
  display_name: string;
  provider_name: string;
  max_context: number;
  supports_streaming: boolean;
  supports_tools: boolean;
  supports_vision: boolean;
  pricing: ModelPricing;
}

const MODELS: ModelData[] = [
  // OpenAI
  {
    name: 'gpt-4.1',
    display_name: 'GPT-4.1',
    provider_name: 'openai',
    max_context: 1048576,
    supports_streaming: true,
    supports_tools: true,
    supports_vision: true,
    pricing: { input_price: 200, output_price: 800, cached_price: 50 },
  },
  {
    name: 'gpt-4o',
    display_name: 'GPT-4o',
    provider_name: 'openai',
    max_context: 128000,
    supports_streaming: true,
    supports_tools: true,
    supports_vision: true,
    pricing: { input_price: 250, output_price: 1000, cached_price: 125 },
  },
  {
    name: 'o3',
    display_name: 'o3',
    provider_name: 'openai',
    max_context: 200000,
    supports_streaming: true,
    supports_tools: true,
    supports_vision: true,
    pricing: { input_price: 2000, output_price: 8000, cached_price: 500, reasoning_price: 8000 },
  },

  // Anthropic
  {
    name: 'claude-sonnet-4',
    display_name: 'Claude Sonnet 4',
    provider_name: 'anthropic',
    max_context: 200000,
    supports_streaming: true,
    supports_tools: true,
    supports_vision: true,
    pricing: { input_price: 300, output_price: 1500, cached_price: 30 },
  },
  {
    name: 'claude-opus-4',
    display_name: 'Claude Opus 4',
    provider_name: 'anthropic',
    max_context: 200000,
    supports_streaming: true,
    supports_tools: true,
    supports_vision: true,
    pricing: { input_price: 1500, output_price: 7500, cached_price: 150 },
  },

  // Google
  {
    name: 'gemini-2.5-pro',
    display_name: 'Gemini 2.5 Pro',
    provider_name: 'google',
    max_context: 1000000,
    supports_streaming: true,
    supports_tools: true,
    supports_vision: true,
    pricing: { input_price: 125, output_price: 500, cached_price: 31 },
  },

  // DeepSeek
  {
    name: 'deepseek-chat',
    display_name: 'DeepSeek V3',
    provider_name: 'deepseek',
    max_context: 64000,
    supports_streaming: true,
    supports_tools: true,
    supports_vision: false,
    pricing: { input_price: 14, output_price: 28, cached_price: 2 },
  },
  {
    name: 'deepseek-reasoner',
    display_name: 'DeepSeek R1',
    provider_name: 'deepseek',
    max_context: 64000,
    supports_streaming: true,
    supports_tools: false,
    supports_vision: false,
    pricing: { input_price: 55, output_price: 219, reasoning_price: 219 },
  },
];

// ============================================================
// Seed 函数
// ============================================================

/**
 * 初始化 Providers
 */
async function seedProviders(): Promise<void> {
  console.log('\n📦 Seeding Providers...');

  for (const provider of PROVIDERS) {
    await prisma.provider.upsert({
      where: { name: provider.name },
      update: {
        display_name: provider.display_name,
        base_url: provider.base_url,
      },
      create: provider,
    });
    console.log(`   ✓ ${provider.display_name}`);
  }

  console.log(`   📊 Total: ${PROVIDERS.length} providers`);
}

/**
 * 初始化 Models
 */
async function seedModels(): Promise<void> {
  console.log('\n🤖 Seeding Models...');

  // 缓存 provider ID
  const providerMap = new Map<string, string>();

  for (const model of MODELS) {
    // 获取 provider ID
    if (!providerMap.has(model.provider_name)) {
      const provider = await prisma.provider.findUnique({
        where: { name: model.provider_name },
      });

      if (!provider) {
        throw new Error(`Provider "${model.provider_name}" not found. Run seedProviders first.`);
      }

      providerMap.set(model.provider_name, provider.id);
    }

    const providerId = providerMap.get(model.provider_name)!;
    const { pricing, ...modelData } = model;

    // 创建或更新模型
    const createdModel = await prisma.model.upsert({
      where: { name: modelData.name },
      update: {
        display_name: modelData.display_name,
        provider_id: providerId,
        max_context: modelData.max_context,
        supports_streaming: modelData.supports_streaming,
        supports_tools: modelData.supports_tools,
        supports_vision: modelData.supports_vision,
      },
      create: {
        name: modelData.name,
        display_name: modelData.display_name,
        provider_id: providerId,
        max_context: modelData.max_context,
        supports_streaming: modelData.supports_streaming,
        supports_tools: modelData.supports_tools,
        supports_vision: modelData.supports_vision,
      },
    });

    // 创建或更新定价
    await prisma.modelPricing.upsert({
      where: { model_id: createdModel.id },
      update: {
        input_price: pricing.input_price,
        output_price: pricing.output_price,
        cached_price: pricing.cached_price ?? null,
        reasoning_price: pricing.reasoning_price ?? null,
      },
      create: {
        model_id: createdModel.id,
        input_price: pricing.input_price,
        output_price: pricing.output_price,
        cached_price: pricing.cached_price ?? null,
        reasoning_price: pricing.reasoning_price ?? null,
      },
    });

    console.log(`   ✓ ${model.display_name} (${model.provider_name})`);
  }

  console.log(`   📊 Total: ${MODELS.length} models`);
}

/**
 * 初始化默认管理员
 */
async function seedAdmin(): Promise<void> {
  console.log('\n👤 Seeding Admin User...');

  const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@toaiapi.com';
  const adminPassword = process.env['ADMIN_PASSWORD'] || 'Admin@123456';

  // 获取管理员用户组
  const adminGroup = await prisma.userGroup.findUnique({
    where: { name: 'admin' },
  });

  // 使用 Argon2id 哈希密码
  const passwordHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 创建或更新管理员
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password_hash: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      group_id: adminGroup?.id,
    },
    create: {
      email: adminEmail,
      password_hash: passwordHash,
      display_name: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      group_id: adminGroup?.id,
    },
  });

  // 创建管理员余额（如果不存在）
  await prisma.userBalance.upsert({
    where: { user_id: admin.id },
    update: {},
    create: {
      user_id: admin.id,
      amount: 0,
    },
  });

  console.log(`   ✓ Admin: ${adminEmail}`);
}

/**
 * 初始化支付配置（默认禁用，需Admin手动配置）
 */
async function seedPaymentConfigs(): Promise<void> {
  console.log('\n💳 Seeding Payment Configs...');

  const configs = [
    {
      name: 'epay',
      display_name: '易支付 (EPay)',
      is_enabled: false,
    },
    {
      name: 'alipay',
      display_name: '支付宝',
      is_enabled: false,
    },
    {
      name: 'wechatpay',
      display_name: '微信支付',
      is_enabled: false,
    },
  ];

  for (const config of configs) {
    await prisma.paymentConfig.upsert({
      where: { name: config.name },
      update: {
        display_name: config.display_name,
      },
      create: config,
    });
    console.log(`   ✓ ${config.display_name}`);
  }

  console.log(`   📊 Total: ${configs.length} payment configs`);
}

/**
 * 初始化SMTP配置（默认禁用）
 */
async function seedSmtpConfig(): Promise<void> {
  console.log('\n📧 Seeding SMTP Config...');

  await prisma.smtpConfig.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      is_enabled: false,
      port: 587,
      secure: false,
    },
  });

  console.log('   ✓ Default SMTP config created');
}

// ============================================================
// 系统设置种子数据
// ============================================================

interface SettingSeedData {
  category: string;
  settings: Array<{ key: string; value: string; type?: string }>;
}

const SYSTEM_SETTINGS: SettingSeedData[] = [
  {
    category: 'basic',
    settings: [
      { key: 'site_name', value: 'ToAIAPI' },
      { key: 'site_subtitle', value: '企业级 AI API 网关' },
      { key: 'logo_url', value: '' },
      { key: 'favicon_url', value: '' },
      { key: 'copyright', value: '© 2026 ToAIAPI. All rights reserved.' },
      { key: 'icp_number', value: '' },
      { key: 'contact_email', value: '' },
      { key: 'support_email', value: '' },
      { key: 'default_language', value: 'zh-CN' },
      { key: 'default_timezone', value: 'Asia/Shanghai' },
    ],
  },
  {
    category: 'website',
    settings: [
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
  },
  {
    category: 'user',
    settings: [
      { key: 'allow_register', value: 'true', type: 'boolean' },
      { key: 'allow_delete_account', value: 'false', type: 'boolean' },
      { key: 'allow_change_email', value: 'true', type: 'boolean' },
      { key: 'allow_change_username', value: 'true', type: 'boolean' },
      { key: 'allow_create_api_key', value: 'true', type: 'boolean' },
      { key: 'allow_delete_api_key', value: 'true', type: 'boolean' },
      { key: 'allow_webhook', value: 'false', type: 'boolean' },
      { key: 'allow_organization', value: 'false', type: 'boolean' },
    ],
  },
  {
    category: 'register',
    settings: [
      { key: 'email_verify', value: 'false', type: 'boolean' },
      { key: 'captcha_enabled', value: 'false', type: 'boolean' },
      { key: 'invite_code_required', value: 'false', type: 'boolean' },
      { key: 'whitelist_enabled', value: 'false', type: 'boolean' },
      { key: 'default_balance', value: '500', type: 'number' },
      { key: 'default_quota', value: '1000000', type: 'number' },
      { key: 'default_group', value: 'default' },
      { key: 'default_role', value: 'USER' },
    ],
  },
  {
    category: 'finance',
    settings: [
      { key: 'min_recharge', value: '100', type: 'number' },
      { key: 'max_recharge', value: '10000000', type: 'number' },
      { key: 'gift_ratio', value: '0', type: 'number' },
      { key: 'refund_enabled', value: 'false', type: 'boolean' },
      { key: 'withdraw_enabled', value: 'false', type: 'boolean' },
      { key: 'auto_refund', value: 'false', type: 'boolean' },
      { key: 'invoice_enabled', value: 'true', type: 'boolean' },
    ],
  },
  {
    category: 'rate_limit',
    settings: [
      { key: 'rpm', value: '60', type: 'number' },
      { key: 'rph', value: '1000', type: 'number' },
      { key: 'rpd', value: '10000', type: 'number' },
      { key: 'ip_limit', value: '100', type: 'number' },
      { key: 'key_limit', value: '100', type: 'number' },
      { key: 'token_limit', value: '1000000', type: 'number' },
      { key: 'concurrent_limit', value: '10', type: 'number' },
    ],
  },
  {
    category: 'security',
    settings: [
      { key: 'login_lock_enabled', value: 'true', type: 'boolean' },
      { key: 'login_max_attempts', value: '5', type: 'number' },
      { key: 'login_lock_duration', value: '1800', type: 'number' },
      { key: 'two_factor_enabled', value: 'false', type: 'boolean' },
      { key: 'password_min_length', value: '8', type: 'number' },
      { key: 'password_require_uppercase', value: 'true', type: 'boolean' },
      { key: 'password_require_number', value: 'true', type: 'boolean' },
      { key: 'password_require_special', value: 'false', type: 'boolean' },
      { key: 'session_expire', value: '86400', type: 'number' },
      { key: 'jwt_access_expire', value: '900', type: 'number' },
      { key: 'jwt_refresh_expire', value: '604800', type: 'number' },
      { key: 'ip_whitelist', value: '' },
      { key: 'ip_blacklist', value: '' },
    ],
  },
  {
    category: 'api',
    settings: [
      { key: 'api_prefix', value: '/api/v1' },
      { key: 'api_version', value: 'v1' },
      { key: 'request_timeout', value: '300000', type: 'number' },
      { key: 'max_concurrent', value: '100', type: 'number' },
      { key: 'max_tokens', value: '128000', type: 'number' },
      { key: 'cache_enabled', value: 'true', type: 'boolean' },
      { key: 'stream_enabled', value: 'true', type: 'boolean' },
    ],
  },
  {
    category: 'notification',
    settings: [
      { key: 'email_enabled', value: 'true', type: 'boolean' },
      { key: 'webhook_enabled', value: 'false', type: 'boolean' },
      { key: 'webhook_url', value: '' },
      { key: 'notify_recharge_success', value: 'true', type: 'boolean' },
      { key: 'notify_low_balance', value: 'true', type: 'boolean' },
      { key: 'notify_low_balance_threshold', value: '1000', type: 'number' },
      { key: 'notify_provider_error', value: 'true', type: 'boolean' },
      { key: 'notify_system_error', value: 'true', type: 'boolean' },
      { key: 'notify_invoice_request', value: 'true', type: 'boolean' },
    ],
  },
  {
    category: 'storage',
    settings: [
      { key: 'upload_enabled', value: 'true', type: 'boolean' },
      { key: 'max_file_size', value: '10', type: 'number' },
      { key: 'allowed_file_types', value: 'jpg,jpeg,png,gif,pdf' },
    ],
  },
  {
    category: 'developer',
    settings: [
      { key: 'debug_mode', value: 'false', type: 'boolean' },
      { key: 'log_level', value: 'info' },
      { key: 'system_monitor', value: 'true', type: 'boolean' },
    ],
  },
];

async function seedSystemSettings(): Promise<void> {
  console.log('\n⚙️  Seeding System Settings...');

  let created = 0;
  let updated = 0;

  for (const { category, settings } of SYSTEM_SETTINGS) {
    for (const { key, value, type } of settings) {
      const existing = await prisma.systemSetting.findUnique({ where: { key } });
      if (existing) {
        // 仅更新值为空的情况，不覆盖用户已配置的值
        if (!existing.value && value) {
          await prisma.systemSetting.update({
            where: { key },
            data: { value, type: type ?? 'string' },
          });
          updated++;
        }
      } else {
        await prisma.systemSetting.create({
          data: { category, key, value, type: type ?? 'string' },
        });
        created++;
      }
    }
  }

  console.log(`   ✓ System settings: ${created} created, ${updated} updated`);
}

// ============================================================
// Main
// ============================================================

// ============================================================
// 用户组数据
// ============================================================

interface UserGroupData {
  name: string;
  display_name: string;
  description: string;
  price_multiplier: number;
  rpm_limit: number;
  tpm_limit: number;
  max_api_keys: number;
  is_builtin: boolean;
}

const USER_GROUPS: UserGroupData[] = [
  {
    name: 'free',
    display_name: '免费用户',
    description: '默认免费用户组',
    price_multiplier: 1.0,
    rpm_limit: 10,
    tpm_limit: 10000,
    max_api_keys: 1000,
    is_builtin: true,
  },
  {
    name: 'vip',
    display_name: 'VIP 用户',
    description: 'VIP 用户，更高限额',
    price_multiplier: 0.8,
    rpm_limit: 60,
    tpm_limit: 60000,
    max_api_keys: 1000,
    is_builtin: true,
  },
  {
    name: 'enterprise',
    display_name: '企业用户',
    description: '企业用户，最高限额',
    price_multiplier: 0.6,
    rpm_limit: 300,
    tpm_limit: 300000,
    max_api_keys: 1000,
    is_builtin: true,
  },
  {
    name: 'agent',
    display_name: '代理商',
    description: '代理商用户组',
    price_multiplier: 0.5,
    rpm_limit: 600,
    tpm_limit: 600000,
    max_api_keys: 1000,
    is_builtin: true,
  },
  {
    name: 'admin',
    display_name: '管理员',
    description: '系统管理员',
    price_multiplier: 0,
    rpm_limit: 1000,
    tpm_limit: 1000000,
    max_api_keys: 1000,
    is_builtin: true,
  },
];

async function seedUserGroups(): Promise<void> {
  console.log('\n👥 Seeding User Groups...');

  for (const group of USER_GROUPS) {
    await prisma.userGroup.upsert({
      where: { name: group.name },
      update: {
        display_name: group.display_name,
        description: group.description,
        price_multiplier: group.price_multiplier,
        rpm_limit: group.rpm_limit,
        tpm_limit: group.tpm_limit,
        max_api_keys: group.max_api_keys,
      },
      create: {
        name: group.name,
        display_name: group.display_name,
        description: group.description,
        price_multiplier: group.price_multiplier,
        rpm_limit: group.rpm_limit,
        tpm_limit: group.tpm_limit,
        max_api_keys: group.max_api_keys,
        is_builtin: group.is_builtin,
        is_active: true,
      },
    });
    console.log(`   ✓ UserGroup: ${group.name} (${group.display_name})`);
  }
}

// ============================================================
// RBAC 角色与权限数据
// ============================================================

interface RoleData {
  code: string;
  name: string;
  description: string;
  level: number;
  is_system: boolean;
  data_scope: string;
}

const ROLES: RoleData[] = [
  {
    code: 'super_admin',
    name: '超级管理员',
    description: '系统最高权限，可管理所有功能',
    level: 100,
    is_system: true,
    data_scope: 'ALL',
  },
  {
    code: 'admin',
    name: '管理员',
    description: '平台管理员，可管理用户、订单、模型等',
    level: 80,
    is_system: true,
    data_scope: 'ALL',
  },
  {
    code: 'operator',
    name: '运营专员',
    description: '运营人员，可管理公告、工单等',
    level: 60,
    is_system: true,
    data_scope: 'ALL',
  },
  {
    code: 'finance',
    name: '财务',
    description: '财务人员，可管理订单、发票等',
    level: 50,
    is_system: true,
    data_scope: 'ALL',
  },
  {
    code: 'auditor',
    name: '审计员',
    description: '审计人员，只读权限',
    level: 40,
    is_system: true,
    data_scope: 'ALL',
  },
  {
    code: 'user',
    name: '普通用户',
    description: '普通用户，仅可管理自己的资源',
    level: 10,
    is_system: true,
    data_scope: 'SELF',
  },
];

interface PermissionData {
  code: string;
  name: string;
  resource: string;
  action: string;
}

const PERMISSIONS: PermissionData[] = [
  // 用户管理
  { code: 'user:list', name: '查看用户列表', resource: 'user', action: 'list' },
  { code: 'user:view', name: '查看用户详情', resource: 'user', action: 'view' },
  { code: 'user:create', name: '创建用户', resource: 'user', action: 'create' },
  { code: 'user:update', name: '编辑用户', resource: 'user', action: 'update' },
  { code: 'user:delete', name: '删除用户', resource: 'user', action: 'delete' },
  { code: 'user:ban', name: '封禁用户', resource: 'user', action: 'ban' },

  // 用户组管理
  { code: 'user-group:list', name: '查看用户组列表', resource: 'user-group', action: 'list' },
  { code: 'user-group:create', name: '创建用户组', resource: 'user-group', action: 'create' },
  { code: 'user-group:update', name: '编辑用户组', resource: 'user-group', action: 'update' },
  { code: 'user-group:delete', name: '删除用户组', resource: 'user-group', action: 'delete' },

  // API Key 管理
  { code: 'apikey:list', name: '查看 API Key 列表', resource: 'apikey', action: 'list' },
  { code: 'apikey:view', name: '查看 API Key 详情', resource: 'apikey', action: 'view' },
  { code: 'apikey:create', name: '创建 API Key', resource: 'apikey', action: 'create' },
  { code: 'apikey:delete', name: '删除 API Key', resource: 'apikey', action: 'delete' },

  // 订单管理
  { code: 'order:list', name: '查看订单列表', resource: 'order', action: 'list' },
  { code: 'order:view', name: '查看订单详情', resource: 'order', action: 'view' },
  { code: 'order:refund', name: '退款', resource: 'order', action: 'refund' },

  // 模型管理
  { code: 'model:list', name: '查看模型列表', resource: 'model', action: 'list' },
  { code: 'model:create', name: '创建模型', resource: 'model', action: 'create' },
  { code: 'model:update', name: '编辑模型', resource: 'model', action: 'update' },
  { code: 'model:delete', name: '删除模型', resource: 'model', action: 'delete' },

  // 渠道管理
  { code: 'channel:list', name: '查看渠道列表', resource: 'channel', action: 'list' },
  { code: 'channel:create', name: '创建渠道', resource: 'channel', action: 'create' },
  { code: 'channel:update', name: '编辑渠道', resource: 'channel', action: 'update' },
  { code: 'channel:delete', name: '删除渠道', resource: 'channel', action: 'delete' },

  // 系统设置
  { code: 'system:settings', name: '系统设置', resource: 'system', action: 'settings' },
  { code: 'system:logs', name: '查看日志', resource: 'system', action: 'logs' },
  { code: 'system:monitor', name: '系统监控', resource: 'system', action: 'monitor' },

  // Dashboard
  { code: 'dashboard:view', name: '查看 Dashboard', resource: 'dashboard', action: 'view' },
];

// 角色-权限映射（super_admin 拥有所有权限）
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.code),
  admin: [
    'user:list', 'user:view', 'user:update', 'user:ban',
    'user-group:list', 'user-group:create', 'user-group:update', 'user-group:delete',
    'apikey:list', 'apikey:view', 'apikey:create', 'apikey:delete',
    'order:list', 'order:view', 'order:refund',
    'model:list', 'model:create', 'model:update', 'model:delete',
    'channel:list', 'channel:create', 'channel:update', 'channel:delete',
    'system:settings', 'system:logs', 'system:monitor',
    'dashboard:view',
  ],
  operator: [
    'user:list', 'user:view',
    'order:list', 'order:view',
    'dashboard:view',
    'system:logs',
  ],
  finance: [
    'order:list', 'order:view', 'order:refund',
    'dashboard:view',
  ],
  auditor: [
    'user:list', 'user:view',
    'order:list', 'order:view',
    'model:list',
    'channel:list',
    'system:logs', 'system:monitor',
    'dashboard:view',
  ],
  user: [],
};

async function seedRoles(): Promise<void> {
  console.log('\n🔐 Seeding Roles...');

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
        level: role.level,
        data_scope: role.data_scope,
      },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        level: role.level,
        is_system: role.is_system,
        data_scope: role.data_scope,
        is_active: true,
      },
    });
    console.log(`   ✓ Role: ${role.code} (${role.name})`);
  }
}

async function seedPermissions(): Promise<void> {
  console.log('\n🔑 Seeding Permissions...');

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
      },
      create: {
        code: perm.code,
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
      },
    });
  }
  console.log(`   ✓ Total: ${PERMISSIONS.length} permissions`);
}

async function seedRolePermissions(): Promise<void> {
  console.log('\n🔗 Seeding Role-Permission mappings...');

  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;

    // 先删除旧的关联
    await prisma.rolePermission.deleteMany({ where: { role_id: role.id } });

    // 创建新的关联
    for (const permCode of permCodes) {
      const perm = await prisma.permission.findUnique({ where: { code: permCode } });
      if (!perm) continue;

      await prisma.rolePermission.create({
        data: {
          role_id: role.id,
          permission_id: perm.id,
        },
      });
    }
    console.log(`   ✓ ${roleCode}: ${permCodes.length} permissions`);
  }
}

async function main(): Promise<void> {
  console.log('🌱 ToAIAPI Database Seeding');
  console.log('=' .repeat(50));
  console.log(`📅 ${new Date().toISOString()}`);

  try {
    // 1. Providers（无依赖）
    await seedProviders();

    // 2. Models（依赖 Provider）
    await seedModels();

    // 3. UserGroups（无依赖）
    await seedUserGroups();

    // 4. RBAC（无依赖）
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();

    // 5. Admin（依赖 UserGroup）
    await seedAdmin();

    // 6. Payment Configs（无依赖）
    await seedPaymentConfigs();

    // 7. SMTP Config（无依赖）
    await seedSmtpConfig();

    // 8. System Settings（无依赖）
    await seedSystemSettings();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database seeding completed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ Database seeding failed!');
    console.error('='.repeat(50));
    console.error(error);
    process.exit(1);

  } finally {
    await prisma.$disconnect();
  }
}

main();
