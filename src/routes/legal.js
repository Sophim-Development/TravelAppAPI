import express from 'express';
import { authenticate, hasRole } from '../middleware/auth.js';
import {
  getPrivacyPolicies,
  getActivePrivacyPolicy,
  createPrivacyPolicy,
  getTermsOfService,
  getActiveTermsOfService,
  createTermsOfService
} from '../controllers/legalController.js';
import {
  validatePrivacyPolicy,
  validateTermsOfService
} from '../validations/legalValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Legal
 *   description: API for managing legal documents
 */

/**
 * @swagger
 * /legal/privacy-policy:
 *   get:
 *     summary: Get all privacy policies (Admin only)
 *     tags: [Legal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of privacy policies retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/privacy-policy', authenticate, hasRole('admin'), getPrivacyPolicies);

/**
 * @swagger
 * /legal/privacy-policy/active:
 *   get:
 *     summary: Get the active privacy policy (Public)
 *     tags: [Legal]
 *     responses:
 *       200:
 *         description: Active privacy policy retrieved successfully
 *       404:
 *         description: No active privacy policy found
 */
router.get('/privacy-policy/active', getActivePrivacyPolicy);

/**
 * @swagger
 * /legal/privacy-policy:
 *   post:
 *     summary: Create a new privacy policy (Admin only)
 *     tags: [Legal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *                 example: "1.0"
 *               content:
 *                 type: string
 *                 example: "Privacy policy content..."
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Privacy policy created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/privacy-policy', authenticate, hasRole('admin'), validatePrivacyPolicy, createPrivacyPolicy);

/**
 * @swagger
 * /legal/terms-of-service:
 *   get:
 *     summary: Get all terms of service (Admin only)
 *     tags: [Legal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of terms of service retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/terms-of-service', authenticate, hasRole('admin'), getTermsOfService);

/**
 * @swagger
 * /legal/terms-of-service/active:
 *   get:
 *     summary: Get the active terms of service (Public)
 *     tags: [Legal]
 *     responses:
 *       200:
 *         description: Active terms of service retrieved successfully
 *       404:
 *         description: No active terms of service found
 */
router.get('/terms-of-service/active', getActiveTermsOfService);

/**
 * @swagger
 * /legal/terms-of-service:
 *   post:
 *     summary: Create a new terms of service (Admin only)
 *     tags: [Legal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *                 example: "1.0"
 *               content:
 *                 type: string
 *                 example: "Terms of service content..."
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Terms of service created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/terms-of-service', authenticate, hasRole('admin'), validateTermsOfService, createTermsOfService);

export default router; 