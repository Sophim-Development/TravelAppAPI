import express from 'express';
import { body } from 'express-validator';
import { authenticate, hasRole } from '../middleware/auth.js';
import {
  createBooking, getBooking, getBookings, updateBooking,
} from '../controllers/bookingController.js';
import { bookingValidation, validateBookingId, validateBookingUpdate } from '../validations/bookingValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: API for managing bookings
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 12345
 *               tripId:
 *                 type: string
 *                 example: 67890
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-05-01
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, hasRole('user'), bookingValidation, createBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get('/:id', authenticate, validateBookingId, getBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, hasRole('admin'), getBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking status (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.put('/:id', authenticate, hasRole('admin'), validateBookingUpdate, updateBooking);

export default router;