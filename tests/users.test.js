import request from 'supertest';
import { app } from '../src/index.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock passport.js
jest.mock('../src/utils/passport.js', () => ({}));

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  __internal: { engine: { connectionLimit: 5 } },
});

process.env.JWT_SECRET = 'test-jwt-secret';

let superAdminToken, adminToken, userToken, superAdmin, admin, user, testUser;

describe('Users Endpoints', () => {
  beforeAll(async () => {
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
    const unique = Date.now() + Math.random();
    superAdmin = await prisma.user.create({
      data: {
        email: `superadmin+${unique}@example.com`,
        password: await bcrypt.hash('password123', 12),
        name: 'Super Admin',
        role: 'super_admin',
        provider: 'email',
      },
    });
    admin = await prisma.user.create({
      data: {
        email: `admin+${unique}@example.com`,
        password: await bcrypt.hash('password123', 12),
        name: 'Admin User',
        role: 'admin',
        provider: 'email',
      },
    });
    user = await prisma.user.create({
      data: {
        email: `user+${unique}@example.com`,
        password: await bcrypt.hash('password123', 12),
        name: 'Regular User',
        role: 'user',
        provider: 'email',
      },
    });
    superAdminToken = jwt.sign({ id: superAdmin.id, role: superAdmin.role }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    testUser = await prisma.user.create({
      data: {
        email: `testuser+${unique}@example.com`,
        password: await bcrypt.hash('password123', 12),
        name: 'Test User',
        role: 'user',
        provider: 'email',
      },
    });
  });

  afterEach(async () => {
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
    await prisma.$disconnect();
  });

  it('POST /api/admin/users should allow super_admin to create a user', async () => {
    const unique = Date.now() + Math.random();
    const newUser = {
      name: 'New User',
      email: `newuser+${unique}@example.com`,
      password: 'password123',
      role: 'user',
    };
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', newUser.email);
  });

  it('POST /api/admin/users should not allow admin to create a user', async () => {
    const unique = Date.now() + Math.random();
    const newUser = {
      name: 'Another User',
      email: `anotheruser+${unique}@example.com`,
      password: 'password123',
      role: 'user',
    };
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newUser);
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/users/:id should allow super_admin to get a user by id', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${testUser.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testUser.id);
  });

  it('GET /api/admin/users/:id should not allow admin to get a user by id', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${testUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });
}); 