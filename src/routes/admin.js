import express from 'express';
import userRoutes from './users.js';
import locationRoutes from './locations.js';
import placeRoutes from './places.js';
import reviewRoutes from './reviews.js';

const router = express.Router();

// Use modularized routes under the /admin prefix
router.use('/users', userRoutes);
router.use('/locations', locationRoutes);
router.use('/places', placeRoutes);
router.use('/reviews', reviewRoutes);

export default router;