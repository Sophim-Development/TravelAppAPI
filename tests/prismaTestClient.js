import { PrismaClient } from '@prisma/client';

const isTest = process.env.NODE_ENV === 'test';

const prisma = global.__PRISMA__ || new PrismaClient({
  datasources: {
    db: {
      url: isTest
        ? 'file:./test.db?mode=memory&cache=shared'
        : process.env.DATABASE_URL,
    },
  },
  __internal: { engine: { connectionLimit: 5 } },
});

if (isTest) {
  global.__PRISMA__ = prisma;
}

export default prisma; 