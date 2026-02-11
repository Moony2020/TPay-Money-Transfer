import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all users from database...');
  
  const deleted = await prisma.user.deleteMany();
  console.log(`Deleted ${deleted.count} user(s).`);
  
  console.log('Database is now empty. You can register a new account!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
