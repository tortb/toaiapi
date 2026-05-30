import { Module } from '@nestjs/common';
import { RequestLogService } from './request-log.service';

/**
 * 请求日志模块
 *
 * 记录所有 API 请求的详细信息。
 */
@Module({
  providers: [RequestLogService],
  exports: [RequestLogService],
})
export class RequestLogModule {}
