import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiOkResponse,
} from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { ChannelService } from './channel/channel.service';
import { ChatCompletionDto, ChatCompletionResponseDto, ModelListResponseDto } from './dto/chat-completion.dto';
import { ApiKeyAuthGuard } from '../../common/guards/api-key-auth.guard';
import { ApiKey } from '../../common/decorators/api-key.decorator';
import type { ApiKeyInfo } from '../../common/decorators/api-key.decorator';
import { ChatRequest } from './providers/provider-adapter.interface';

/**
 * 网关控制器
 *
 * 提供 OpenAI 兼容的 API 端点。
 * 支持两种认证方式：
 * 1. X-API-Key 头
 * 2. Authorization: Bearer sk-toai-xxx
 */
@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly channelService: ChannelService,
  ) {}

  /**
   * OpenAI 兼容的聊天补全接口
   *
   * POST /v1/chat/completions
   *
   * 支持同步和流式两种模式。
   */
  @Post('v1/chat/completions')
  @UseGuards(ApiKeyAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: '聊天补全',
    description: 'OpenAI 兼容的聊天补全接口，支持同步和流式输出',
  })
  @ApiOkResponse({ type: ChatCompletionResponseDto })
  async chatCompletions(
    @Body() dto: ChatCompletionDto,
    @ApiKey() apiKey: ApiKeyInfo,
    @Req() request: Record<string, unknown>,
    @Res() reply: Record<string, unknown>,
  ): Promise<void> {
    // 构建内部请求格式
    const chatRequest: ChatRequest = {
      model: dto.model,
      messages: dto.messages.map((m) => ({
        role: m.role,
        content: m.content,
        tool_call_id: m.tool_call_id,
      })),
      temperature: dto.temperature,
      max_tokens: dto.max_tokens,
      top_p: dto.top_p,
      stream: dto.stream,
      tools: dto.tools,
      tool_choice: dto.tool_choice,
      stop: dto.stop,
      frequency_penalty: dto.frequency_penalty,
      presence_penalty: dto.presence_penalty,
      seed: dto.seed,
      user: dto.user,
    };

    // 流式响应
    if (dto.stream) {
      const rawReply = reply as unknown as { raw: { setHeader: (k: string, v: string) => void; write: (d: string) => void; end: () => void } };
      rawReply.raw.setHeader('Content-Type', 'text/event-stream');
      rawReply.raw.setHeader('Cache-Control', 'no-cache');
      rawReply.raw.setHeader('Connection', 'keep-alive');

      const stream = this.gatewayService.handleChatCompletionStream(
        chatRequest,
        apiKey,
        request['url'] as string,
      );

      for await (const chunk of stream) {
        rawReply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      rawReply.raw.write('data: [DONE]\n\n');
      rawReply.raw.end();
      return;
    }

    // 同步响应
    const response = await this.gatewayService.handleChatCompletion(
      chatRequest,
      apiKey,
      request['url'] as string,
    );

    (reply as unknown as { send: (data: unknown) => void }).send(response);
  }

  /**
   * 获取可用模型列表
   *
   * GET /v1/models
   */
  @Get('v1/models')
  @UseGuards(ApiKeyAuthGuard)
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: '获取模型列表',
    description: '获取当前 API Key 可用的模型列表',
  })
  @ApiOkResponse({ type: ModelListResponseDto })
  async listModels(): Promise<ModelListResponseDto> {
    const models = await this.channelService.getAvailableModels();

    return {
      object: 'list',
      data: models.map((model) => ({
        id: model.name,
        object: 'model',
        created: Math.floor(model.created_at.getTime() / 1000),
        owned_by: model.provider_id,
      })),
    };
  }
}
