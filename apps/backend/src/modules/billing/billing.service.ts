import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { calculateCost } from '@toai/billing';
import type { TokenUsage } from '@toai/common';

/**
 * 计费业务服务
 *
 * 核心职责：
 * 1. 管理用户余额
 * 2. 计算 API 使用费用
 * 3. 扣减余额
 * 4. 记录交易流水
 *
 * 关键规则（严格遵循 billing-rules.md）：
 * - NEVER 信任 provider 返回的 token 数
 * - 所有金额单位：分
 * - 所有费用计算使用 Math.ceil
 * - 余额扣减使用数据库事务
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly billingRepo: BillingRepository) {}

  /**
   * 创建用户余额
   *
   * 用户注册时调用，初始余额为 0。
   */
  async createBalance(userId: string): Promise<void> {
    const existing = await this.billingRepo.getBalance(userId);
    if (existing) {
      return; // 已存在，不重复创建
    }

    await this.billingRepo.createBalance(userId, 0);
    this.logger.log(`Balance created for user: ${userId}`);
  }

  /**
   * 获取用户余额
   *
   * @param userId - 用户 ID
   * @returns 余额信息（分）
   * @throws {NotFoundException} 余额不存在
   */
  async getBalance(userId: string): Promise<{
    amount: number;
    frozen: number;
    available: number;
  }> {
    const balance = await this.billingRepo.getBalance(userId);

    if (!balance) {
      throw new NotFoundException('User balance not found');
    }

    return {
      amount: balance.amount,
      frozen: balance.frozen,
      available: balance.amount - balance.frozen,
    };
  }

  /**
   * 处理 API 使用计费
   *
   * 计算费用并扣减余额。
   *
   * @param userId - 用户 ID
   * @param apiKeyId - API Key ID
   * @param channelId - 渠道 ID
   * @param modelName - 模型名称
   * @param usage - Token 使用统计
   * @returns 费用（分）
   */
  async processUsage(
    userId: string,
    apiKeyId: string,
    channelId: string,
    modelName: string,
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    },
  ): Promise<number> {
    // 1. 获取模型定价
    const pricing = await this.billingRepo.getModelPricing(modelName);

    if (!pricing) {
      this.logger.warn(`Pricing not found for model: ${modelName}, using zero cost`);
      return 0;
    }

    // 2. 计算费用（使用 @toai/billing 包）
    const tokenUsage: TokenUsage = {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      cachedTokens: 0,
      reasoningTokens: 0,
      totalTokens: usage.total_tokens,
    };

    const result = calculateCost(tokenUsage, {
      inputPrice: pricing.input_price,
      outputPrice: pricing.output_price,
      cachedPrice: pricing.cached_price || 0,
      reasoningPrice: pricing.reasoning_price || 0,
      multiplier: Number(pricing.multiplier),
    });

    const cost = result.cost;

    if (cost <= 0) {
      return 0;
    }

    // 3. 扣减余额
    await this.billingRepo.deductBalance(
      userId,
      cost,
      undefined,
      `API usage: ${modelName} (${usage.total_tokens} tokens)`,
    );

    this.logger.debug(
      `Billed user ${userId}: ${cost} cents for ${modelName} (${usage.total_tokens} tokens)`,
    );

    return cost;
  }

  /**
   * 充值余额
   *
   * @param userId - 用户 ID
   * @param amount - 充值金额（分）
   * @param remark - 备注
   */
  async recharge(
    userId: string,
    amount: number,
    remark?: string,
  ): Promise<void> {
    await this.billingRepo.rechargeBalance(userId, amount, remark);
    this.logger.log(`User ${userId} recharged: ${amount} cents`);
  }

  /**
   * 获取交易流水
   */
  async getTransactions(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const skip = (page - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      this.billingRepo.getTransactions(userId, {
        skip,
        take: pageSize,
      }),
      this.billingRepo.countTransactions(userId),
    ]);

    return {
      items: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balanceAfter: tx.balance_after,
        orderId: tx.order_id,
        remark: tx.remark,
        createdAt: tx.created_at,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
