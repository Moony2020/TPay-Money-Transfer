import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      phoneNumber: true,
      fullName: true
    }
  });

  console.log('\\n=== REGISTERED USERS ===');
  users.forEach((u, i) => {
    console.log(`${i + 1}. Phone: ${u.phoneNumber} | Name: ${u.fullName}`);
  });
  console.log('========================\\n');

  if (users.length > 0) {
    console.log('>>> Copy this phone to localStorage for login:');
    console.log(`localStorage.setItem('tpay_phone', '${users[0].phoneNumber}');`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
