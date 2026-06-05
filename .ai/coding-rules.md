# ToAIAPI Coding Rules

## TypeScript 规范

### 禁止使用

```typescript
// ❌ 禁止 var
var name = 'test';

// ❌ 禁止 any
function process(data: any) { }

// ❌ 禁止 unknown 滥用
const result: unknown = getData();

// ❌ 禁止非空断言（除非有充分理由）
const user = getUser()!;

// ❌ 禁止魔法数字
if (status === 3) { }
const maxRetry = 5;

// ❌ 禁止类型断言滥用
const data = response as any;
```

### 必须使用

```typescript
// ✅ 使用 const/let
const name = 'test';
let count = 0;

// ✅ 使用 interface/type 定义结构
interface User {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}

// ✅ 使用 enum 定义常量
enum UserRole {
  USER = 'user',
  VIP = 'vip',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// ✅ 使用 readonly 保护不可变数据
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// ✅ 使用常量定义魔法数字
const MAX_RETRY_COUNT = 5;
const HTTP_STATUS_OK = 200;

// ✅ 使用 Zod/class-validator 校验输入
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

## 文件规范

### 文件长度限制

- 单文件最大 **500 行**
- 推荐 **200 ~ 300 行**
- 超出必须拆分

### 文件命名

```
// 模块文件
user.service.ts
user.controller.ts
user.repository.ts
user.dto.ts
user.entity.ts
user.module.ts

// 工具文件
format-date.ts
validate-email.ts

// 常量文件
user-role.enum.ts
http-status.constant.ts

// 测试文件
user.service.spec.ts
user.e2e-spec.ts
```

### 目录结构

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── guards/
│   │       └── auth.guard.ts
│   └── user/
│       ├── user.module.ts
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts
│       ├── dto/
│       └── entities/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   └── redis.config.ts
└── main.ts
```

## 函数规范

### 函数长度

- 单函数最大 **50 行**
- 推荐 **20 行以内**
- 超出必须拆分

### 函数命名

```typescript
// ✅ 动词开头，语义清晰
async function createUser(dto: CreateUserDto): Promise<User> { }
async function findUserByEmail(email: string): Promise<User | null> { }
async function calculateTokenCost(tokens: number, model: string): Promise<number> { }
async function validateApiKey(key: string): Promise<boolean> { }

// ❌ 语义模糊
async function handle(data: any) { }
async function process(id: string) { }
async function doStuff() { }
```

### 参数规范

```typescript
// ✅ 参数超过3个时使用对象
interface CreateUserParams {
  email: string;
  password: string;
  role: UserRole;
  organizationId?: string;
}

async function createUser(params: CreateUserParams): Promise<User> { }

// ❌ 参数过多
async function createUser(
  email: string,
  password: string,
  role: UserRole,
  organizationId: string,
  displayName: string,
): Promise<User> { }
```

## 错误处理

```typescript
// ✅ 使用自定义异常
class InsufficientBalanceError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient balance: required ${required}, available ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}

// ✅ Service 层抛出异常，Controller 层捕获处理
@Injectable()
export class BillingService {
  async deductBalance(userId: string, amount: number): Promise<void> {
    const balance = await this.getBalance(userId);
    if (balance < amount) {
      throw new InsufficientBalanceError(amount, balance);
    }
    // ...
  }
}

// ❌ 吞掉错误
try {
  await deductBalance(userId, amount);
} catch (e) {
  // 忽略错误
}

// ❌ 返回模糊错误
throw new Error('Something went wrong');
```

## 注释规范

```typescript
/**
 * 从用户余额中扣除指定金额
 *
 * @param userId - 用户ID
 * @param amount - 扣除金额（单位：分）
 * @param orderId - 关联订单号
 * @throws {InsufficientBalanceError} 余额不足
 * @throws {UserNotFoundError} 用户不存在
 */
async function deductBalance(
  userId: string,
  amount: number,
  orderId: string,
): Promise<BalanceTransaction> {
  // ...
}
```

## 测试规范

```typescript
// ✅ 测试命名清晰
describe('BillingService', () => {
  describe('deductBalance', () => {
    it('should deduct balance and create transaction record', async () => { });
    it('should throw InsufficientBalanceError when balance is insufficient', async () => { });
    it('should throw UserNotFoundError when user does not exist', async () => { });
    it('should be idempotent for the same orderId', async () => { });
  });
});

// ❌ 测试命名模糊
describe('BillingService', () => {
  it('test1', async () => { });
  it('should work', async () => { });
});
```

## 导入顺序

```typescript
// 1. Node.js 内置模块
import { join } from 'path';
import { createHash } from 'crypto';

// 2. 第三方库
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/client';
import { z } from 'zod';

// 3. 内部模块（绝对路径）
import { UserService } from '@/modules/user/user.service';
import { UserRole } from '@/modules/user/enums/user-role.enum';

// 4. 相对路径
import { CreateBillingDto } from './dto/create-billing.dto';
import { BillingRepository } from './billing.repository';
```
