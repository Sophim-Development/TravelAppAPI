import { PrismaClient } from '@prisma/client';

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

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      password: 'hashed_password',
      name: 'Super Admin',
      role: 'super_admin', // Ensure this matches the Role enum
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'hashed_password',
      name: 'Admin User',
      role: 'admin', // Ensure this matches the Role enum
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: 'hashed_password',
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