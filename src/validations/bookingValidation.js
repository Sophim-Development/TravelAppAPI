import { body, param } from 'express-validator';

export const bookingValidation = [
  body('tripId')
    .isString().isUUID().withMessage('Trip ID must be a valid UUID')
    .notEmpty().withMessage('Trip ID is required'),
  body('guests')
    .isInt({ min: 1 }).withMessage('Guests must be a positive integer')
    .notEmpty().withMessage('Guests is required'),
  body('total')
    .isFloat({ min: 0 }).withMessage('Total must be a positive number')
    .notEmpty().withMessage('Total is required'),
];

export const validateBookingId = [
  param('id')
    .isString().isUUID().withMessage('Booking ID must be a valid UUID')
    .notEmpty().withMessage('Booking ID is required'),
];

export const validateBookingUpdate = [
  param('id')
    .isString().isUUID().withMessage('Booking ID must be a valid UUID')
    .notEmpty().withMessage('Booking ID is required'),
  body('tripId')
    .optional()
    .isString().isUUID().withMessage('Trip ID must be a valid UUID'),
  body('bookingDate')
    .optional()
    .isISO8601().withMessage('Booking date must be a valid ISO8601 date'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled']).withMessage('Status must be one of pending, confirmed, or cancelled'),
];
