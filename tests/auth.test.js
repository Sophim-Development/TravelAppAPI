import request from 'supertest';
import { app } from '../src/index.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock passport.js
jest.mock('../src/utils/passport.js', () => ({}));

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  __internal: { engine: { connectionLimit: 5 } },
});

describe('Auth Endpoints', () => {
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

  it('POST /api/auth/register should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('testuser@example.com');
  });

  it('POST /api/auth/register should not allow duplicate registration', async () => {
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        provider: 'email',
      },
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login should login with valid credentials', async () => {
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        provider: 'email',
      },
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });
    expect(res.status).toBe(401);
  });
});