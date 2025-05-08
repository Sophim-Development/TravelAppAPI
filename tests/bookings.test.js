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

let adminToken, userToken, admin, user, testTrip, testBooking;

describe('Bookings Endpoints', () => {
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
    const testLocation = await prisma.location.create({
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
    testBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: testTrip.id,
        status: 'pending',
        bookingDate: new Date(),
        guests: 2,
        total: 300.0,
      },
    });
  });

  it('GET /api/bookings should list all bookings for user', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/bookings should allow user to create a booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        tripId: testTrip.id,
        guests: 1,
        total: 150.0,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('tripId', testTrip.id);
  });

  it('POST /api/bookings should not allow booking for non-existent trip', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        tripId: '00000000-0000-0000-0000-000000000000',
        guests: 1,
        total: 150.0,
      });
    expect(res.status).toBe(400);
  });

  it('POST /api/bookings should not allow user to book for another user', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        tripId: testTrip.id,
        guests: 1,
        total: 150.0,
        userId: admin.id,
      });
    expect(res.status).toBe(403);
  });

  it('POST /api/bookings should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/bookings/:id should return 404 for non-existent booking', async () => {
    const res = await request(app)
      .get('/api/bookings/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it('PUT /api/admin/bookings/:id should allow admin to update booking status', async () => {
    // Admin updates an existing booking created in beforeAll
    const res = await request(app)
      .put(`/api/admin/bookings/${testBooking.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'confirmed');
  });

  it('PUT /api/admin/bookings/:id should return 404 for non-existent booking', async () => {
    const res = await request(app)
      .put('/api/admin/bookings/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(404);
  });
});
