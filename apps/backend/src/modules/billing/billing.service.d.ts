import { BillingRepository } from './billing.repository';
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
export declare class BillingService {
    private readonly billingRepo;
    private readonly logger;
    constructor(billingRepo: BillingRepository);
    /**
     * 创建用户余额
     *
     * 用户注册时调用，初始余额为 0。
     */
    createBalance(userId: string): Promise<void>;
    /**
     * 获取用户余额
     *
     * @param userId - 用户 ID
     * @returns 余额信息（分）
     * @throws {NotFoundException} 余额不存在
     */
    getBalance(userId: string): Promise<{
        amount: number;
        frozen: number;
        available: number;
    }>;
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
    processUsage(userId: string, apiKeyId: string, channelId: string, modelName: string, usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }): Promise<number>;
    /**
     * 充值余额
     *
     * @param userId - 用户 ID
     * @param amount - 充值金额（分）
     * @param remark - 备注
     */
    recharge(userId: string, amount: number, remark?: string): Promise<void>;
    /**
     * 获取交易流水
     */
    getTransactions(userId: string, page?: number, pageSize?: number): Promise<{
        items: {
            id: string;
            type: import("@prisma/client").$Enums.TransactionType;
            amount: number;
            balanceAfter: number;
            orderId: string | null;
            remark: string | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=billing.service.d.ts.map