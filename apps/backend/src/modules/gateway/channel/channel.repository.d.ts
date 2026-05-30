import { PrismaService } from '../../../prisma/prisma.service';
/**
 * 渠道数据访问层
 *
 * 封装 Channel、Provider、Model 相关的数据库操作。
 */
export declare class ChannelRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    /**
     * 根据模型名称查找可用渠道
     *
     * @param modelName - 模型名称
     * @returns 可用渠道列表（按优先级降序、权重降序排列）
     */
    findAvailableChannels(modelName: string): Promise<({
        model: {
            pricing: {
                id: string;
                created_at: Date;
                updated_at: Date;
                model_id: string;
                input_price: number;
                output_price: number;
                cached_price: number | null;
                reasoning_price: number | null;
                multiplier: import("@prisma/client/runtime/library").Decimal;
            } | null;
        } & {
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
        channel: {
            provider: {
                id: string;
                display_name: string;
                created_at: Date;
                updated_at: Date;
                name: string;
                base_url: string;
                is_active: boolean;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ChannelStatus;
            created_at: Date;
            updated_at: Date;
            name: string;
            base_url: string;
            is_active: boolean;
            provider_id: string;
            api_key: string;
            weight: number;
            priority: number;
            total_requests: number;
            failed_requests: number;
            avg_latency_ms: number;
            rate_limit: number | null;
            token_limit: number | null;
        };
    } & {
        id: string;
        is_active: boolean;
        channel_id: string;
        model_id: string;
        alias: string | null;
    })[]>;
    /**
     * 更新渠道统计
     *
     * @param channelId - 渠道 ID
     * @param latencyMs - 延迟（毫秒）
     * @param success - 是否成功
     */
    updateChannelStats(channelId: string, latencyMs: number, success: boolean): Promise<void>;
    /**
     * 标记渠道为错误状态
     */
    markChannelError(channelId: string): Promise<void>;
    /**
     * 标记渠道为限流状态
     */
    markChannelRateLimited(channelId: string): Promise<void>;
    /**
     * 恢复渠道状态
     */
    restoreChannel(channelId: string): Promise<void>;
    /**
     * 获取渠道详情
     */
    findById(channelId: string): Promise<({
        provider: {
            id: string;
            display_name: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            base_url: string;
            is_active: boolean;
        };
        models: ({
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
            is_active: boolean;
            channel_id: string;
            model_id: string;
            alias: string | null;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ChannelStatus;
        created_at: Date;
        updated_at: Date;
        name: string;
        base_url: string;
        is_active: boolean;
        provider_id: string;
        api_key: string;
        weight: number;
        priority: number;
        total_requests: number;
        failed_requests: number;
        avg_latency_ms: number;
        rate_limit: number | null;
        token_limit: number | null;
    }) | null>;
    /**
     * 获取所有可用模型
     */
    findAvailableModels(): Promise<({
        pricing: {
            id: string;
            created_at: Date;
            updated_at: Date;
            model_id: string;
            input_price: number;
            output_price: number;
            cached_price: number | null;
            reasoning_price: number | null;
            multiplier: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
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
    })[]>;
}
//# sourceMappingURL=channel.repository.d.ts.map