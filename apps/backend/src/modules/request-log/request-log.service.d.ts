import { PrismaService } from '../../prisma/prisma.service';
/**
 * 请求日志记录参数
 */
export interface RequestLogParams {
    readonly userId: string;
    readonly apiKeyId: string;
    readonly modelId: string;
    readonly channelId: string;
    readonly requestPath: string;
    readonly requestMethod: string;
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly cachedTokens?: number;
    readonly reasoningTokens?: number;
    readonly totalTokens: number;
    readonly cost: number;
    readonly statusCode: number;
    readonly latencyMs: number;
}
/**
 * 请求日志业务服务
 *
 * 记录所有 API 请求的详细信息，用于计费审计和使用统计。
 */
export declare class RequestLogService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * 记录请求日志
     */
    logRequest(params: RequestLogParams): Promise<void>;
    /**
     * 获取用户请求日志
     */
    getUserLogs(userId: string, page?: number, pageSize?: number): Promise<{
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
//# sourceMappingURL=request-log.service.d.ts.map