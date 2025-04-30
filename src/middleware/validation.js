import { logger } from '../utils/logger.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        logger.warn('Validation error:', error.details[0].message);
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }
      next();
    } catch (err) {
      logger.error('Validation middleware error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation',
      });
    }
  };
}; 