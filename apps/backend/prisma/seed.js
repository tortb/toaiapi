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
const PROVIDERS = [
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
const MODELS = [
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
async function seedProviders() {
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
async function seedModels() {
    console.log('\n🤖 Seeding Models...');
    // 缓存 provider ID
    const providerMap = new Map();
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
        const providerId = providerMap.get(model.provider_name);
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
async function seedAdmin() {
    console.log('\n👤 Seeding Admin User...');
    const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@toaiapi.com';
    const adminPassword = process.env['ADMIN_PASSWORD'] || 'Admin@123456';
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
        },
        create: {
            email: adminEmail,
            password_hash: passwordHash,
            display_name: 'Admin',
            role: 'ADMIN',
            status: 'ACTIVE',
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
async function seedPaymentConfigs() {
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
async function seedSmtpConfig() {
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
// Main
// ============================================================
async function main() {
    console.log('🌱 ToAIAPI Database Seeding');
    console.log('='.repeat(50));
    console.log(`📅 ${new Date().toISOString()}`);
    try {
        // 1. Providers（无依赖）
        await seedProviders();
        // 2. Models（依赖 Provider）
        await seedModels();
        // 3. Admin（无依赖）
        await seedAdmin();
        // 4. Payment Configs（无依赖）
        await seedPaymentConfigs();
        // 5. SMTP Config（无依赖）
        await seedSmtpConfig();
        console.log('\n' + '='.repeat(50));
        console.log('✅ Database seeding completed successfully!');
        console.log('='.repeat(50));
    }
    catch (error) {
        console.error('\n' + '='.repeat(50));
        console.error('❌ Database seeding failed!');
        console.error('='.repeat(50));
        console.error(error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=seed.js.map