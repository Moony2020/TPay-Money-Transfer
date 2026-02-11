import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User ID from auth-service
const userId = '145c5c8b-651a-4354-b503-a96515de0210';

async function main() {
  // Check if wallet already exists
  const existing = await prisma.wallet.findFirst({
    where: { userId }
  });

  if (existing) {
    console.log('Wallet already exists:', existing);
    return;
  }

  // Create new wallet
  const wallet = await prisma.wallet.create({
    data: {
      userId,
      currency: 'SSP'
    }
  });

  console.log('Created wallet:', wallet);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

