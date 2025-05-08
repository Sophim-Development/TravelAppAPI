import { body, param } from 'express-validator';

export const validateLocationCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('lat').isFloat().withMessage('Latitude must be a valid float'),
  body('long').isFloat().withMessage('Longitude must be a valid float'),
];

export const validateLocationId = [
  param('id').isUUID().withMessage('Location ID must be a UUID'),
];

export const validateLocationUpdate = [
  param('id').isUUID().withMessage('Location ID must be a UUID'),
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('country').optional().notEmpty().withMessage('Country is required'),
  body('description').optional().notEmpty().withMessage('Description is required'),
  body('lat').optional().isFloat().withMessage('Latitude must be a valid float'),
  body('long').optional().isFloat().withMessage('Longitude must be a valid float'),
];