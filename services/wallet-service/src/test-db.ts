import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCrossSchemaQuery() {
  try {
    console.log('Testing cross-schema query to public.users...');
    const result = await prisma.$queryRaw`SELECT id, phone_number FROM public.users LIMIT 1`;
    console.log('Result:', result);
  } catch (error) {
    console.error('Cross-schema query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCrossSchemaQuery();
