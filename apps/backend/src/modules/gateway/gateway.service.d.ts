import { ChannelService } from './channel/channel.service';
import { BillingService } from '../billing/billing.service';
import { RequestLogService } from '../request-log/request-log.service';
import { ApiKeyInfo } from '../../common/decorators/api-key.decorator';
import { ChatRequest, ChatResponse, ChatChunk } from './providers/provider-adapter.interface';
/**
 * 网关业务服务
 *
 * 核心职责：
 * 1. 接收 OpenAI 兼容请求
 * 2. 选择渠道和 provider
 * 3. 转发请求并获取响应
 * 4. 计算 token 使用和费用
 * 5. 扣减用户余额
 * 6. 记录请求日志
 * 7. 处理故障转移
 *
 * 计费流程（严格遵循 billing-rules.md）：
 * - NEVER 信任 provider 返回的 token 数
 * - 使用 Tokenizer 重新计算
 * - 所有金额单位：分
 * - 所有费用计算使用 Math.ceil
 * - 余额扣减使用数据库事务
 */
export declare class GatewayService {
    private readonly channelService;
    private readonly billingService;
    private readonly requestLogService;
    private readonly logger;
    /** 最大重试次数 */
    private readonly MAX_RETRIES;
    constructor(channelService: ChannelService, billingService: BillingService, requestLogService: RequestLogService);
    /**
     * 处理聊天补全请求
     *
     * @param request - 聊天请求
     * @param apiKey - API Key 信息
     * @param requestPath - 请求路径
     * @returns 聊天响应
     */
    handleChatCompletion(request: ChatRequest, apiKey: ApiKeyInfo, requestPath: string): Promise<ChatResponse>;
    /**
     * 处理流式聊天补全请求
     *
     * @param request - 聊天请求
     * @param apiKey - API Key 信息
     * @param requestPath - 请求路径
     * @returns 流式响应生成器
     */
    handleChatCompletionStream(request: ChatRequest, apiKey: ApiKeyInfo, requestPath: string): AsyncGenerator<ChatChunk>;
}
//# sourceMappingURL=gateway.service.d.ts.map