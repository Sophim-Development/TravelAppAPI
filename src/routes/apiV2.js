import express from 'express';
import bookingsRoutes from './bookings.js';
import placesRoutes from './places.js';
import reviewsRoutes from './reviews.js';
import locationsRoutes from './locations.js';
import usersRoutes from './users.js';
import tripsRoutes from './trips.js';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';

const apiV2Routes = express.Router();

// Use the modularized routes
apiV2Routes.use('/bookings', bookingsRoutes);
apiV2Routes.use('/places', placesRoutes);
apiV2Routes.use('/reviews', reviewsRoutes);
apiV2Routes.use('/locations', locationsRoutes);
apiV2Routes.use('/users', usersRoutes);
apiV2Routes.use('/trips', tripsRoutes);
apiV2Routes.use('/auth', authRoutes);
apiV2Routes.use('/admin', adminRoutes);

export default apiV2Routes;