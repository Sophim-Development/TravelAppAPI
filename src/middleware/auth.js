import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const roleHierarchy = {
  super_admin: 3,
  admin: 2,
  user: 1,
};

export const hasRole = (requiredRole) => (req, res, next) => {
  if (!req.user || roleHierarchy[req.user.role] < roleHierarchy[requiredRole]) {
    return res.status(403).json({ error: 'Forbidden: Insufficient role' });
  }
  next();
};