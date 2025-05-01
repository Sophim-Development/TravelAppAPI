import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const location = await prisma.location.create({
    data: {
      name: 'Siem Reap',
      country: 'Cambodia',
      description: 'Home to Angkor Wat',
      lat: 13.4125,
      long: 103.867,
    },
  });

  const place = await prisma.place.create({
    data: {
      name: 'Angkor Wat',
      description: 'Iconic temple complex',
      locationId: location.id,
      category: 'temple',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    },
  });

  const trip = await prisma.trip.create({
    data: {
      title: 'Siem Reap Hotel Stay',
      description: '3-night stay in Siem Reap',
      locationId: location.id,
      type: 'hotel',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-04'),
      price: 150.0,
    },
  });

  const hashedSuperAdminPassword = await bcrypt.hash('password123', 12);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      password: hashedSuperAdminPassword,
      name: 'Super Admin',
      role: 'super_admin',
    },
  });

  const hashedAdminPassword = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  const hashedUserPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedUserPassword,
      name: 'Regular User',
      role: 'user',
    },
  });

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });