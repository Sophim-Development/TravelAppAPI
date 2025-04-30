import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/index.js';

const prisma = new PrismaClient();

describe('Public API Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();

    // Clear and seed the database
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.place.deleteMany(),
    ]);

    // Seed places
    await prisma.place.createMany({
      data: [
        { name: 'Place 1', description: 'Description 1', location: 'City 1', type: 'city', isApproved: true },
        { name: 'Place 2', description: 'Description 2', location: 'City 2', type: 'beach', isApproved: true },
      ],
    });

    // Seed reviews
    await prisma.review.createMany({
      data: [
        { rating: 5, comment: 'Great place!', placeId: 1 },
        { rating: 4, comment: 'Nice experience!', placeId: 2 },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test: Fetch all places
   * Endpoint: GET /places
   */
  it('GET /places should return all approved places', async () => {
    const res = await request(app).get('/places');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  /**
   * Test: Fetch all trips
   * Endpoint: GET /trips
   */
  it('GET /trips should return all trips', async () => {
    const res = await request(app).get('/trips');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  /**
   * Test: Fetch all reviews
   * Endpoint: GET /reviews
   */
  it('GET /reviews should return all reviews', async () => {
    const res = await request(app).get('/reviews');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});