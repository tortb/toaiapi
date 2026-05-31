import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma 数据库服务
 *
 * 封装 PrismaClient，提供生命周期管理。
 * 所有数据库操作必须通过此服务进行。
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * 清理数据库（仅用于测试）
   */
  async cleanDatabase(): Promise<void> {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // 按照外键依赖顺序删除
    await this.requestLog.deleteMany();
    await this.payment.deleteMany();
    await this.order.deleteMany();
    await this.userTransaction.deleteMany();
    await this.userSubscription.deleteMany();
    await this.userBalance.deleteMany();
    await this.channelModel.deleteMany();
    await this.modelPricing.deleteMany();
    await this.channel.deleteMany();
    await this.model.deleteMany();
    await this.provider.deleteMany();
    await this.apiKey.deleteMany();
    await this.user.deleteMany();
    await this.organization.deleteMany();
    await this.subscriptionPlan.deleteMany();
  }
}
