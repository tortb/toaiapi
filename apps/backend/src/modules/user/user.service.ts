import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity, userFromPrisma } from './entities/user.entity';
import { hashPassword, validatePasswordStrength } from '@toai/auth';
import { maskEmail } from '@toai/common';
import { RedisService } from '../../redis/redis.service';
import { SystemSettingService } from '../../common/services/system-setting.service';

/**
 * 用户业务服务
 *
 * 处理用户相关的业务逻辑。
 * 通过 UserRepository 访问数据库。
 * SECURITY: 日志中使用 maskEmail 脱敏邮箱
 * SECURITY: findByEmail 返回脱敏实体，不暴露 password_hash
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly redis: RedisService,
    private readonly systemSettingService: SystemSettingService,
  ) {}

  /**
   * 创建用户（注册）
   *
   * @param dto - 创建用户数据
   * @returns 脱敏后的用户实体
   * @throws ConflictException 邮箱已注册
   * @throws BadRequestException 密码强度不足
   */
  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    // 检查邮箱是否已注册
    const exists = await this.userRepo.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(dto.password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(
        `密码不符合要求: ${passwordValidation.errors.join(', ')}`,
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(dto.password);

    // 创建用户
    const user = await this.userRepo.create({
      email: dto.email,
      password_hash: passwordHash,
      display_name: dto.displayName,
    });

    // SECURITY: 日志中脱敏邮箱
    this.logger.log(`User created: ${user.id} (${maskEmail(user.email)})`);

    return userFromPrisma(user);
  }

  /**
   * 根据 ID 查找用户
   *
   * @param id - 用户 ID
   * @returns 脱敏后的用户实体
   * @throws NotFoundException 用户不存在
   */
  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return userFromPrisma(user);
  }

  /**
   * 根据邮箱查找用户
   * SECURITY: 返回脱敏实体，不暴露 password_hash
   *
   * @param email - 用户邮箱
   * @returns 脱敏后的用户实体或 null
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return null;
    return userFromPrisma(user);
  }

  /**
   * 更新用户信息
   *
   * @param id - 用户 ID
   * @param dto - 更新数据
   * @returns 脱敏后的用户实体
   * @throws NotFoundException 用户不存在
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    // 功能开关：检查是否允许修改用户名
    if (dto.displayName !== undefined) {
      const allowChangeUsername = await this.systemSettingService.getTypedByKey<boolean>('allow_change_username', true);
      if (!allowChangeUsername) {
        throw new ForbiddenException('修改用户名功能已关闭');
      }
    }

    // 检查用户是否存在
    await this.findById(id);

    const user = await this.userRepo.update(id, {
      display_name: dto.displayName,
      avatar_url: dto.avatarUrl,
    });

    this.logger.log(`User updated: ${id}`);

    return userFromPrisma(user);
  }

  /**
   * 软删除用户
   *
   * @param id - 用户 ID
   * @throws NotFoundException 用户不存在
   */
  async deleteUser(id: string): Promise<void> {
    // 功能开关：检查是否允许注销账号
    const allowDeleteAccount = await this.systemSettingService.getTypedByKey<boolean>('allow_delete_account', false);
    if (!allowDeleteAccount) {
      throw new ForbiddenException('账号注销功能已关闭');
    }

    await this.findById(id);
    await this.userRepo.softDelete(id);
    // SECURITY: 软删除后撤销所有 Refresh Token，强制下线
    await this.redis.del(`refresh:${id}`);
    this.logger.log(`User soft-deleted: ${id}`);
  }
}
