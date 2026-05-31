import { Prisma, UserBalance, UserTransaction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
/**
 * 计费数据访问层
 *
 * 封装余额和交易流水相关的数据库操作。
 * 余额操作必须使用事务保证原子性。
 */
export declare class BillingRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    /**
     * 创建用户余额
     */
    createBalance(userId: string, initialAmount?: number): Promise<UserBalance>;
    /**
     * 获取用户余额
     */
    getBalance(userId: string): Promise<UserBalance | null>;
    /**
     * 扣减余额（事务）
     *
     * 保证扣余额和写流水的原子性。
     *
     * @param userId - 用户 ID
     * @param amount - 扣减金额（分）
     * @param orderId - 关联订单 ID（可选）
     * @param remark - 备注
     * @returns 交易记录
     * @throws {Error} 余额不足
     */
    deductBalance(userId: string, amount: number, orderId?: string, remark?: string): Promise<UserTransaction>;
    /**
     * 充值余额（事务）
     *
     * @param userId - 用户 ID
     * @param amount - 充值金额（分）
     * @param remark - 备注
     * @returns 交易记录
     */
    rechargeBalance(userId: string, amount: number, remark?: string): Promise<UserTransaction>;
    /**
     * 获取用户交易流水
     */
    getTransactions(userId: string, params: {
        skip?: number;
        take?: number;
        orderBy?: Prisma.UserTransactionOrderByWithRelationInput;
    }): Promise<UserTransaction[]>;
    /**
     * 统计用户交易数量
     */
    countTransactions(userId: string): Promise<number>;
    /**
     * 获取模型定价
     */
    getModelPricing(modelName: string): Promise<({
        model: {
            id: string;
            display_name: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            is_active: boolean;
            provider_id: string;
            max_context: number;
            supports_streaming: boolean;
            supports_tools: boolean;
            supports_vision: boolean;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        model_id: string;
        input_price: number;
        output_price: number;
        cached_price: number | null;
        reasoning_price: number | null;
        multiplier: Prisma.Decimal;
    }) | null>;
}
//# sourceMappingURL=billing.repository.d.ts.map