import { body, param } from 'express-validator';

export const validateUserCreation = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['admin', 'super_admin', 'user']).withMessage('Role must be one of admin, owner, or user'),
];

export const validateUserId = [
  param('id').isInt().withMessage('User ID must be an integer'),
];