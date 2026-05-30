import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
/**
 * Prisma 数据库服务
 *
 * 封装 PrismaClient，提供生命周期管理。
 * 所有数据库操作必须通过此服务进行。
 */
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    /**
     * 清理数据库（仅用于测试）
     */
    cleanDatabase(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map