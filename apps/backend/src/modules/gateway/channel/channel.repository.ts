import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelStatus } from '@prisma/client';

/**
 * 渠道数据访问层
 *
 * 封装 Channel、Provider、Model 相关的数据库操作。
 */
@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据模型名称查找可用渠道
   *
   * @param modelName - 模型名称
   * @returns 可用渠道列表（按优先级降序、权重降序排列）
   */
  async findAvailableChannels(modelName: string) {
    return this.prisma.channelModel.findMany({
      where: {
        model: { name: modelName, is_active: true },
        is_active: true,
        channel: {
          is_active: true,
          status: ChannelStatus.ACTIVE,
        },
      },
      include: {
        channel: {
          include: {
            provider: true,
          },
        },
        model: {
          include: {
            pricing: true,
          },
        },
      },
      orderBy: [
        { channel: { priority: 'desc' } },
        { channel: { weight: 'desc' } },
      ],
    });
  }

  /**
   * 更新渠道统计
   *
   * @param channelId - 渠道 ID
   * @param latencyMs - 延迟（毫秒）
   * @param success - 是否成功
   */
  async updateChannelStats(
    channelId: string,
    latencyMs: number,
    success: boolean,
  ): Promise<void> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) return;

    const totalRequests = channel.total_requests + 1;
    const failedRequests = success
      ? channel.failed_requests
      : channel.failed_requests + 1;

    // 计算平均延迟（指数移动平均）
    const alpha = 0.1;
    const avgLatency = Math.round(
      alpha * latencyMs + (1 - alpha) * channel.avg_latency_ms,
    );

    await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        total_requests: totalRequests,
        failed_requests: failedRequests,
        avg_latency_ms: avgLatency,
      },
    });
  }

  /**
   * 标记渠道为错误状态
   */
  async markChannelError(channelId: string): Promise<void> {
    await this.prisma.channel.update({
      where: { id: channelId },
      data: { status: ChannelStatus.ERROR },
    });
  }

  /**
   * 标记渠道为限流状态
   */
  async markChannelRateLimited(channelId: string): Promise<void> {
    await this.prisma.channel.update({
      where: { id: channelId },
      data: { status: ChannelStatus.RATE_LIMITED },
    });
  }

  /**
   * 恢复渠道状态
   */
  async restoreChannel(channelId: string): Promise<void> {
    await this.prisma.channel.update({
      where: { id: channelId },
      data: { status: ChannelStatus.ACTIVE },
    });
  }

  /**
   * 获取渠道详情
   */
  async findById(channelId: string) {
    return this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        provider: true,
        models: {
          include: {
            model: true,
          },
        },
      },
    });
  }

  /**
   * 获取所有可用模型
   */
  async findAvailableModels() {
    return this.prisma.model.findMany({
      where: {
        is_active: true,
        channels: {
          some: {
            is_active: true,
            channel: {
              is_active: true,
              status: ChannelStatus.ACTIVE,
            },
          },
        },
      },
      include: {
        pricing: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
