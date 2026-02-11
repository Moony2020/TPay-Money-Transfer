import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const wallets = await prisma.wallet.findMany({
    select: {
      id: true,
      userId: true,
      currency: true,
      status: true
    }
  });

  console.log('\\n=== WALLETS IN DATABASE ===');
  if (wallets.length === 0) {
    console.log('No wallets found!');
  } else {
    wallets.forEach((w, i) => {
      console.log(`${i + 1}. ID: ${w.id} | User: ${w.userId} | Status: ${w.status} | Currency: ${w.currency}`);
    });
  }
  console.log('===========================\\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
