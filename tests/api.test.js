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

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('newuser@example.com');
      expect(res.body.user.role).toBe('user');
    });

    it('POST /api/auth/login should login a user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('user@example.com');
    });

    it('POST /api/auth/login should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Places Endpoints', () => {
    it('GET /api/places should list all places', async () => {
      const res = await request(app).get('/api/places');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/places/:id should get a specific place', async () => {
      const res = await request(app).get(`/api/places/${testPlace.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testPlace.id);
      expect(res.body).toHaveProperty('name', testPlace.name);
    });

    it('POST /api/admin/places should create a place (admin only)', async () => {
      const newPlace = {
        name: 'New Place',
        description: 'A new place description',
        locationId: testLocation.id,
        category: 'beach',
      };

      const res = await request(app)
        .post('/api/admin/places')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPlace);

      expect(res.status).toBe(201);
      expect(res.body.place).toHaveProperty('name', newPlace.name);
      expect(res.body.place).toHaveProperty('category', newPlace.category);
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

    it('PUT /api/admin/places/:id should update a place (admin only)', async () => {
      const updateData = {
        name: 'Updated Place Name',
        description: 'Updated description',
      };

      const res = await request(app)
        .put(`/api/admin/places/${testPlace.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', updateData.name);
      expect(res.body).toHaveProperty('description', updateData.description);
    });

    it('DELETE /api/admin/places/:id should delete a place (admin only)', async () => {
      const placeToDelete = await prisma.place.create({
        data: {
          name: 'Place to Delete',
          description: 'This place will be deleted',
          locationId: testLocation.id,
          category: 'other',
          imageUrl: 'https://example.com/image.jpg',
        },
      });

      const res = await request(app)
        .delete(`/api/admin/places/${placeToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify the place was deleted
      const deletedPlace = await prisma.place.findUnique({
        where: { id: placeToDelete.id },
      });
      expect(deletedPlace).toBeNull();
    });
  });

  describe('Legal Document Endpoints', () => {
    it('POST /api/admin/legal/privacy-policy should create a privacy policy (admin only)', async () => {
      const res = await request(app)
        .post('/api/admin/legal/privacy-policy')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          version: '1.0',
          content: 'Privacy policy content',
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('version', '1.0');
      expect(res.body).toHaveProperty('isActive', true);
    });

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

    it('POST /api/admin/legal/terms-of-service should create terms of service (admin only)', async () => {
      const res = await request(app)
        .post('/api/admin/legal/terms-of-service')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          version: '1.0',
          content: 'Terms of service content',
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('version', '1.0');
      expect(res.body).toHaveProperty('isActive', true);
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
