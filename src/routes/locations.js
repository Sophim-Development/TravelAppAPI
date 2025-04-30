import express from 'express';
import { authenticate, hasRole } from '../middleware/auth.js';
import { body } from 'express-validator';
import {
  createLocation, updateLocation, deleteLocation, getLocations, getLocation
} from '../controllers/locationController.js';
import { validateLocationCreation, validateLocationId, validateLocationUpdate } from '../validations/locationValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: API for managing locations
 */

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all locations (Accessible to all roles)
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of locations retrieved successfully
 *       400:
 *         description: Validation error
 */
router.get('/', getLocations);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a location by ID (Accessible to all roles)
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location retrieved successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Location not found
 */
router.get('/:id', validateLocationId, getLocation);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a location by ID (Accessible to all roles)
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location retrieved successfully
 *       400:
 *         description: Validation error
 */ 
router.get('/:id',validateLocationId, getLocation);

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Create a new location (Admin only)
 *     tags: [Locations]
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
 *                 example: Paris
 *               country:
 *                 type: string
 *                 example: France
 *               description:
 *                 type: string
 *                 example: A beautiful city known for its art, fashion, and culture.
 *     responses:
 *       201:
 *         description: Location created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, hasRole('admin'), validateLocationCreation, createLocation);

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update a location (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Paris
 *               country:
 *                 type: string
 *                 example: France
 *               description:
 *                 type: string
 *                 example: A beautiful city known for its art, fashion, and culture.
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Location not found
 */
router.put('/:id', authenticate, hasRole('admin'), validateLocationUpdate, updateLocation);

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete a location (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Location not found
 */
router.delete('/:id', authenticate, hasRole('admin'), deleteLocation);

export default router;