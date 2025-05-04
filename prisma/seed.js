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

  // Create initial privacy policy
  const privacyPolicy = await prisma.privacyPolicy.create({
    data: {
      version: '1.0',
      content: `Privacy Policy for Travel App

Last Updated: ${new Date().toISOString().split('T')[0]}

1. Introduction
Welcome to Travel App. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.

2. Information We Collect
- Personal Information: Name, email address, contact details
- Location Data: Travel preferences and history
- Usage Data: How you interact with our app

3. How We Use Your Information
- To provide and maintain our service
- To notify you about changes to our service
- To provide customer support
- To gather analysis or valuable information

4. Data Security
We implement appropriate security measures to protect your personal information.

5. Third-Party Services
We may employ third-party companies and individuals to facilitate our service.

6. Contact Us
For any questions about this Privacy Policy, please contact us.`,
      isActive: true,
      publishedAt: new Date(),
    },
  });

  // Create initial terms of service
  const termsOfService = await prisma.termsOfService.create({
    data: {
      version: '1.0',
      content: `Terms of Service for Travel App

Last Updated: ${new Date().toISOString().split('T')[0]}

1. Acceptance of Terms
By accessing and using Travel App, you accept and agree to be bound by these Terms of Service.

2. User Registration
- You must provide accurate information when creating an account
- You are responsible for maintaining account security
- You must be at least 18 years old to use our services

3. Booking and Payments
- All bookings are subject to availability
- Prices are in USD unless otherwise stated
- Cancellation policies vary by service

4. User Conduct
- You agree to use the service legally and appropriately
- You will not engage in any harmful or disruptive behavior
- You will not attempt to gain unauthorized access

5. Intellectual Property
All content and materials available on Travel App are protected by intellectual property rights.

6. Limitation of Liability
We are not liable for any indirect, incidental, or consequential damages.

7. Changes to Terms
We reserve the right to modify these terms at any time.

8. Contact Information
For any questions about these Terms, please contact us.`,
      isActive: true,
      publishedAt: new Date(),
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