// tests/api.test.js
import request from 'supertest';
import { app } from '../src/index.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Configure Prisma client with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pooling configuration
  __internal: {
    engine: {
      connectionLimit: 5, // Limit concurrent connections
    },
  },
});

// Mock cloudinary upload
jest.mock('../src/utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image/upload/sample.jpg'),
}));

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';

describe('API Tests', () => {
  let superAdminToken, adminToken, userToken, testLocation, testPlace, testTrip;
  let superAdmin, admin, user;

  beforeAll(async () => {
    // Clean up the database before all tests
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.trip.deleteMany(),
      prisma.place.deleteMany(),
      prisma.location.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  beforeEach(async () => {
    // Create test users
    superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Super Admin',
        role: 'super_admin',
        provider: 'email',
      },
    });

    admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Admin User',
        role: 'admin',
        provider: 'email',
      },
    });

    user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Regular User',
        role: 'user',
        provider: 'email',
      },
    });

    // Generate tokens
    superAdminToken = jwt.sign({ id: superAdmin.id, role: superAdmin.role }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

    // Create test location
    testLocation = await prisma.location.create({
      data: {
        name: 'Siem Reap',
        country: 'Cambodia',
        description: 'Home to Angkor Wat',
        lat: 13.4125,
        long: 103.867,
      },
    });

    // Create test place
    testPlace = await prisma.place.create({
      data: {
        name: 'Angkor Wat',
        description: 'Iconic temple complex',
        locationId: testLocation.id,
        category: 'temple',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      },
    });

    // Create test trip
    testTrip = await prisma.trip.create({
      data: {
        title: 'Siem Reap Hotel Stay',
        description: '3-night stay in Siem Reap',
        locationId: testLocation.id,
        type: 'hotel',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-04'),
        price: 150.0,
      },
    });
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.trip.deleteMany(),
      prisma.place.deleteMany(),
      prisma.location.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  afterAll(async () => {
    // Disconnect Prisma client after all tests
    await prisma.$disconnect();
  });

  describe('Places Endpoints', () => {
    it('GET /api/places should list all places', async () => {
      const res = await request(app).get('/api/places');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/admin/places should not allow regular users to create places', async () => {
      const newPlace = {
        name: 'Unauthorized Place',
        description: 'This should fail',
        locationId: testLocation.id,
        category: 'beach',
      };

      const res = await request(app)
        .post('/api/admin/places')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newPlace);

      expect(res.status).toBe(403);
    });
  });

  describe('Legal Document Endpoints', () => {
    it('GET /api/legal/privacy-policy/active should get active privacy policy', async () => {
      // First create an active privacy policy
      await request(app)
        .post('/api/admin/legal/privacy-policy')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          version: '1.0',
          content: 'Privacy policy content',
          isActive: true,
        });

      const res = await request(app).get('/api/legal/privacy-policy/active');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isActive', true);
      expect(res.body).toHaveProperty('content');
    });

    it('GET /api/legal/terms-of-service/active should get active terms of service', async () => {
      // First create an active terms of service
      await request(app)
        .post('/api/admin/legal/terms-of-service')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          version: '1.0',
          content: 'Terms of service content',
          isActive: true,
        });

      const res = await request(app).get('/api/legal/terms-of-service/active');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isActive', true);
      expect(res.body).toHaveProperty('content');
    });
  });
});
