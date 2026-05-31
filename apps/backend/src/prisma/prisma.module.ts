import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma 全局模块
 *
 * 注册为全局模块，所有模块可直接注入 PrismaService。
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
