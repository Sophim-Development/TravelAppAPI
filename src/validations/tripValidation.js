import { body, param } from 'express-validator';

export const validateTripCreation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('locationId').isString().notEmpty().withMessage('Location ID must be a string'),
  body('type').isIn(['bus', 'hotel']).withMessage('Type must be either "bus" or "hotel"'),
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO8601 date'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

export const validateTripId = [
  param('id').isString().notEmpty().withMessage('Trip ID must be a string'),
];