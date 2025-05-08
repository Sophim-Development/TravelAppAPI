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

let userToken, user, testPlace, testReview;

describe('Reviews Endpoints', () => {
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
    user = await prisma.user.create({
      data: {
        email: `user+${unique}@example.com`,
        password: await bcrypt.hash('password123', 12),
        name: `Review User ${unique}`,
        role: 'user',
        provider: 'email',
      },
    });
    userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    const testLocation = await prisma.location.create({
      data: {
        name: `Phnom Penh ${unique}`,
        country: 'Cambodia',
        description: 'Capital city',
        lat: 11.5564,
        long: 104.9282,
      },
    });
    testPlace = await prisma.place.create({
      data: {
        name: `Royal Palace ${unique}`,
        description: 'Famous landmark',
        locationId: testLocation.id,
        category: 'temple',
      },
    });
    testReview = await prisma.review.create({
      data: {
        userId: user.id,
        placeId: testPlace.id,
        rating: 5,
        comment: 'Amazing place!',
      },
    });
  });

  it('GET /api/reviews should list all reviews for a place', async () => {
    const res = await request(app)
      .get(`/api/reviews?placeId=${testPlace.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/reviews should allow user to create a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        placeId: testPlace.id,
        rating: 4,
        comment: 'Nice experience',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('placeId', testPlace.id);
  });

  it('PUT /api/reviews/:id should allow user to update their review', async () => {
    const res = await request(app)
      .put(`/api/reviews/${testReview.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 3,
        comment: 'Updated comment',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rating', 3);
  });

  it('DELETE /api/reviews/:id should allow user to delete their review', async () => {
    const reviewToDelete = await prisma.review.create({
      data: {
        userId: user.id,
        placeId: testPlace.id,
        rating: 2,
        comment: 'To be deleted',
      },
    });
    const res = await request(app)
      .delete(`/api/reviews/${reviewToDelete.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
}); 