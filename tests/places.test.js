import request from 'supertest';
import { app } from '../src/index.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock passport.js
jest.mock('../src/utils/passport.js', () => ({}));

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  __internal: { engine: { connectionLimit: 5 } },
});

process.env.JWT_SECRET = 'test-jwt-secret';

let superAdminToken, adminToken, userToken, testLocation;
let superAdmin, admin, user;

describe('Places Endpoints', () => {
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
        name: `Super Admin ${unique}`,
        role: 'super_admin',
        provider: 'email',
      },
    });
    admin = await prisma.user.create({
      data: {
        email: `admin+${unique}@example.com`,
        password: await bcrypt.hash('password123', 12),
        name: `Admin User ${unique}`,
        role: 'admin',
        provider: 'email',
      },
    });
    user = await prisma.user.create({
      data: {
        email: `user+${unique}@example.com`,
        password: await bcrypt.hash('password123', 12),
        name: `Regular User ${unique}`,
        role: 'user',
        provider: 'email',
      },
    });
    superAdminToken = jwt.sign({ id: superAdmin.id, role: superAdmin.role }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    testLocation = await prisma.location.create({
      data: {
        name: `Siem Reap ${unique}`,
        country: 'Cambodia',
        description: 'Home to Angkor Wat',
        lat: 13.4125,
        long: 103.867,
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

  it('GET /api/places should list all places', async () => {
    const unique = Date.now() + Math.random();
    // Create a place to ensure there is at least one
    await prisma.place.create({
      data: {
        name: `Angkor Wat ${unique}`,
        description: 'Iconic temple complex',
        locationId: testLocation.id,
        category: 'temple',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      },
    });
    const res = await request(app).get('/api/places');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/admin/places should not allow regular users to create places', async () => {
    const unique = Date.now() + Math.random();
    const newPlace = {
      name: `Unauthorized Place ${unique}`,
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