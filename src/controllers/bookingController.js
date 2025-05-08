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

    const { tripId, guests, total, userId } = req.body;
    // Only allow booking for self
    if (userId && userId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot book for another user' });
    }
    // Check if trip exists
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(400).json({ error: 'Trip does not exist' });
    }
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        tripId,
        guests,
        total,
        status: 'pending',
        bookingDate: new Date(),
      },
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    // Check if booking exists first
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });
    res.status(200).json(booking);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(500).json({ error: err.message });
  }
};