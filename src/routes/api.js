import express from 'express';
import bookingsRoutes from './bookings.js';
import placesRoutes from './places.js';
import reviewsRoutes from './reviews.js';
import locationsRoutes from './locations.js';
import usersRoutes from './users.js';
import tripsRoutes from './trips.js';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import legalRoutes from './legal.js';

const apiRoutes = express.Router();

// Use the modularized routes
apiRoutes.use('/bookings', bookingsRoutes);
apiRoutes.use('/places', placesRoutes);
apiRoutes.use('/reviews', reviewsRoutes);
apiRoutes.use('/locations', locationsRoutes);
apiRoutes.use('/users', usersRoutes);
apiRoutes.use('/trips', tripsRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/admin', adminRoutes);
apiRoutes.use('/legal', legalRoutes);

export default apiRoutes;