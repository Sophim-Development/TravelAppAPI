import express from 'express';
import userRoutes from './users.js';
import locationRoutes from './locations.js';
import placeRoutes from './places.js';
import reviewRoutes from './reviews.js';
import bookingsRoutes from './bookings.js';

const router = express.Router();

// Use modularized routes under the /admin prefix
router.use('/users', userRoutes);
router.use('/locations', locationRoutes);
router.use('/places', placeRoutes);
router.use('/reviews', reviewRoutes);
router.use('/bookings', bookingsRoutes);

export default router;