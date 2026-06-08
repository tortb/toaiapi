import { PrismaClient } from '@prisma/client';
import { encrypt } from '../../src/common/utils/crypto.util';

/**
 * Channel 种子数据
 *
 * 为每个 provider 创建一个测试渠道。
 * 注意：需要在 .env 中配置实际的 API Key。
 */
export async function seedChannels(prisma: PrismaClient): Promise<void> {
  console.log('Seeding channels...');

  const providers = await prisma.provider.findMany({
    where: { is_active: true },
  });

  const models = await prisma.model.findMany({
    where: { is_active: true },
  });

  let channelCount = 0;

  for (const provider of providers) {
    const rawApiKey = process.env[`${provider.name.toUpperCase()}_API_KEY`]?.trim();
    if (!rawApiKey) {
      console.log(`  - Skipping ${provider.display_name}: API key env not configured`);
      continue;
    }

    const encryptedApiKey = encrypt(rawApiKey);

    // 为每个 provider 创建一个渠道，API Key 必须加密存储。
    const channel = await prisma.channel.upsert({
      where: {
        // 使用 provider_id + name 作为唯一标识
        id: `seed-${provider.name}`,
      },
      update: {
        name: `${provider.display_name} Official`,
        base_url: provider.base_url,
        api_key: encryptedApiKey,
      },
      create: {
        id: `seed-${provider.name}`,
        provider_id: provider.id,
        name: `${provider.display_name} Official`,
        base_url: provider.base_url,
        api_key: encryptedApiKey,
        weight: 1,
        priority: 0,
      },
    });

    // 为渠道关联模型
    const providerModels = models.filter(
      (m: { provider_id: string }) => m.provider_id === provider.id,
    );

    for (const model of providerModels) {
      await prisma.channelModel.upsert({
        where: {
          channel_id_model_id: {
            channel_id: channel.id,
            model_id: model.id,
          },
        },
        update: { is_active: true },
        create: {
          channel_id: channel.id,
          model_id: model.id,
          is_active: true,
        },
      });
    }

    channelCount++;
  }

  console.log(`  ✓ ${channelCount} channels seeded`);
}
