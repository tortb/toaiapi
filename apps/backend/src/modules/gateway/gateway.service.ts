import { Injectable, Logger, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { ChannelService, ChannelSelectionResult } from './channel/channel.service';
import { BillingService } from '../billing/billing.service';
import { RequestLogService } from '../request-log/request-log.service';
import { ApiKeyRepository } from '../api-key/api-key.repository';
import { ApiKeyInfo } from '../../common/decorators/api-key.decorator';
import {
  ChatRequest,
  ChatResponse,
  ChatChunk,
} from './providers/provider-adapter.interface';
import { ProviderError } from './providers/provider-error';

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
    private readonly apiKeyRepository: ApiKeyRepository,
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

        // 记录请求日志（fire-and-forget，不阻塞响应）
        this.requestLogService.logRequest({
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
        }).catch((err) => {
          this.logger.error(`Request log write failed: ${err instanceof Error ? err.message : err}`);
        });

        // 记录 API Key 使用统计（异步，不阻塞响应）
        this.apiKeyRepository.recordUsage(apiKey.id).catch((err) => {
          this.logger.error(`API key usage update failed: ${err instanceof Error ? err.message : err}`);
        });

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Channel ${channel.channelId} failed: ${lastError.message}`,
        );

        // 更新渠道统计（失败，fire-and-forget）
        this.channelService.updateChannelStats(
          channel.channelId,
          Date.now() - startTime,
          false,
        ).catch((err) => {
          this.logger.error(`Channel stats update failed: ${err instanceof Error ? err.message : err}`);
        });

        // Provider 调用失败时标记渠道状态，计费等本地错误不影响渠道。
        if (error instanceof ProviderError && error.isRateLimited) {
          this.channelService.markChannelRateLimited(channel.channelId).catch((err) => {
            this.logger.error(`Channel rate-limit mark failed: ${err instanceof Error ? err.message : err}`);
          });
        } else if (error instanceof ProviderError) {
          this.channelService.markChannelError(channel.channelId).catch((err) => {
            this.logger.error(`Channel error mark failed: ${err instanceof Error ? err.message : err}`);
          });
        }

        // 如果是最后一个渠道，抛出错误
        if (i === channels.length - 1) {
          break;
        }
      }
    }

    // 所有渠道都失败 - 保留原始 HTTP 状态码
    if (lastError instanceof ProviderError) {
      throw new HttpException(lastError.message, lastError.statusCode);
    }
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

    // 选择渠道（带故障转移）
    const channels = await this.channelService.selectChannelsWithFallback(
      request.model,
    );

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    let responseContent = '';
    let channelId = '';
    let lastError: Error | null = null;

    // SECURITY: try/finally 确保无论 generator 如何终止都执行计费和日志
    // 当 controller 中断迭代（客户端断开）时，会调用 generator.return() 触发 finally
    try {
      // 尝试每个渠道（最多 MAX_RETRIES + 1 次）
      for (let i = 0; i < Math.min(channels.length, this.MAX_RETRIES + 1); i++) {
        const channel = channels[i];
        if (!channel) continue;
        channelId = channel.channelId;

        try {
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

          // 流式正常完成，跳出重试循环
          lastError = null;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          this.logger.warn(
            `Stream channel ${channel.channelId} failed: ${lastError.message}`,
          );

          // 更新渠道统计（失败）
          await this.channelService.updateChannelStats(
            channel.channelId,
            Date.now() - startTime,
            false,
          ).catch((err) => {
            this.logger.error(`Stream channel stats update failed: ${err instanceof Error ? err.message : err}`);
          });

          // 重置计数器准备下一个渠道
          totalPromptTokens = 0;
          totalCompletionTokens = 0;
          totalTokens = 0;
          responseContent = '';
        }
      }
    } finally {
      // SECURITY: 无论流是否成功/中断/客户端断开，都必须执行计费和日志
      // 这是防止免费使用的关键防线
      this.streamCleanup({
        apiKey,
        request,
        requestPath,
        startTime,
        channelId,
        lastError,
        totalPromptTokens,
        totalCompletionTokens,
        totalTokens,
        responseContent,
      }).catch(cleanupError => {
        this.logger.error(`Stream cleanup failed: ${cleanupError}`);
      });
    }
  }

  /**
   * 流式响应清理：计费、日志、统计
   * 无论流如何终止都必须执行
   */
  private async streamCleanup(params: {
    apiKey: ApiKeyInfo;
    request: ChatRequest;
    requestPath: string;
    startTime: number;
    channelId: string;
    lastError: Error | null;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    responseContent: string;
  }): Promise<void> {
    const {
      apiKey, request, requestPath, startTime, channelId,
      lastError, totalPromptTokens, totalCompletionTokens,
      totalTokens, responseContent,
    } = params;

    const latencyMs = Date.now() - startTime;

    if (lastError) {
      // 所有渠道都失败
      await this.requestLogService.logRequest({
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        modelId: request.model,
        channelId,
        requestPath,
        requestMethod: 'POST',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        statusCode: 500,
        latencyMs,
      }).catch((err) => {
        this.logger.error(`Failed stream request log write failed: ${err instanceof Error ? err.message : err}`);
      });
      return;
    }

    // 更新渠道统计（成功）
    await this.channelService.updateChannelStats(
      channelId,
      latencyMs,
      true,
    ).catch((err) => {
      this.logger.error(`Stream channel stats update failed: ${err instanceof Error ? err.message : err}`);
    });

    // SECURITY: 当 Provider 未返回 usage 时，使用字符数估算 token 数
    let finalPromptTokens = totalPromptTokens;
    let finalCompletionTokens = totalCompletionTokens;
    let finalTotalTokens = totalTokens;

    if (finalTotalTokens === 0) {
      finalPromptTokens = this.estimateTokens(request.messages.map(m => m.content).join(''));
      finalCompletionTokens = this.estimateTokens(responseContent);
      finalTotalTokens = finalPromptTokens + finalCompletionTokens;

      this.logger.warn(
        `Provider 未返回 usage，使用估算值: prompt=${finalPromptTokens}, completion=${finalCompletionTokens}`,
      );
    }

    // 计算费用并扣减余额
    const cost = await this.billingService.processUsage(
      apiKey.userId,
      apiKey.id,
      channelId,
      request.model,
      {
        prompt_tokens: finalPromptTokens,
        completion_tokens: finalCompletionTokens,
        total_tokens: finalTotalTokens,
      },
    );

    // 记录请求日志
    await this.requestLogService.logRequest({
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
      modelId: request.model,
      channelId,
      requestPath,
      requestMethod: 'POST',
      promptTokens: finalPromptTokens,
      completionTokens: finalCompletionTokens,
      totalTokens: finalTotalTokens,
      cost,
      statusCode: 200,
      latencyMs,
    });

    // 记录 API Key 使用统计（异步，不阻塞）
    this.apiKeyRepository.recordUsage(apiKey.id).catch((err) => {
      this.logger.error(`API key usage update failed: ${err instanceof Error ? err.message : err}`);
    });
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
   *
   * 启发式估算（适用于流式响应中 Provider 未返回 usage 的场景）：
   * - CJK 字符：约 1.5 token/字
   * - ASCII 字母/数字：约 0.25 token/字符（4 字符/token）
   * - 标点/空格：约 0.5 token/字符
   *
   * @param text - 文本内容
   * @returns 估算的 token 数量
   */
  private estimateTokens(text: string): number {
    if (!text) return 0;

    let cjkCount = 0;
    let asciiCount = 0;
    let otherCount = 0;

    for (const char of text) {
      const code = char.codePointAt(0) ?? 0;
      // CJK 统一表意文字（含扩展 A/B）、兼容表意文字
      if (
        (code >= 0x4e00 && code <= 0x9fff) ||   // CJK Unified Ideographs
        (code >= 0x3400 && code <= 0x4dbf) ||   // CJK Extension A
        (code >= 0xf900 && code <= 0xfaff) ||   // CJK Compatibility Ideographs
        (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
        (code >= 0x2a700 && code <= 0x2ceaf)    // CJK Extensions C-F
      ) {
        cjkCount++;
      } else if (
        (code >= 0x3040 && code <= 0x309f) ||   // Hiragana
        (code >= 0x30a0 && code <= 0x30ff) ||   // Katakana
        (code >= 0xac00 && code <= 0xd7af) ||   // Hangul Syllables
        (code >= 0x1100 && code <= 0x11ff) ||   // Hangul Jamo
        (code >= 0xff00 && code <= 0xffef)      // Fullwidth Forms
      ) {
        // CJK 邻近文字（日文假名、韩文、全角字符）
        cjkCount++;
      } else if (code >= 0x0020 && code <= 0x007e) {
        // ASCII 可打印字符
        asciiCount++;
      } else {
        otherCount++;
      }
    }

    return Math.ceil(cjkCount * 1.5 + asciiCount * 0.25 + otherCount * 0.5);
  }
}
