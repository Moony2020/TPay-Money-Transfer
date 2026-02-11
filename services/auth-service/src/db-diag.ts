import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  try {
    const count = await prisma.user.count();
    console.log(`Successfully connected. Total users: ${count}`);
    
    if (count > 0) {
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          phoneNumber: true,
          fullName: true,
          createdAt: true
        }
      });
      console.log('Last 5 users:');
      console.table(users);
    }
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
