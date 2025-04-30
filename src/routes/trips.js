import express from 'express';
import { authenticate, hasRole } from '../middleware/auth.js';
import {
  getTrips, getTrip, createTrip, updateTrip, deleteTrip,
} from '../controllers/tripController.js';
import { validateTripCreation, validateTripId } from '../validations/tripValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: API for managing trips
 */

/**
 * @swagger
 * /trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: List of trips retrieved successfully
 *       400:
 *         description: Validation error
 */
router.get('/', getTrips);

/**
 * @swagger
 * /trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip retrieved successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Trip not found
 */
router.get('/:id', validateTripId, getTrip);

/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Create a new trip (Admin only)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Safari Adventure"
 *               description:
 *                 type: string
 *                 example: "An exciting safari trip."
 *               price:
 *                 type: number
 *                 example: 499.99
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-10"
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, hasRole('admin'), validateTripCreation, createTrip);

/**
 * @swagger
 * /trips/{id}:
 *   put:
 *     summary: Update a trip (Admin only)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Safari Adventure"
 *               description:
 *                 type: string
 *                 example: "An updated description of the safari trip."
 *               price:
 *                 type: number
 *                 example: 599.99
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-05"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-15"
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.put('/:id', authenticate, hasRole('admin'), updateTrip);

/**
 * @swagger
 * /trips/{id}:
 *   delete:
 *     summary: Delete a trip (Admin only)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.delete('/:id', authenticate, hasRole('admin'), deleteTrip);

export default router;