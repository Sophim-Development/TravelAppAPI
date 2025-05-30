import request from 'supertest';
import { app } from '../src/index.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock passport.js
jest.mock('../src/utils/passport.js', () => ({}));

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  __internal: { engine: { connectionLimit: 5 } },
});

process.env.JWT_SECRET = 'test-jwt-secret';

let adminToken, userToken, admin, user, testTrip, testLocation;

describe('Trips Endpoints', () => {
  beforeAll(async () => {
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.trip.deleteMany(),
      prisma.place.deleteMany(),
      prisma.location.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    const unique = Date.now() + Math.random();
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
    testTrip = await prisma.trip.create({
      data: {
        title: `Siem Reap Hotel Stay ${unique}`,
        description: '3-night stay in Siem Reap',
        locationId: testLocation.id,
        type: 'hotel',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-04'),
        price: 150.0,
      },
    });
  });

  it('GET /api/trips should list all trips', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/trips/:id should get a trip by id', async () => {
    const res = await request(app).get(`/api/trips/${testTrip.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testTrip.id);
  });

  it('POST /api/trips should allow admin to create a trip', async () => {
    const unique = Date.now() + Math.random();
    const newTrip = {
      title: `Phnom Penh City Tour ${unique}`,
      description: 'A day tour in Phnom Penh',
      locationId: testLocation.id,
      type: 'bus',
      startDate: '2025-07-01',
      endDate: '2025-07-02',
      price: 80.0,
    };
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newTrip);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', newTrip.title);
  });

  it('POST /api/trips should not allow regular user to create a trip', async () => {
    const unique = Date.now() + Math.random();
    const newTrip = {
      title: `Unauthorized Trip ${unique}`,
      description: 'Should not be allowed',
      locationId: testLocation.id,
      type: 'bus',
      startDate: '2025-07-01',
      endDate: '2025-07-02',
      price: 80.0,
    };
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTrip);
    expect(res.status).toBe(403);
  });

  it('PUT /api/trips/:id should allow admin to update a trip', async () => {
    const res = await request(app)
      .put(`/api/trips/${testTrip.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Siem Reap Hotel Stay Updated ${Date.now()}`,
        description: 'Updated description',
        locationId: testLocation.id,
        type: 'hotel',
        startDate: '2025-06-01',
        endDate: '2025-06-04',
        price: 200.0,
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title');
  });

  it('DELETE /api/trips/:id should allow admin to delete a trip', async () => {
    const unique = Date.now() + Math.random();
    const tripToDelete = await prisma.trip.create({
      data: {
        title: `Delete Me ${unique}`,
        description: 'To be deleted',
        locationId: testLocation.id,
        type: 'bus',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-02'),
        price: 50.0,
      },
    });
    const res = await request(app)
      .delete(`/api/trips/${tripToDelete.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/trips/:id should not allow regular user to delete a trip', async () => {
    const unique = Date.now() + Math.random();
    const tripToDelete = await prisma.trip.create({
      data: {
        title: `Delete Me 2 ${unique}`,
        description: 'To be deleted',
        locationId: testLocation.id,
        type: 'bus',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-02'),
        price: 50.0,
      },
    });
    const res = await request(app)
      .delete(`/api/trips/${tripToDelete.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
}); 
