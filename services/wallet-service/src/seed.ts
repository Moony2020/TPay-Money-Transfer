import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { Decimal } from 'decimal.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const pin = '123456';
  const hashedPin = await argon2.hash(pin);

  // Helper to get or create user via raw SQL (since User is in auth-service schema)
  const getOrCreateUser = async (phone: string, name: string) => {
    const existing: any[] = await prisma.$queryRaw`
      SELECT id FROM public.users WHERE phone_number = ${phone} LIMIT 1
    `;
    
    if (existing.length > 0) {
      return existing[0].id;
    }

    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO public.users (id, phone_number, full_name, hashed_pin, kyc_tier, created_at, updated_at)
      VALUES (${id}::uuid, ${phone}, ${name}, ${hashedPin}, 1, NOW(), NOW())
    `;
    return id;
  };

  // 1. Create User A (Sender) - +211912345678
  const userIdA = await getOrCreateUser('+211912345678', 'User A (Sender)');
  const walletA = await prisma.wallet.upsert({
    where: { userId: userIdA },
    update: {},
    create: {
      userId: userIdA,
      currency: 'SSP',
    },
  });

  // Add initial balance to User A (10,000 SSP)
  const balanceA = await prisma.ledgerEntry.aggregate({
    where: { walletId: walletA.id },
    _sum: { amount: true },
  });

  const currentBalanceA = balanceA._sum.amount ? new Decimal(balanceA._sum.amount.toString()) : new Decimal(0);
  if (currentBalanceA.lt(10000)) {
    const amountToAdd = new Decimal(10000).minus(currentBalanceA);
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          idempotencyKey: `seed_A_${Date.now()}`,
          type: 'DEPOSIT',
          status: 'COMMITTED',
          recipientWalletId: walletA.id,
          amount: amountToAdd.toFixed(4),
          description: 'Initial Seed Balance',
          committedAt: new Date(),
        },
      });

      await tx.ledgerEntry.create({
        data: {
          walletId: walletA.id,
          transactionId: transaction.id,
          entryType: 'CREDIT',
          amount: amountToAdd.toFixed(4),
          balance: amountToAdd.toFixed(4), // Simple for seed
        },
      });
    });
    console.log(`✅ User A (+211912345678) seeded with 10,000 SSP`);
  } else {
    console.log(`ℹ️ User A (+211912345678) already has sufficient balance`);
  }

  // 2. Create User B (Recipient) - +211987654321
  const userIdB = await getOrCreateUser('+211987654321', 'User B (Recipient)');
  const walletB = await prisma.wallet.upsert({
    where: { userId: userIdB },
    update: {},
    create: {
      userId: userIdB,
      currency: 'SSP',
    },
  });
  console.log(`✅ User B (+211987654321) created/updated`);

  // 3. Create Current Test User - +211999999999
  const userIdTest = await getOrCreateUser('+211999999999', 'Current Test User');
  const walletTest = await prisma.wallet.upsert({
    where: { userId: userIdTest },
    update: {},
    create: {
      userId: userIdTest,
      currency: 'SSP',
    },
  });

  const amountToAddTest = new Decimal(10000);
  await prisma.$transaction(async (tx) => {
    const balanceBefore = await tx.ledgerEntry.findFirst({
      where: { walletId: walletTest.id },
      orderBy: { createdAt: 'desc' },
    });
    const currentBalance = balanceBefore ? new Decimal(balanceBefore.balance.toString()) : new Decimal(0);

    const transaction = await tx.transaction.create({
      data: {
        idempotencyKey: `seed_test_${Date.now()}_${Math.random()}`,
        type: 'DEPOSIT',
        status: 'COMMITTED',
        recipientWalletId: walletTest.id,
        amount: amountToAddTest.toFixed(4),
        description: 'Additive Seed Funding',
        committedAt: new Date(),
      },
    });

    await tx.ledgerEntry.create({
      data: {
        walletId: walletTest.id,
        transactionId: transaction.id,
        entryType: 'CREDIT',
        amount: amountToAddTest.toFixed(4),
        balance: currentBalance.plus(amountToAddTest).toFixed(4),
      },
    });
  });
  console.log(`✅ Current Test User (+211999999999) received +10,000 SSP`);

  // 4. Create Secondary Test User (+211911111111)
  const userIdSec = await getOrCreateUser('+211911111111', 'Mymoon Dobaibi');
  const walletSec = await prisma.wallet.upsert({
    where: { userId: userIdSec },
    update: {},
    create: {
      userId: userIdSec,
      currency: 'SSP',
    },
  });

  const amountToAddSec = new Decimal(10000);
  await prisma.$transaction(async (tx) => {
    const balanceBefore = await tx.ledgerEntry.findFirst({
      where: { walletId: walletSec.id },
      orderBy: { createdAt: 'desc' },
    });
    const currentBalance = balanceBefore ? new Decimal(balanceBefore.balance.toString()) : new Decimal(0);

    const transaction = await tx.transaction.create({
      data: {
        idempotencyKey: `seed_sec_${Date.now()}_${Math.random()}`,
        type: 'DEPOSIT',
        status: 'COMMITTED',
        recipientWalletId: walletSec.id,
        amount: amountToAddSec.toFixed(4),
        description: 'Additive Seed Funding',
        committedAt: new Date(),
      },
    });

    await tx.ledgerEntry.create({
      data: {
        walletId: walletSec.id,
        transactionId: transaction.id,
        entryType: 'CREDIT',
        amount: amountToAddSec.toFixed(4),
        balance: currentBalance.plus(amountToAddSec).toFixed(4),
      },
    });
  });
  console.log(`✅ Secondary Test User (+211911111111) received +10,000 SSP`);

  // 5. FINAL VERIFICATION LOGS
  const verify = async (phone: string, name: string) => {
    const user: any[] = await prisma.$queryRaw`SELECT id FROM public.users WHERE phone_number = ${phone} LIMIT 1`;
    if (user.length === 0) return 'Not found';
    const wallet = await prisma.wallet.findUnique({ where: { userId: user[0].id } });
    if (!wallet) return 'No wallet';
    const balance = await prisma.ledgerEntry.aggregate({
      where: { walletId: wallet.id },
      _sum: { amount: true },
    });
    return (balance._sum.amount?.toString() || '0.00');
  };

  console.log('\n🔍 Final Balance Audit:');
  console.log(`- +211999999999 (Current User):    ${await verify('+211999999999', '')} SSP`);
  console.log(`- +211911111111 (Mymoon Dobaibi):  ${await verify('+211911111111', '')} SSP`);
  console.log('\n🚀 Seed completed successfully!');
  console.log('-----------------------------------');
  console.log(`  PIN:   ${pin}`);
  console.log(`  Wallet ID: ${walletTest.id}`);
  console.log('\nSecondary Test User:');
  console.log(`  Phone: +211911111111`);
  console.log(`  PIN:   ${pin}`);
  console.log(`  Wallet ID: ${walletSec.id}`);
  console.log('-----------------------------------');
  console.log('Test User 1 (+211999999999): 10,000 SSP (Credit)');
  console.log('Test User 2 (+211911111111): 10,000 SSP (Credit)');
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
