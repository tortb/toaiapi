import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity, userFromPrisma } from './entities/user.entity';
import { hashPassword, validatePasswordStrength } from '@toai/auth';

/**
 * 用户业务服务
 *
 * 处理用户相关的业务逻辑。
 * 通过 UserRepository 访问数据库。
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepo: UserRepository) {}

  /**
   * 创建用户（注册）
   *
   * @throws {ConflictException} 邮箱已注册
   * @throws {Error} 密码强度不足
   */
  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    // 检查邮箱是否已注册
    const exists = await this.userRepo.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(dto.password);
    if (!passwordValidation.valid) {
      throw new ConflictException(
        `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
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

    this.logger.log(`User created: ${user.id} (${user.email})`);

    return userFromPrisma(user);
  }

  /**
   * 根据 ID 查找用户
   *
   * @throws {NotFoundException} 用户不存在
   */
  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return userFromPrisma(user);
  }

  /**
   * 根据邮箱查找用户
   *
   * @returns 用户实体或 null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * 更新用户信息
   *
   * @throws {NotFoundException} 用户不存在
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<UserEntity> {
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
   * @throws {NotFoundException} 用户不存在
   */
  async deleteUser(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepo.softDelete(id);
    this.logger.log(`User soft-deleted: ${id}`);
  }
}
