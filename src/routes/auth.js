import express from 'express';
import passport from 'passport';
import { validateLogin, validateRegister } from '../validations/authValidation.js';
import { login, register, socialAuthCallback } from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Validation error
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', validateRegister, register);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google authentication
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successful authentication
 */
router.get('/google/callback', socialAuthCallback.bind({ params: { provider: 'google' } }));

/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Authenticate with Facebook
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Facebook authentication
 */
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

/**
 * @swagger
 * /auth/facebook/callback:
 *   get:
 *     summary: Facebook authentication callback
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successful authentication
 */
router.get('/facebook/callback', socialAuthCallback.bind({ params: { provider: 'facebook' } }));

/**
 * @swagger
 * /auth/apple:
 *   get:
 *     summary: Authenticate with Apple
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Apple authentication
 */
router.get('/apple', passport.authenticate('apple'));

/**
 * @swagger
 * /auth/apple/callback:
 *   get:
 *     summary: Apple authentication callback
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successful authentication
 */
router.get('/apple/callback', socialAuthCallback.bind({ params: { provider: 'apple' } }));

export default router;