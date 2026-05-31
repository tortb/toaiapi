import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
/**
 * API Key 认证守卫
 *
 * 支持两种传递方式：
 * 1. X-API-Key 头
 * 2. Authorization: Bearer sk-toai-xxx
 *
 * 验证流程：
 * 1. 提取 API Key
 * 2. 按 prefix 查找
 * 3. Argon2id 验证
 * 4. 检查状态和过期时间
 * 5. 将 Key 信息附加到 request.apiKey
 */
export declare class ApiKeyAuthGuard implements CanActivate {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    /**
     * 从请求中提取 API Key
     */
    private extractApiKey;
}
//# sourceMappingURL=api-key-auth.guard.d.ts.map