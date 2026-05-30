import { GatewayService } from './gateway.service';
import { ChannelService } from './channel/channel.service';
import { ChatCompletionDto, ModelListResponseDto } from './dto/chat-completion.dto';
import type { ApiKeyInfo } from '../../common/decorators/api-key.decorator';
/**
 * 网关控制器
 *
 * 提供 OpenAI 兼容的 API 端点。
 * 支持两种认证方式：
 * 1. X-API-Key 头
 * 2. Authorization: Bearer sk-toai-xxx
 */
export declare class GatewayController {
    private readonly gatewayService;
    private readonly channelService;
    constructor(gatewayService: GatewayService, channelService: ChannelService);
    /**
     * OpenAI 兼容的聊天补全接口
     *
     * POST /v1/chat/completions
     *
     * 支持同步和流式两种模式。
     */
    chatCompletions(dto: ChatCompletionDto, apiKey: ApiKeyInfo, request: Record<string, unknown>, reply: Record<string, unknown>): Promise<void>;
    /**
     * 获取可用模型列表
     *
     * GET /v1/models
     */
    listModels(): Promise<ModelListResponseDto>;
}
//# sourceMappingURL=gateway.controller.d.ts.map