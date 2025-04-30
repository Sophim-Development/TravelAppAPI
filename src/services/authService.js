import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findOrCreateUser = async ({ email, name, provider, providerId }) => {
  let user = await prisma.user.findFirst({
    where: { provider, providerId },
  });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Link provider to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { provider, providerId },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider,
          providerId,
          role: 'user',
        },
      });
    }
  }

  return user;
};