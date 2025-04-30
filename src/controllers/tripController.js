import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        location: true,
        bookings: true,
      },
    });
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const getTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(id, 10) },
      include: { location: true },
    });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, locationId, type, startDate, endDate, price } = req.body;
    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        locationId: parseInt(locationId, 10),
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, description, locationId, type, startDate, endDate, price } = req.body;
    const trip = await prisma.trip.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        description,
        locationId: parseInt(locationId, 10),
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
      },
    });
    res.json(trip);
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await prisma.trip.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};