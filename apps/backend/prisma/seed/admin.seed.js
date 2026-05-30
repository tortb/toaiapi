import * as argon2 from 'argon2';
/**
 * Admin 种子数据
 *
 * 创建管理员账号
 */
export async function seedAdmin(prisma) {
    console.log('Seeding admin user...');
    const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@toaiapi.com';
    const adminPassword = process.env['ADMIN_PASSWORD'] || 'Admin@123456';
    // 哈希密码
    const passwordHash = await argon2.hash(adminPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
    // 创建管理员
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password_hash: passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
        create: {
            email: adminEmail,
            password_hash: passwordHash,
            display_name: 'Admin',
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    // 创建管理员余额
    await prisma.userBalance.upsert({
        where: { user_id: admin.id },
        update: {},
        create: {
            user_id: admin.id,
            amount: 0,
        },
    });
    console.log(`  ✓ Admin user created: ${adminEmail}`);
}
//# sourceMappingURL=admin.seed.js.map