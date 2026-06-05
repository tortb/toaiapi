import {
  Injectable,
  NotFoundException,
  HttpException,
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
 * 3. 扣减余额（数据库事务保证原子性）
 * 4. 记录交易流水
 *
 * 关键规则（严格遵循）：
 * - NEVER 信任 provider 返回的 token 数（当前直接使用，未来需集成 Tokenizer）
 * - 所有金额单位：分（fen）
 * - 所有费用计算使用 Math.ceil
 * - 余额扣减使用数据库事务
 * - 无定价模型的调用必须拒绝
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly billingRepo: BillingRepository) {}

  /**
   * 创建用户余额
   *
   * 用户注册时调用，初始余额为 0。
   * 幂等操作：已存在时不重复创建。
   *
   * @param userId - 用户 ID
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
   * @returns 余额信息（分）：amount(总额), frozen(冻结), available(可用)
   * @throws 余额不存在
   */
  async getBalance(userId: string): Promise<{
    amount: number;
    frozen: number;
    available: number;
  }> {
    const balance = await this.billingRepo.getBalance(userId);

    if (!balance) {
      throw new NotFoundException('用户余额不存在');
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
   * 计算费用并扣减余额。使用数据库事务保证原子性。
   * SECURITY: 无定价模型时拒绝服务，防止免费使用
   * SECURITY: 校验 token 数量，拒绝异常值
   *
   * @param userId - 用户 ID
   * @param apiKeyId - API Key ID
   * @param channelId - 渠道 ID
   * @param modelName - 模型名称
   * @param usage - Token 使用统计
   * @returns 费用（分）
   * @throws 模型无定价或余额不足
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
      cached_tokens?: number;
      reasoning_tokens?: number;
    },
  ): Promise<number> {
    // SECURITY: 校验 token 数量
    if (usage.prompt_tokens < 0 || usage.completion_tokens < 0 || usage.total_tokens < 0) {
      this.logger.error(`Invalid token counts for user ${userId}: ${JSON.stringify(usage)}`);
      throw new HttpException('Token 数量无效', 400);
    }

    if (usage.total_tokens === 0 && (usage.prompt_tokens > 0 || usage.completion_tokens > 0)) {
      this.logger.warn(`Token count mismatch for user ${userId}: total=0 but prompt/completion > 0`);
    }

    // 1. 获取模型定价
    const pricing = await this.billingRepo.getModelPricing(modelName);

    // SECURITY: 无定价模型时拒绝服务，防止免费使用
    if (!pricing) {
      this.logger.error(`No pricing configured for model: ${modelName}`);
      throw new HttpException(`模型 ${modelName} 未配置定价，无法计费`, 402);
    }

    // 2. 计算费用（使用 @toai/billing 包）
    const tokenUsage: TokenUsage = {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      cachedTokens: usage.cached_tokens ?? 0,
      reasoningTokens: usage.reasoning_tokens ?? 0,
      totalTokens: usage.total_tokens,
    };

    const result = calculateCost(tokenUsage, {
      inputPrice: pricing.input_price,
      outputPrice: pricing.output_price,
      cachedPrice: pricing.cached_price ?? 0,
      reasoningPrice: pricing.reasoning_price ?? 0,
      multiplier: Number(pricing.multiplier),
    });

    const cost = result.cost;

    if (cost <= 0) {
      return 0;
    }

    // 3. 扣减余额（数据库事务保证原子性）
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
   * SECURITY: 校验金额必须为正数
   *
   * @param userId - 用户 ID
   * @param amount - 充值金额（分），必须大于 0
   * @param remark - 备注
   * @throws 金额不是正数
   */
  async recharge(
    userId: string,
    amount: number,
    remark?: string,
  ): Promise<void> {
    // SECURITY: 校验金额
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new HttpException('充值金额必须为正整数', 400);
    }

    await this.billingRepo.rechargeBalance(userId, amount, remark);
    this.logger.log(`User ${userId} recharged: ${amount} cents`);
  }

  /**
   * 获取交易流水
   *
   * @param userId - 用户 ID
   * @param page - 页码（从 1 开始）
   * @param pageSize - 每页数量（1-100）
   * @param filters - 可选过滤条件
   * @returns 分页交易记录
   */
  async getTransactions(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      type?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    // 校验分页参数
    const validPage = Math.max(1, Math.floor(page));
    const validPageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const skip = (validPage - 1) * validPageSize;

    // 构建过滤条件
    const where: Record<string, unknown> = { user_id: userId };
    if (filters?.type) {
      where['type'] = filters.type;
    }
    if (filters?.startDate || filters?.endDate) {
      where['created_at'] = {};
      if (filters.startDate) {
        (where['created_at'] as Record<string, unknown>)['gte'] = filters.startDate;
      }
      if (filters.endDate) {
        (where['created_at'] as Record<string, unknown>)['lte'] = filters.endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      this.billingRepo.getTransactions(userId, {
        skip,
        take: validPageSize,
        where,
      }),
      this.billingRepo.countTransactions(userId, where),
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
      page: validPage,
      pageSize: validPageSize,
      totalPages: Math.ceil(total / validPageSize),
    };
  }
}
