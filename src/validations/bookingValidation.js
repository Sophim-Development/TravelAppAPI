import { body, param } from 'express-validator';

export const bookingValidation = [
  body('tripId')
    .isInt().withMessage('Trip ID must be an integer')
    .notEmpty().withMessage('Trip ID is required'),
  body('bookingDate')
    .isISO8601().withMessage('Booking date must be a valid ISO8601 date')
    .notEmpty().withMessage('Booking date is required'),
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled']).withMessage('Status must be one of pending, confirmed, or cancelled')
    .notEmpty().withMessage('Status is required'),
  body('userId')
    .isUUID().withMessage('User ID must be a valid UUID')
    .notEmpty().withMessage('User ID is required'),
];

export const validateBookingId = [
  param('id')
    .isInt().withMessage('Booking ID must be an integer')
    .notEmpty().withMessage('Booking ID is required'),
];

export const validateBookingUpdate = [
  param('id')
    .isInt().withMessage('Booking ID must be an integer')
    .notEmpty().withMessage('Booking ID is required'),
  body('tripId')
    .optional()
    .isInt().withMessage('Trip ID must be an integer'),
  body('bookingDate')
    .optional()
    .isISO8601().withMessage('Booking date must be a valid ISO8601 date'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled']).withMessage('Status must be one of pending, confirmed, or cancelled'),
];
