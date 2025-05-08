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

let adminToken, admin;

describe('Legal Document Endpoints', () => {
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
    admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Admin User',
        role: 'admin',
        provider: 'email',
      },
    });
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);
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

  it('GET /api/legal/privacy-policy/active should get active privacy policy', async () => {
    // First create an active privacy policy
    await request(app)
      .post('/api/legal/privacy-policy')
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
      .post('/api/legal/terms-of-service')
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