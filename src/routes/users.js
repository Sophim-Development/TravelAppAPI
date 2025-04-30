import express from 'express';
import { authenticate, hasRole } from '../middleware/auth.js';
import { createUser, getUser } from '../controllers/userController.js';
import { validateUserCreation, validateUserId } from '../validations/userValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users (Super Admin only)
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (Super Admin only)
 *     tags: [Users]
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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, admin, super_admin]
 *                 example: admin
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, hasRole('super_admin'), validateUserCreation, createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, hasRole('super_admin'), validateUserId, getUser);

export default router;