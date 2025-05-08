import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const getLocations = async (req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        trips: true,
        places: true,
      },
    });
    res.status(200).json({data: locations});
  } catch (error) {
    next(error);
  }
};

export const getLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        trips: true,
        places: true,
      },
    });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(200).json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLocation = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { name, country, description, lat, long } = req.body;
    const location = await prisma.location.create({
      data: {
        name,
        country,
        description,
        lat: parseFloat(lat),
        long: parseFloat(long),
      },
    });
    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { name, country, description } = req.body;
    const location = await prisma.location.update({
      where: { id },
      data: { name, country, description },
    });
    res.json(location);
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(500).json({ error: err.message });
  }
};