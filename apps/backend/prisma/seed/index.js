import { PrismaClient } from '@prisma/client';
import { seedProviders } from './providers.seed';
import { seedModels } from './models.seed';
import { seedChannels } from './channels.seed';
import { seedAdmin } from './admin.seed';
/**
 * 数据库种子脚本
 *
 * 按顺序执行：
 * 1. Provider（无依赖）
 * 2. Model（依赖 Provider）
 * 3. Channel（依赖 Provider + Model）
 * 4. Admin（无依赖）
 */
async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('🌱 Starting database seeding...\n');
        await seedProviders(prisma);
        await seedModels(prisma);
        await seedChannels(prisma);
        await seedAdmin(prisma);
        console.log('\n✅ Database seeding completed!');
    }
    catch (error) {
        console.error('\n❌ Database seeding failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=index.js.map