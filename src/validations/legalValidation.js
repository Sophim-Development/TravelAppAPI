import { body } from 'express-validator';

export const validatePrivacyPolicy = [
  body('version')
    .notEmpty()
    .withMessage('Version is required')
    .isString()
    .withMessage('Version must be a string'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const validateTermsOfService = [
  body('version')
    .notEmpty()
    .withMessage('Version is required')
    .isString()
    .withMessage('Version must be a string'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
]; 