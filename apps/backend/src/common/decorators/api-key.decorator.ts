import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * API Key 信息接口
 */
export interface ApiKeyInfo {
  readonly id: string;
  readonly userId: string;
  readonly name: string | null;
  readonly rateLimit: number | null;
  readonly tokenLimit: number | null;
  readonly modelLimit: string[];
}

/**
 * 获取当前 API Key 信息装饰器
 *
 * 从 API Key 认证中解析 Key 信息，注入到 Controller 方法参数中。
 *
 * @example
 * ```typescript
 * @Post('chat/completions')
 * async chatCompletions(@ApiKey() key: ApiKeyInfo) {
 *   return this.gatewayService.handleRequest(key);
 * }
 * ```
 */
export const ApiKey = createParamDecorator(
  (data: keyof ApiKeyInfo | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const apiKey = request['apiKey'] as ApiKeyInfo;

    if (!apiKey) {
      return null;
    }

    return data ? apiKey[data] : apiKey;
  },
);
