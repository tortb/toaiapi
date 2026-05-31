import { Injectable, Logger } from '@nestjs/common';
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
@Injectable()
export class RequestLogService {
  private readonly logger = new Logger(RequestLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 记录请求日志
   */
  async logRequest(params: RequestLogParams): Promise<void> {
    try {
      await this.prisma.requestLog.create({
        data: {
          user_id: params.userId,
          api_key_id: params.apiKeyId,
          model_id: params.modelId,
          channel_id: params.channelId,
          request_path: params.requestPath,
          request_method: params.requestMethod,
          prompt_tokens: params.promptTokens,
          completion_tokens: params.completionTokens,
          cached_tokens: params.cachedTokens || 0,
          reasoning_tokens: params.reasoningTokens || 0,
          total_tokens: params.totalTokens,
          cost: params.cost,
          status_code: params.statusCode,
          latency_ms: params.latencyMs,
        },
      });
    } catch (error) {
      // 日志记录失败不应影响主流程
      this.logger.error(`Failed to log request: ${error}`);
    }
  }

  /**
   * 获取用户请求日志
   */
  async getUserLogs(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      this.prisma.requestLog.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.requestLog.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      items: logs.map((log) => ({
        id: log.id,
        modelId: log.model_id,
        promptTokens: log.prompt_tokens,
        completionTokens: log.completion_tokens,
        totalTokens: log.total_tokens,
        cost: log.cost,
        statusCode: log.status_code,
        latencyMs: log.latency_ms,
        createdAt: log.created_at,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
