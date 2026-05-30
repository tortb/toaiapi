/**
 * Provider 种子数据
 *
 * 8 个主流 AI Provider
 */
export async function seedProviders(prisma) {
    console.log('Seeding providers...');
    const providers = [
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
            name: 'qwen',
            display_name: 'Qwen (通义千问)',
            base_url: 'https://dashscope.aliyuncs.com/compatible-mode',
        },
        {
            name: 'glm',
            display_name: 'GLM (智谱)',
            base_url: 'https://open.bigmodel.cn/api/paas',
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
    ];
    for (const provider of providers) {
        await prisma.provider.upsert({
            where: { name: provider.name },
            update: {
                display_name: provider.display_name,
                base_url: provider.base_url,
            },
            create: provider,
        });
    }
    console.log(`  ✓ ${providers.length} providers seeded`);
}
//# sourceMappingURL=providers.seed.js.map