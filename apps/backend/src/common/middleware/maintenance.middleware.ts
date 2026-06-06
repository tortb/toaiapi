import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { SystemSettingService } from '../services/system-setting.service';

/**
 * 维护模式中间件
 *
 * 检查 maintenance_mode 系统设置：
 * - 开启时：非管理员请求返回 503，携带维护公告
 * - 关闭时：正常放行
 * - 数据库不可用时：放行（不阻断请求）
 *
 * 管理员通过 JWT payload 中的 role 判断（仅解码不验证，正式鉴权由 JwtAuthGuard 负责）。
 * 白名单路径（如登录、健康检查、管理后台）不受限制。
 */
@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MaintenanceMiddleware.name);

  /** 不受维护模式影响的路径前缀 */
  private readonly WHITELIST_PREFIXES = [
    '/api/v1/auth/',
    '/api/v1/admin/',
    '/api/v1/health',
    '/api/docs',
    '/api/v1/maintenance-status',
    '/api/v1/public-config',
  ];

  constructor(private readonly systemSettingService: SystemSettingService) {}

  async use(req: FastifyRequest, res: FastifyReply, next: (err?: Error) => void) {
    const path = req.url?.split('?')[0] ?? '';

    // 白名单路径直接放行
    if (this.WHITELIST_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next();
    }

    try {
      // 检查维护模式是否开启
      const maintenanceMode = await this.systemSettingService.getTypedByKey<boolean>(
        'maintenance_mode',
        false,
      );

      if (!maintenanceMode) {
        return next();
      }

      // 维护模式开启，检查是否为管理员
      const isAdmin = this.checkAdminRole(req);
      if (isAdmin) {
        return next();
      }

      // 非管理员，返回 503
      let notice = '系统维护中，请稍后再试';
      try {
        const savedNotice = await this.systemSettingService.getByKey('maintenance_notice');
        if (savedNotice) notice = savedNotice;
      } catch {
        // 忽略读取公告失败
      }

      this.logger.warn(`Maintenance mode blocked: ${req.method} ${path}`);

      res.status(503).send({
        code: 503,
        message: notice,
        maintenance: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // 数据库连接失败等异常：放行请求，不阻断
      // 这样即使数据库未配置/不可用，系统仍能正常启动
      this.logger.warn(`Maintenance middleware skip (DB may be unavailable): ${error instanceof Error ? error.message : error}`);
      return next();
    }
  }

  /**
   * 从 Authorization header 解码 JWT payload 检查角色
   *
   * 仅做 base64 解码，不做签名验证（正式鉴权由 JwtAuthGuard 负责）。
   * 维护模式场景下，误放一个伪造 token 的风险极低（最坏情况只是看到网站）。
   */
  private checkAdminRole(req: FastifyRequest): boolean {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return false;
      }

      const token = authHeader.substring(7);
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        return false;
      }

      // Base64url 解码 payload
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8'),
      );

      return payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN';
    } catch {
      return false;
    }
  }
}
