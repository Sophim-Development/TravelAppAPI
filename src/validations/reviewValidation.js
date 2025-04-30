import { body, param } from 'express-validator';

export const validateReviewCreation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
];

export const validateReviewId = [
  param('id').isInt().withMessage('Review ID must be an integer'),
];

export const validateReviewUpdate = [
  param('id').isInt().withMessage('Review ID must be an integer'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
];