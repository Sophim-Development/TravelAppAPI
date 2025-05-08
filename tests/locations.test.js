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

let adminToken, userToken, admin, user, testLocation;

describe('Locations Endpoints', () => {
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
    user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Regular User',
        role: 'user',
        provider: 'email',
      },
    });
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    testLocation = await prisma.location.create({
      data: {
        name: 'Phnom Penh',
        country: 'Cambodia',
        description: 'Capital city',
        lat: 11.5564,
        long: 104.9282,
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

  it('GET /api/locations should list all locations', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/locations/:id should get a location by id', async () => {
    const res = await request(app).get(`/api/locations/${testLocation.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testLocation.id);
  });

  it('POST /api/admin/locations should allow admin to create a location', async () => {
    const newLocation = {
      name: 'Battambang',
      country: 'Cambodia',
      description: 'A city in northwestern Cambodia',
      lat: 13.0957,
      long: 103.2022,
    };
    const res = await request(app)
      .post('/api/admin/locations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newLocation);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'Battambang');
  });

  it('POST /api/admin/locations should not allow regular user to create a location', async () => {
    const newLocation = {
      name: 'Kampot',
      country: 'Cambodia',
      description: 'A city in southern Cambodia',
      lat: 10.6104,
      long: 104.1810,
    };
    const res = await request(app)
      .post('/api/admin/locations')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newLocation);
    expect(res.status).toBe(403);
  });

  it('PUT /api/admin/locations/:id should allow admin to update a location', async () => {
    const res = await request(app)
      .put(`/api/admin/locations/${testLocation.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Phnom Penh Updated',
        country: 'Cambodia',
        description: 'Updated description',
        lat: 11.5564,
        long: 104.9282,
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Phnom Penh Updated');
  });

  it('DELETE /api/admin/locations/:id should allow admin to delete a location', async () => {
    const locationToDelete = await prisma.location.create({
      data: {
        name: 'Delete Me',
        country: 'Cambodia',
        description: 'To be deleted',
        lat: 10.0,
        long: 100.0,
      },
    });
    const res = await request(app)
      .delete(`/api/admin/locations/${locationToDelete.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/admin/locations/:id should not allow regular user to delete a location', async () => {
    const locationToDelete = await prisma.location.create({
      data: {
        name: 'Delete Me 2',
        country: 'Cambodia',
        description: 'To be deleted',
        lat: 10.0,
        long: 100.0,
      },
    });
    const res = await request(app)
      .delete(`/api/admin/locations/${locationToDelete.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
}); 