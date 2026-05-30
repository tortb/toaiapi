import { createParamDecorator } from '@nestjs/common';
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
export const ApiKey = createParamDecorator((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const apiKey = request['apiKey'];
    if (!apiKey) {
        return null;
    }
    return data ? apiKey[data] : apiKey;
});
//# sourceMappingURL=api-key.decorator.js.map