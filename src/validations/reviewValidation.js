import { body, param } from 'express-validator';

export const validateReviewCreation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
];

export const validateReviewId = [
  param('id').isString().withMessage('Review ID must be a string'),
];

export const validateReviewUpdate = [
  param('id').isString().withMessage('Review ID must be a string'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
];