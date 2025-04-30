import express from 'express';
import { authenticate, hasRole } from '../middleware/auth.js';
import { body } from 'express-validator';
import { singleUpload } from '../middleware/upload.js';
import {
  createPlace, updatePlace, deletePlace, uploadPlaceImage, getPlaces, getPlace
} from '../controllers/placeController.js';
import { validatePlaceCreation, validatePlaceId, validatePlaceUpdate } from '../validations/placeValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Places
 *   description: API for managing places
 */

/**
 * @swagger
 * /places:
 *   get:
 *     summary: Get all places (Accessible to all roles)
 *     tags: [Places]
 *     responses:
 *       200:
 *         description: List of places retrieved successfully
 *       400:
 *         description: Validation error
 */
router.get('/', getPlaces);

/**
 * @swagger
 * /places/{id}:
 *   get:
 *     summary: Get a place by ID (Accessible to all roles)
 *     tags: [Places]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *     responses:
 *       200:
 *         description: Place retrieved successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Place not found
 */
router.get('/:id', validatePlaceId, getPlace);

/**
 * @swagger
 * /places:
 *   post:
 *     summary: Create a new place (Admin only)
 *     tags: [Places]
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
 *                 example: Eiffel Tower
 *               description:
 *                 type: string
 *                 example: A famous landmark in Paris.
 *               locationId:
 *                 type: string
 *                 example: 12345
 *               category:
 *                 type: string
 *                 enum: [temple, beach, restaurant, market, other]
 *                 example: landmark
 *     responses:
 *       201:
 *         description: Place created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, hasRole('admin'), validatePlaceCreation, createPlace);

/**
 * @swagger
 * /places/{id}:
 *   put:
 *     summary: Update a place (Admin only)
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Eiffel Tower
 *               description:
 *                 type: string
 *                 example: A famous landmark in Paris.
 *               locationId:
 *                 type: string
 *                 example: 12345
 *               category:
 *                 type: string
 *                 enum: [temple, beach, restaurant, market, other]
 *                 example: landmark
 *     responses:
 *       200:
 *         description: Place updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Place not found
 */
router.put('/:id', authenticate, hasRole('admin'), singleUpload, validatePlaceUpdate, updatePlace);

/**
 * @swagger
 * /places/{id}:
 *   delete:
 *     summary: Delete a place (Admin only)
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *     responses:
 *       200:
 *         description: Place deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Place not found
 */
router.delete('/:id', authenticate, hasRole('admin'), deletePlace);

/**
 * @swagger
 * /places/{id}/upload:
 *   post:
 *     summary: Upload an image for a place (Admin only)
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Place not found
 */
router.post('/:id/upload', authenticate, hasRole('admin'), singleUpload, uploadPlaceImage);

export default router;