import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 请求日志记录参数
 *
 * 用于记录每次 API 调用的详细信息，支持计费审计和使用统计。
 */
export interface RequestLogParams {
  /** 用户 ID */
  readonly userId: string;
  /** API Key ID */
  readonly apiKeyId: string;
  /** 模型名称 */
  readonly modelId: string;
  /** 渠道 ID */
  readonly channelId: string;
  /** 请求路径 */
  readonly requestPath: string;
  /** 请求方法 */
  readonly requestMethod: string;
  /** 输入 Token 数 */
  readonly promptTokens: number;
  /** 输出 Token 数 */
  readonly completionTokens: number;
  /** 缓存命中 Token 数 */
  readonly cachedTokens?: number;
  /** 推理 Token 数（o1 等模型） */
  readonly reasoningTokens?: number;
  /** Token 总数 */
  readonly totalTokens: number;
  /** 费用（分） */
  readonly cost: number;
  /** HTTP 状态码 */
  readonly statusCode: number;
  /** 延迟（毫秒） */
  readonly latencyMs: number;
}

/**
 * 请求日志业务服务
 *
 * 记录所有 API 请求的详细信息，用于计费审计和使用统计。
 * 日志记录失败不影响主流程（fire-and-forget）。
 */
@Injectable()
export class RequestLogService {
  private readonly logger = new Logger(RequestLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 记录请求日志
   * SECURITY: 使用 ?? 代替 || 处理可选字段，避免 0 值被错误替换
   *
   * @param params - 请求日志参数
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
          cached_tokens: params.cachedTokens ?? 0,
          reasoning_tokens: params.reasoningTokens ?? 0,
          total_tokens: params.totalTokens,
          cost: params.cost,
          status_code: params.statusCode,
          latency_ms: params.latencyMs,
        },
      });
    } catch (error) {
      // 日志记录失败不应影响主流程
      this.logger.error('Failed to log request', error);
    }
  }

  /**
   * 获取用户请求日志（分页）
   *
   * @param userId - 用户 ID
   * @param page - 页码（从 1 开始）
   * @param pageSize - 每页数量（1-100）
   * @returns 分页日志记录
   */
  async getUserLogs(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    // 校验分页参数
    const validPage = Math.max(1, Math.floor(page));
    const validPageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const skip = (validPage - 1) * validPageSize;

    const [logs, total] = await Promise.all([
      this.prisma.requestLog.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: validPageSize,
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
        cachedTokens: log.cached_tokens,
        reasoningTokens: log.reasoning_tokens,
        totalTokens: log.total_tokens,
        cost: log.cost,
        statusCode: log.status_code,
        latencyMs: log.latency_ms,
        createdAt: log.created_at,
      })),
      total,
      page: validPage,
      pageSize: validPageSize,
      totalPages: Math.ceil(total / validPageSize),
    };
  }
}
