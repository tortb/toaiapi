import { PrismaClient } from '@prisma/client';

/**
 * Model 种子数据
 *
 * 常用模型 + 定价（单位：分/百万 token）
 */
export async function seedModels(prisma: PrismaClient): Promise<void> {
  console.log('Seeding models...');

  // 获取 provider ID
  const openai = await prisma.provider.findUnique({ where: { name: 'openai' } });
  const anthropic = await prisma.provider.findUnique({ where: { name: 'anthropic' } });
  const google = await prisma.provider.findUnique({ where: { name: 'google' } });
  const deepseek = await prisma.provider.findUnique({ where: { name: 'deepseek' } });
  const qwen = await prisma.provider.findUnique({ where: { name: 'qwen' } });
  const glm = await prisma.provider.findUnique({ where: { name: 'glm' } });
  const moonshot = await prisma.provider.findUnique({ where: { name: 'moonshot' } });
  const grok = await prisma.provider.findUnique({ where: { name: 'grok' } });

  if (!openai || !anthropic || !google || !deepseek || !qwen || !glm || !moonshot || !grok) {
    throw new Error('Providers must be seeded first');
  }

  const models = [
    // OpenAI
    {
      name: 'gpt-4o',
      display_name: 'GPT-4o',
      provider_id: openai.id,
      max_context: 128000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 250, output_price: 1000, cached_price: 125 },
    },
    {
      name: 'gpt-4o-mini',
      display_name: 'GPT-4o Mini',
      provider_id: openai.id,
      max_context: 128000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 15, output_price: 60, cached_price: 7 },
    },
    {
      name: 'gpt-4-turbo',
      display_name: 'GPT-4 Turbo',
      provider_id: openai.id,
      max_context: 128000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 1000, output_price: 3000, cached_price: 500 },
    },
    {
      name: 'o1',
      display_name: 'o1',
      provider_id: openai.id,
      max_context: 200000,
      supports_streaming: true,
      supports_tools: false,
      supports_vision: true,
      pricing: { input_price: 1500, output_price: 6000, cached_price: 750, reasoning_price: 6000 },
    },
    {
      name: 'o3-mini',
      display_name: 'o3 Mini',
      provider_id: openai.id,
      max_context: 200000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 110, output_price: 440, cached_price: 55, reasoning_price: 440 },
    },

    // Anthropic
    {
      name: 'claude-sonnet-4',
      display_name: 'Claude Sonnet 4',
      provider_id: anthropic.id,
      max_context: 200000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 300, output_price: 1500, cached_price: 30 },
    },
    {
      name: 'claude-opus-4',
      display_name: 'Claude Opus 4',
      provider_id: anthropic.id,
      max_context: 200000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 1500, output_price: 7500, cached_price: 150 },
    },
    {
      name: 'claude-haiku-4',
      display_name: 'Claude Haiku 4',
      provider_id: anthropic.id,
      max_context: 200000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 80, output_price: 400, cached_price: 8 },
    },

    // Google
    {
      name: 'gemini-2.5-pro',
      display_name: 'Gemini 2.5 Pro',
      provider_id: google.id,
      max_context: 1000000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 125, output_price: 500, cached_price: 31 },
    },
    {
      name: 'gemini-2.5-flash',
      display_name: 'Gemini 2.5 Flash',
      provider_id: google.id,
      max_context: 1000000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 15, output_price: 60, cached_price: 3 },
    },

    // DeepSeek
    {
      name: 'deepseek-chat',
      display_name: 'DeepSeek V3',
      provider_id: deepseek.id,
      max_context: 64000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: false,
      pricing: { input_price: 14, output_price: 28, cached_price: 2 },
    },
    {
      name: 'deepseek-reasoner',
      display_name: 'DeepSeek R1',
      provider_id: deepseek.id,
      max_context: 64000,
      supports_streaming: true,
      supports_tools: false,
      supports_vision: false,
      pricing: { input_price: 55, output_price: 219, reasoning_price: 219 },
    },

    // Qwen
    {
      name: 'qwen-max',
      display_name: 'Qwen Max',
      provider_id: qwen.id,
      max_context: 32000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: false,
      pricing: { input_price: 20, output_price: 60, cached_price: 2 },
    },

    // GLM
    {
      name: 'glm-4-plus',
      display_name: 'GLM-4 Plus',
      provider_id: glm.id,
      max_context: 128000,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      pricing: { input_price: 50, output_price: 50 },
    },

    // Moonshot
    {
      name: 'moonshot-v1-128k',
      display_name: 'Moonshot V1 128K',
      provider_id: moonshot.id,
      max_context: 128000,
      supports_streaming: true,
      supports_tools: false,
      supports_vision: false,
      pricing: { input_price: 60, output_price: 120 },
    },

    // Grok
    {
      name: 'grok-3',
      display_name: 'Grok 3',
      provider_id: grok.id,
      max_context: 131072,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: false,
      pricing: { input_price: 300, output_price: 1500, cached_price: 75 },
    },
  ];

  for (const model of models) {
    const { pricing, ...modelData } = model;

    const created = await prisma.model.upsert({
      where: { name: modelData.name },
      update: modelData,
      create: modelData,
    });

    // 创建或更新定价
    await prisma.modelPricing.upsert({
      where: { model_id: created.id },
      update: pricing,
      create: {
        model_id: created.id,
        ...pricing,
      },
    });
  }

  console.log(`  ✓ ${models.length} models seeded`);
}
