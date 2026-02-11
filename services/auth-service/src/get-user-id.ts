import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      phoneNumber: true,
      fullName: true
    }
  });

  console.log('\\n=== USER IDs ===');
  users.forEach((u, i) => {
    console.log(`${i + 1}. UUID: ${u.id}`);
    console.log(`   Phone: ${u.phoneNumber}`);
    console.log(`   Name: ${u.fullName}`);
  });
  console.log('================\\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
