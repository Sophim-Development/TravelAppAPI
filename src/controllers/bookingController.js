import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tripId, bookingDate } = req.body;
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        tripId,
        bookingDate: new Date(bookingDate),
        status: 'pending',
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, trip: true },
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (req.user.id !== booking.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    if (req.baseUrl.includes('/v2')) {
      // Mobile API: User bookings
      const bookings = await prisma.booking.findMany({
        where: { userId: req.user.id },
        include: { trip: true },
      });
      res.json(bookings);
    } else {
      // Admin API: All bookings
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      const bookings = await prisma.booking.findMany({
        include: { user: true, trip: true },
      });
      res.json(bookings);
    }
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
};