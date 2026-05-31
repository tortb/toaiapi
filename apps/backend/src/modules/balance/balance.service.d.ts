import { BillingService } from '../billing/billing.service';
import { RequestLogService } from '../request-log/request-log.service';
/**
 * 余额业务服务
 *
 * 提供余额查询、充值、交易流水查询等功能。
 * 作为 BillingService 的上层封装，提供用户友好的接口。
 */
export declare class BalanceService {
    private readonly billingService;
    private readonly requestLogService;
    private readonly logger;
    constructor(billingService: BillingService, requestLogService: RequestLogService);
    /**
     * 获取用户余额
     */
    getBalance(userId: string): Promise<{
        amount: number;
        frozen: number;
        available: number;
    }>;
    /**
     * 充值余额
     */
    recharge(userId: string, amount: number, remark?: string): Promise<{
        amount: number;
        frozen: number;
        available: number;
    }>;
    /**
     * 获取交易流水
     */
    getTransactions(userId: string, page: number, pageSize: number): Promise<{
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
    /**
     * 获取请求日志
     */
    getRequestLogs(userId: string, page: number, pageSize: number): Promise<{
        items: {
            id: string;
            modelId: string;
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
            cost: number;
            statusCode: number;
            latencyMs: number;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=balance.service.d.ts.map