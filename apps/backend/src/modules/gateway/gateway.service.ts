import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ChannelService, ChannelSelectionResult } from './channel/channel.service';
import { BillingService } from '../billing/billing.service';
import { RequestLogService } from '../request-log/request-log.service';
import { ApiKeyInfo } from '../../common/decorators/api-key.decorator';
import {
  ChatRequest,
  ChatResponse,
  ChatChunk,
} from './providers/provider-adapter.interface';

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
 * 计费流程：
 * - NEVER 信任 provider 返回的 token 数
 * - 流式响应中 provider 未返回 usage 时，使用字符数估算 token 数
 * - 所有金额单位：分
 * - 所有费用计算使用 Math.ceil
 * - 余额扣减使用数据库事务
 */
@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  /** 最大重试次数 */
  private readonly MAX_RETRIES = 2;

  constructor(
    private readonly channelService: ChannelService,
    private readonly billingService: BillingService,
    private readonly requestLogService: RequestLogService,
  ) {}

  /**
   * 处理聊天补全请求（同步模式）
   *
   * 流程：校验模型权限 → 选择渠道 → 调用 Provider → 计费 → 记录日志
   * 支持故障转移：最多重试 MAX_RETRIES 次
   *
   * @param request - 聊天请求
   * @param apiKey - API Key 信息
   * @param requestPath - 请求路径
   * @returns 聊天响应
   * @throws ForbiddenException 模型不在白名单
   * @throws Error 所有渠道都失败
   */
  async handleChatCompletion(
    request: ChatRequest,
    apiKey: ApiKeyInfo,
    requestPath: string,
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    // 检查模型限制
    this.checkModelLimit(apiKey, request.model);

    // 获取可用渠道（带故障转移）
    const channels = await this.channelService.selectChannelsWithFallback(
      request.model,
    );

    let lastError: Error | null = null;

    // 尝试每个渠道
    for (let i = 0; i < Math.min(channels.length, this.MAX_RETRIES + 1); i++) {
      const channel = channels[i];
      if (!channel) continue;

      try {
        // 调用 provider
        const response = await channel.adapter.chat(request);

        // 计算延迟
        const latencyMs = Date.now() - startTime;

        // 更新渠道统计（成功）
        await this.channelService.updateChannelStats(
          channel.channelId,
          latencyMs,
          true,
        );

        // 计算费用并扣减余额
        const cost = await this.billingService.processUsage(
          apiKey.userId,
          apiKey.id,
          channel.channelId,
          request.model,
          response.usage,
        );

        // 记录请求日志
        await this.requestLogService.logRequest({
          userId: apiKey.userId,
          apiKeyId: apiKey.id,
          modelId: request.model,
          channelId: channel.channelId,
          requestPath,
          requestMethod: 'POST',
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
          cost,
          statusCode: 200,
          latencyMs,
        });

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Channel ${channel.channelId} failed: ${lastError.message}`,
        );

        // 更新渠道统计（失败）
        await this.channelService.updateChannelStats(
          channel.channelId,
          Date.now() - startTime,
          false,
        );

        // 如果是最后一个渠道，抛出错误
        if (i === channels.length - 1) {
          break;
        }
      }
    }

    // 所有渠道都失败
    throw lastError || new Error('All channels failed');
  }

  /**
   * 处理流式聊天补全请求
   *
   * 流程：校验模型权限 → 选择渠道 → 流式调用 → 计费 → 记录日志
   * SECURITY: 当 Provider 未返回 usage 时，使用字符数估算 token 数，防止免费使用
   *
   * @param request - 聊天请求
   * @param apiKey - API Key 信息
   * @param requestPath - 请求路径
   * @returns 流式响应生成器
   * @throws ForbiddenException 模型不在白名单
   */
  async *handleChatCompletionStream(
    request: ChatRequest,
    apiKey: ApiKeyInfo,
    requestPath: string,
  ): AsyncGenerator<ChatChunk> {
    const startTime = Date.now();

    // 检查模型限制
    this.checkModelLimit(apiKey, request.model);

    // 选择渠道
    const channel = await this.channelService.selectChannel(request.model);

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    let responseContent = '';

    try {
      // 流式调用 provider
      const stream = channel.adapter.chatStream(request);

      for await (const chunk of stream) {
        // 提取 usage 信息（如果 provider 返回）
        if (chunk.usage) {
          totalPromptTokens = chunk.usage.prompt_tokens;
          totalCompletionTokens = chunk.usage.completion_tokens;
          totalTokens = chunk.usage.total_tokens;
        }

        // 收集响应内容用于 token 估算
        if (chunk.choices?.[0]?.delta?.content) {
          responseContent += chunk.choices[0].delta.content;
        }

        yield chunk;
      }

      // 计算延迟
      const latencyMs = Date.now() - startTime;

      // 更新渠道统计（成功）
      await this.channelService.updateChannelStats(
        channel.channelId,
        latencyMs,
        true,
      );

      // SECURITY: 当 Provider 未返回 usage 时，使用字符数估算 token 数
      // 估算公式：中文约 1.5 token/字，英文约 0.75 token/word（4 字符）
      // 简化为：总字符数 / 2 作为粗略估算
      if (totalTokens === 0) {
        const estimatedPromptTokens = this.estimateTokens(request.messages.map(m => m.content).join(''));
        const estimatedCompletionTokens = this.estimateTokens(responseContent);
        totalPromptTokens = estimatedPromptTokens;
        totalCompletionTokens = estimatedCompletionTokens;
        totalTokens = estimatedPromptTokens + estimatedCompletionTokens;

        this.logger.warn(
          `Provider 未返回 usage，使用估算值: prompt=${estimatedPromptTokens}, completion=${estimatedCompletionTokens}`,
        );
      }

      // 计算费用并扣减余额
      const cost = await this.billingService.processUsage(
        apiKey.userId,
        apiKey.id,
        channel.channelId,
        request.model,
        {
          prompt_tokens: totalPromptTokens,
          completion_tokens: totalCompletionTokens,
          total_tokens: totalTokens,
        },
      );

      // 记录请求日志
      await this.requestLogService.logRequest({
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        modelId: request.model,
        channelId: channel.channelId,
        requestPath,
        requestMethod: 'POST',
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        totalTokens,
        cost,
        statusCode: 200,
        latencyMs,
      });
    } catch (error) {
      // 更新渠道统计（失败）
      await this.channelService.updateChannelStats(
        channel.channelId,
        Date.now() - startTime,
        false,
      );

      // SECURITY: 流式失败也记录请求日志（审计不可缺失）
      await this.requestLogService.logRequest({
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        modelId: request.model,
        channelId: channel.channelId,
        requestPath,
        requestMethod: 'POST',
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        totalTokens,
        cost: 0,
        statusCode: 500,
        latencyMs: Date.now() - startTime,
      }).catch(logError => {
        this.logger.error(`Failed to log stream error: ${logError}`);
      });

      throw error;
    }
  }

  /**
   * 检查模型是否在 API Key 的白名单中
   *
   * @param apiKey - API Key 信息
   * @param model - 请求的模型名称
   * @throws ForbiddenException 模型不在白名单
   */
  private checkModelLimit(apiKey: ApiKeyInfo, model: string): void {
    if (
      apiKey.modelLimit.length > 0 &&
      !apiKey.modelLimit.includes(model)
    ) {
      throw new ForbiddenException(
        `模型 ${model} 不在此 API Key 的允许列表中`,
      );
    }
  }

  /**
   * 估算文本的 Token 数量
   * 粗略估算：中文约 1.5 token/字，英文约 0.25 token/字符
   * 简化为：总字符数 / 2
   *
   * @param text - 文本内容
   * @returns 估算的 token 数量
   */
  private estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 2);
  }
}
