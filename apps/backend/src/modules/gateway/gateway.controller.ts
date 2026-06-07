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
  Logger,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiOkResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { ChannelService } from './channel/channel.service';
import { ChatCompletionDto, ChatCompletionResponseDto, ModelListResponseDto } from './dto/chat-completion.dto';
import { CreateAnthropicMessageDto } from './dto/anthropic-message.dto';
import { ApiKeyAuthGuard } from '../../common/guards/api-key-auth.guard';
import { ApiKey } from '../../common/decorators/api-key.decorator';
import type { ApiKeyInfo } from '../../common/decorators/api-key.decorator';
import { ChatRequest, ChatChunk } from './providers/provider-adapter.interface';
import { RedisService } from '../../redis/redis.service';

/**
 * Fastify 请求/响应接口
 */
interface FastifyRequest {
  url: string;
  requestId?: string;
  raw: {
    on(event: string, listener: (...args: unknown[]) => void): void;
  };
}

interface FastifyReply {
  raw: {
    setHeader(name: string, value: string): void;
    write(chunk: string): boolean;
    end(): void;
    on(event: string, listener: (...args: unknown[]) => void): void;
  };
  send(data: unknown): void;
}

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
  private readonly logger = new Logger(GatewayController.name);

  constructor(
    private readonly gatewayService: GatewayService,
    private readonly channelService: ChannelService,
    private readonly redis: RedisService,
  ) {}

  /**
   * OpenAI 兼容的聊天补全接口
   *
   * POST /v1/chat/completions
   *
   * 支持同步和流式两种模式。
   * SECURITY: 流式模式下捕获所有错误，确保发送 [DONE] 标记
   */
  @Post('chat/completions')
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
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    // 构建内部请求格式
    const chatRequest: ChatRequest = {
      model: dto.model,
      messages: dto.messages.map((m) => ({
        role: m.role,
        content: m.content ?? '',
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
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      // SECURITY: 监听客户端断开连接
      let clientDisconnected = false;
      const markClientDisconnected = () => {
        clientDisconnected = true;
      };
      request.raw.on('close', markClientDisconnected);
      request.raw.on('aborted', markClientDisconnected);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let stream: AsyncGenerator<ChatChunk, void, unknown> | null = null;
      try {
        stream = this.gatewayService.handleChatCompletionStream(
          chatRequest,
          apiKey,
          request.url,
        );

        for await (const chunk of stream) {
          // SECURITY: 客户端已断开则停止写入
          if (clientDisconnected) {
            this.logger.warn('Client disconnected during stream, stopping');
            // SECURITY: 必须调用 .return() 触发 generator 的 finally 块执行计费
            await stream.return(undefined as never);
            stream = null;
            break;
          }

          try {
            reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
          } catch (writeError) {
            this.logger.warn(`SSE write error: ${writeError}`);
            // 写入失败，触发 generator cleanup
            await stream.return(undefined as never);
            stream = null;
            break;
          }
        }

        // SECURITY: 确保发送 [DONE] 标记
        if (!clientDisconnected) {
          try {
            reply.raw.write('data: [DONE]\n\n');
            reply.raw.end();
          } catch (endError) {
            this.logger.warn(`SSE end error: ${endError}`);
          }
        }
      } catch (streamError) {
        // SECURITY: 流式处理出错时，发送错误信息并确保 [DONE]
        this.logger.error(`Stream error: ${streamError}`);
        if (!clientDisconnected) {
          try {
            const errorChunk = {
              error: {
                message: streamError instanceof Error ? streamError.message : 'Stream processing error',
                type: 'server_error',
                code: 'server_error',
              },
            };
            reply.raw.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
            reply.raw.write('data: [DONE]\n\n');
            reply.raw.end();
          } catch {
            // 客户端可能已断开，忽略写入错误
          }
        }
      }
      return;
    }

    // 同步响应
    const response = await this.gatewayService.handleChatCompletion(
      chatRequest,
      apiKey,
      request.url,
    );

    reply.send(response);
  }

  /**
   * 获取可用模型列表
   *
   * GET /v1/models
   */
  @Get('models')
  @UseGuards(ApiKeyAuthGuard)
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: '获取模型列表',
    description: '获取当前 API Key 可用的模型列表',
  })
  @ApiOkResponse({ type: ModelListResponseDto })
  async listModels(): Promise<ModelListResponseDto> {
    // 缓存模型列表 30 秒，减少数据库压力
    const cacheKey = 'gateway:models:list';
    const cached = await this.redis.getJson<ModelListResponseDto>(cacheKey);
    if (cached) return cached;

    const models = await this.channelService.getAvailableModels();

    const result: ModelListResponseDto = {
      object: 'list',
      data: models.map((model) => ({
        id: model.name,
        object: 'model',
        created: Math.floor(model.created_at.getTime() / 1000),
        owned_by: model.provider_id,
      })),
    };

    await this.redis.setJson(cacheKey, result, 30);
    return result;
  }

  /**
   * 公开模型列表（营销页面用，无需认证）
   *
   * GET /v1/models/public
   * 返回模型名、定价、能力等公开信息。
   */
  @Get('models/public')
  @ApiOperation({
    summary: '公开模型列表',
    description: '获取所有可用模型的公开信息（含定价和能力），无需认证',
  })
  @ApiOkResponse()
  async listPublicModels() {
    // 缓存公开模型列表 60 秒
    const cacheKey = 'gateway:models:public';
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const models = await this.channelService.getAvailableModels();

    const result = {
      data: models.map((model) => ({
        id: model.name,
        displayName: model.display_name,
        providerId: model.provider_id,
        maxContext: model.max_context,
        supportsStreaming: model.supports_streaming,
        supportsTools: model.supports_tools,
        supportsVision: model.supports_vision,
        pricing: model.pricing
          ? {
              inputPrice: model.pricing.input_price,
              outputPrice: model.pricing.output_price,
              cachedPrice: model.pricing.cached_price,
              reasoningPrice: model.pricing.reasoning_price,
              multiplier: Number(model.pricing.multiplier),
            }
          : null,
      })),
    };

    await this.redis.setJson(cacheKey, result, 60);
    return result;
  }

  /**
   * 公开渠道状态（服务状态页用，无需认证）
   *
   * GET /v1/status
   * 返回所有活跃渠道的运行状态。
   */
  @Get('status')
  @ApiOperation({
    summary: '服务状态',
    description: '获取所有活跃渠道的运行状态，无需认证',
  })
  @ApiOkResponse()
  async getServiceStatus() {
    const channels = await this.channelService.getChannelStats();

    return {
      data: channels.map((ch) => ({
        provider: ch.provider.display_name || ch.provider.name,
        channel: ch.name,
        status: ch.status,
        avgLatencyMs: ch.avg_latency_ms,
        totalRequests: ch.total_requests,
        failedRequests: ch.failed_requests,
        failureRate: ch.total_requests > 0
          ? Number(((ch.failed_requests / ch.total_requests) * 100).toFixed(2))
          : 0,
      })),
    };
  }

  /**
   * Anthropic Messages API 端点
   *
   * POST /v1/anthropic
   *
   * 支持 Anthropic 原生格式，适配 Claude Code、Anthropic SDK 等客户端。
   * 认证方式：x-api-key header
   */
  @Post('anthropic')
  @UseGuards(ApiKeyAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('api-key')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key (支持 x-api-key 或 Authorization: Bearer)',
    required: true,
  })
  @ApiHeader({
    name: 'anthropic-version',
    description: 'Anthropic API 版本',
    required: false,
    schema: { default: '2023-06-01' },
  })
  @ApiOperation({
    summary: 'Anthropic Messages API',
    description: '创建 Anthropic 格式的消息，支持流式和非流式输出',
  })
  @ApiOkResponse({ description: 'Anthropic 格式响应' })
  async createAnthropicMessage(
    @Body() dto: CreateAnthropicMessageDto,
    @ApiKey() apiKey: ApiKeyInfo,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Headers('anthropic-version') anthropicVersion?: string,
  ): Promise<void> {
    this.logger.log(`Anthropic Messages API: model=${dto.model}, stream=${dto.stream}, version=${anthropicVersion || '2023-06-01'}`);

    // 流式响应
    if (dto.stream) {
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      let clientDisconnected = false;
      reply.raw.on('close', () => {
        clientDisconnected = true;
        this.logger.debug('Client disconnected from Anthropic stream');
      });

      try {
        const result = await this.gatewayService.handleAnthropicMessage(dto, apiKey, request.url);

        // 流式响应必须是 AsyncGenerator
        if (typeof result === 'object' && Symbol.asyncIterator in result) {
          const stream = result as AsyncGenerator<{ event: string; data: unknown }>;

          for await (const event of stream) {
            if (clientDisconnected) {
              this.logger.debug('Client disconnected, stopping Anthropic stream');
              break;
            }

            // Anthropic SSE 格式: event: xxx\ndata: {...}\n\n
            reply.raw.write(`event: ${event.event}\n`);
            reply.raw.write(`data: ${JSON.stringify(event.data)}\n\n`);
          }
        }

        // 发送 message_stop 事件
        if (!clientDisconnected) {
          try {
            reply.raw.write('event: message_stop\n');
            reply.raw.write('data: {"type":"message_stop"}\n\n');
            reply.raw.end();
          } catch (endError) {
            this.logger.warn(`Anthropic SSE end error: ${endError}`);
          }
        }
      } catch (streamError) {
        this.logger.error(`Anthropic stream error: ${streamError}`);
        if (!clientDisconnected) {
          try {
            const errorEvent = {
              type: 'error',
              error: {
                type: 'api_error',
                message: streamError instanceof Error ? streamError.message : 'Stream processing error',
              },
            };
            reply.raw.write('event: error\n');
            reply.raw.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
            reply.raw.end();
          } catch {
            // 客户端已断开，忽略
          }
        }
      }
      return;
    }

    // 非流式响应
    const response = await this.gatewayService.handleAnthropicMessage(dto, apiKey, request.url);
    reply.send(response);
  }
}
