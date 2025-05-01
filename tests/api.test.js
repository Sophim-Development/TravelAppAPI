// tests/api.test.js
import request from 'supertest';
import app from '../src/index.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

jest.mock('../src/utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image/upload/sample.jpg'),
}));

jest.mock('passport-google-oauth20', () => ({
  Strategy: jest.fn(),
}));

jest.mock('passport-facebook', () => ({
  Strategy: jest.fn(),
}));

jest.mock('passport-apple', () => ({
  Strategy: jest.fn(),
}));

const generateToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

describe('API Tests', () => {
  let superAdminToken, adminToken, userToken, testLocation, testPlace, testTrip;

  beforeAll(async () => {
    await prisma.$connect();

    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.trip.deleteMany(),
      prisma.place.deleteMany(),
      prisma.location.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    testLocation = await prisma.location.create({
      data: {
        name: 'Siem Reap',
        country: 'Cambodia',
        description: 'Home to Angkor Wat',
        lat: 13.4125,
        long: 103.867,
      },
    });

    testPlace = await prisma.place.create({
      data: {
        name: 'Angkor Wat',
        description: 'Iconic temple complex',
        locationId: testLocation.id,
        category: 'temple',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      },
    });

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

    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Super Admin',
        role: 'super_admin',
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Admin User',
        role: 'admin',
      },
    });

    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Regular User',
        role: 'user',
      },
    });

    superAdminToken = generateToken(superAdmin);
    adminToken = generateToken(admin);
    userToken = generateToken(user);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/auth/login should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('user@example.com');
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login should login an admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('admin@example.com');
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/admin/places should create a place', async () => {
    const res = await request(app)
      .post('/api/admin/places')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Place',
        description: 'A new place',
        locationId: testLocation.id,
        category: 'beach',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      });

    expect(res.status).toBe(201);
    expect(res.body.place).toHaveProperty('id');
    expect(res.body.place.name).toBe('New Place');
  });

  it('GET /api/places should list all places', async () => {
    const res = await request(app).get('/api/places');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/admin/places should not allow super_admin to create a place', async () => {
    const res = await request(app)
      .post('/api/admin/places')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Super Admin Place',
        description: 'Created by super admin',
        locationId: testLocation.id,
        category: 'other',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('POST /api/admin/locations should allow only admin to create a location', async () => {
    // Test with admin token
    let res = await request(app)
      .post('/api/admin/locations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Location',
        country: 'Admin Country',
        description: 'Created by admin',
        lat: 12.34,
        long: 56.78,
      });

    expect(res.status).toBe(201);
    expect(res.body.location).toHaveProperty('id');
    expect(res.body.location.name).toBe('Admin Location');
  });
});
