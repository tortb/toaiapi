import { BalanceService } from './balance.service';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
/**
 * 充值请求 DTO
 */
declare class RechargeDto {
    readonly amount: number;
    readonly remark?: string;
}
/**
 * 余额控制器
 *
 * 提供余额查询、充值、交易流水查询等接口。
 */
export declare class BalanceController {
    private readonly balanceService;
    constructor(balanceService: BalanceService);
    /**
     * 查询当前用户余额
     */
    getBalance(user: CurrentUserInfo): Promise<{
        amount: number;
        frozen: number;
        available: number;
    }>;
    /**
     * 充值余额（管理员）
     */
    recharge(user: CurrentUserInfo, dto: RechargeDto): Promise<{
        amount: number;
        frozen: number;
        available: number;
    }>;
    /**
     * 获取交易流水
     */
    getTransactions(user: CurrentUserInfo, pagination: PaginationDto): Promise<{
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
    getRequestLogs(user: CurrentUserInfo, pagination: PaginationDto): Promise<{
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
export {};
//# sourceMappingURL=balance.controller.d.ts.map