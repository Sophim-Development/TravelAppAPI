import { body, param } from 'express-validator';

export const validatePlaceCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('locationId').isInt().withMessage('Location ID must be an integer'),
  body('category').isIn(['temple', 'beach', 'restaurant', 'market', 'other']).withMessage('Invalid category'),
];

export const validatePlaceId = [
  param('id').isInt().withMessage('Place ID must be an integer'),
];

export const validatePlaceUpdate = [
  param('id').isInt().withMessage('Place ID must be an integer'),
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('description').optional().notEmpty().withMessage('Description is required'),
  body('locationId').optional().isInt().withMessage('Location ID must be an integer'),
  body('category').optional().isIn(['temple', 'beach', 'restaurant', 'market', 'other']).withMessage('Invalid category'),
];