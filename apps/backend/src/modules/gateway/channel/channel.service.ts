import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ChannelRepository } from './channel.repository';
import { ProviderAdapterFactory } from '../providers/provider-adapter.factory';
import {
  ProviderAdapter,
  ProviderConfig,
} from '../providers/provider-adapter.interface';
import { decrypt } from '../../../common/utils/crypto.util';

/**
 * 渠道选择结果
 */
export interface ChannelSelectionResult {
  readonly channelId: string;
  readonly providerName: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly adapter: ProviderAdapter;
}

/**
 * 渠道业务服务
 *
 * 负责渠道选择、故障转移、Provider 适配器管理。
 *
 * 选择策略：优先级 + 权重
 * 1. 按优先级降序排列
 * 2. 在最高优先级中按权重随机选择
 * 3. 失败时自动尝试下一个渠道
 *
 * SECURITY: 数据库中存储的是加密的 API Key，使用时需解密
 */
@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(private readonly channelRepo: ChannelRepository) {}

  /**
   * 选择渠道并创建适配器
   * SECURITY: 从数据库读取加密的 API Key，解密后传给适配器
   *
   * @param modelName - 模型名称
   * @returns 渠道选择结果
   * @throws 没有可用渠道
   */
  async selectChannel(modelName: string): Promise<ChannelSelectionResult> {
    const channels = await this.channelRepo.findAvailableChannels(modelName);

    if (channels.length === 0) {
      throw new NotFoundException(
        `No available channel for model: ${modelName}`,
      );
    }

    // 按优先级分组
    const firstChannel = channels[0];
    if (!firstChannel) {
      throw new NotFoundException(`No available channel for model: ${modelName}`);
    }
    const maxPriority = firstChannel.channel.priority;
    const topPriority = channels.filter(
      (c) => c.channel.priority === maxPriority,
    );

    // 在最高优先级中按权重选择
    const selected = this.selectByWeight(topPriority);
    if (!selected) {
      throw new NotFoundException(`No available channel for model: ${modelName}`);
    }

    // SECURITY: 解密 API Key
    const decryptedApiKey = this.decryptChannelApiKey(selected.channel.api_key);

    // 创建适配器
    const config: ProviderConfig = {
      baseUrl: selected.channel.base_url,
      apiKey: decryptedApiKey,
    };

    const adapter = ProviderAdapterFactory.create(
      selected.channel.provider.name,
      config,
    );

    return {
      channelId: selected.channel.id,
      providerName: selected.channel.provider.name,
      baseUrl: selected.channel.base_url,
      apiKey: decryptedApiKey,
      adapter,
    };
  }

  /**
   * 选择渠道（带故障转移）
   * SECURITY: 从数据库读取加密的 API Key，解密后传给适配器
   *
   * @param modelName - 模型名称
   * @returns 渠道选择结果列表（用于故障转移）
   */
  async selectChannelsWithFallback(
    modelName: string,
  ): Promise<ChannelSelectionResult[]> {
    const channels = await this.channelRepo.findAvailableChannels(modelName);

    if (channels.length === 0) {
      throw new NotFoundException(
        `No available channel for model: ${modelName}`,
      );
    }

    // 按优先级分组并排序
    const results: ChannelSelectionResult[] = [];

    for (const channelModel of channels) {
      try {
        // SECURITY: 解密 API Key
        const decryptedApiKey = this.decryptChannelApiKey(channelModel.channel.api_key);

        const config: ProviderConfig = {
          baseUrl: channelModel.channel.base_url,
          apiKey: decryptedApiKey,
        };

        const adapter = ProviderAdapterFactory.create(
          channelModel.channel.provider.name,
          config,
        );

        results.push({
          channelId: channelModel.channel.id,
          providerName: channelModel.channel.provider.name,
          baseUrl: channelModel.channel.base_url,
          apiKey: decryptedApiKey,
          adapter,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to create adapter for channel ${channelModel.channel.id}: ${error}`,
        );
      }
    }

    return results;
  }

  /**
   * 更新渠道统计
   */
  async updateChannelStats(
    channelId: string,
    latencyMs: number,
    success: boolean,
  ): Promise<void> {
    await this.channelRepo.updateChannelStats(channelId, latencyMs, success);
  }

  /**
   * 标记渠道错误
   */
  async markChannelError(channelId: string): Promise<void> {
    await this.channelRepo.markChannelError(channelId);
    this.logger.warn(`Channel ${channelId} marked as ERROR`);
  }

  /**
   * 标记渠道为限流状态
   */
  async markChannelRateLimited(channelId: string): Promise<void> {
    await this.channelRepo.markChannelRateLimited(channelId);
    this.logger.warn(`Channel ${channelId} marked as RATE_LIMITED`);
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels() {
    return this.channelRepo.findAvailableModels();
  }

  /**
   * 获取所有活跃渠道的统计信息（公开状态页用）
   */
  async getChannelStats() {
    return this.channelRepo.findChannelStats();
  }

  /**
   * 解密 Channel API Key
   * SECURITY: 解密失败直接抛出错误，不 fallback 到明文
   *
   * @param encryptedApiKey - 加密的 API Key（Base64 格式）
   * @returns 解密后的明文 API Key
   * @throws 解密失败时抛出错误
   */
  private decryptChannelApiKey(encryptedApiKey: string): string {
    return decrypt(encryptedApiKey);
  }

  /**
   * 按权重随机选择
   */
  private selectByWeight<T extends { channel: { weight: number } }>(
    items: T[],
  ): T | undefined {
    if (items.length === 0) {
      return undefined;
    }

    const totalWeight = items.reduce(
      (sum, item) => sum + item.channel.weight,
      0,
    );

    if (totalWeight === 0) {
      return items[0];
    }

    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.channel.weight;
      if (random < 0) {
        return item;
      }
    }

    return items[0];
  }
}
