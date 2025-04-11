import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化用户数据...');

  // 清理现有用户数据（谨慎使用，仅用于开发环境）
  // await prisma.user.deleteMany();
  // console.log('已清理现有用户数据');

  // 创建默认管理员账户
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        status: 1,
        lastLoginTime: new Date(),
      },
    });
    console.log(`已创建管理员账户: ${admin.username}`);
  } else {
    console.log('管理员账户已存在，跳过创建');
  }

  // 创建测试用户
  const testUserExists = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  if (!testUserExists) {
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: {
        username: 'test',
        email: 'test@example.com',
        password: hashedPassword,
        status: 1,
        lastLoginTime: new Date(),
      },
    });
    console.log(`已创建测试用户: ${testUser.username}`);
  } else {
    console.log('测试用户已存在，跳过创建');
  }

  console.log('用户数据初始化完成');
}

main()
  .catch((e) => {
    console.error('初始化过程中出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    // 关闭Prisma客户端连接
    await prisma.$disconnect();
  });
