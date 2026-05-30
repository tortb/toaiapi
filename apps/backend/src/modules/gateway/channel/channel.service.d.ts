import { ChannelRepository } from './channel.repository';
import { ProviderAdapter } from '../providers/provider-adapter.interface';
/**
 * 渠道选择结果
 */
export interface ChannelSelectionResult {
    readonly channelId: string;
    readonly providerName: string;
    readonly baseUrl: string;
    readonly apiKey: string;
    readonly adapter: ProviderAdapter;
}
/**
 * 渠道业务服务
 *
 * 负责渠道选择、故障转移、Provider 适配器管理。
 *
 * 选择策略：优先级 + 权重
 * 1. 按优先级降序排列
 * 2. 在最高优先级中按权重随机选择
 * 3. 失败时自动尝试下一个渠道
 */
export declare class ChannelService {
    private readonly channelRepo;
    private readonly logger;
    constructor(channelRepo: ChannelRepository);
    /**
     * 选择渠道并创建适配器
     *
     * @param modelName - 模型名称
     * @returns 渠道选择结果
     * @throws {NotFoundException} 没有可用渠道
     */
    selectChannel(modelName: string): Promise<ChannelSelectionResult>;
    /**
     * 选择渠道（带故障转移）
     *
     * @param modelName - 模型名称
     * @returns 渠道选择结果列表（用于故障转移）
     */
    selectChannelsWithFallback(modelName: string): Promise<ChannelSelectionResult[]>;
    /**
     * 更新渠道统计
     */
    updateChannelStats(channelId: string, latencyMs: number, success: boolean): Promise<void>;
    /**
     * 标记渠道错误
     */
    markChannelError(channelId: string): Promise<void>;
    /**
     * 获取可用模型列表
     */
    getAvailableModels(): Promise<({
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
    /**
     * 按权重随机选择
     */
    private selectByWeight;
}
//# sourceMappingURL=channel.service.d.ts.map