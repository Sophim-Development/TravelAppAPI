import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { uploadImage } from '../utils/cloudinary.js';

const prisma = new PrismaClient();

export const getPlaces = async (req, res, next) => {
  try {
    const { locationId, category, minRating } = req.query;
    const places = await prisma.place.findMany({
      where: {
        ...(locationId && { locationId }),
        ...(category && { category }),
        ...(minRating && { averageRating: { gte: parseFloat(minRating) } }),
      },
      include: { location: true },
    });
    res.json({data: places});
  } catch (error) {
    next(error);
  }
};

export const getPlace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const placeId = parseInt(id, 10);

    if (isNaN(placeId)) {
      return res.status(400).json({ error: 'Invalid place ID format' });
    }

    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        location: true,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.status(200).json({
      id: place.id,
      name: place.name,
      description: place.description,
      category: place.category,
      imageUrl: place.imageUrl,
      location: place.location,
      reviews: place.reviews,
      reviewCount: place.reviews.length,
    });
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecommendedPlaces = async (req, res, next) => {
  try {
    const { locationId } = req.query;
    if (!locationId) {
      return res.status(400).json({ error: 'locationId is required' });
    }
    const places = await prisma.place.findMany({
      where: {
        locationId,
        averageRating: { gte: 4.0 },
      },
      orderBy: { averageRating: 'desc' },
      take: 5,
      include: { location: true },
    });
    res.json(places);
  } catch (error) {
    next(error);
  }
};

export const createPlace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, description, locationId, category } = req.body;
    let imageUrl = null;

    // Check if a file is uploaded
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    } else if (req.body.imageUrl) {
      // Use the provided imageUrl from the request body
      imageUrl = req.body.imageUrl;
    }

    // Validate that imageUrl is not null
    if (!imageUrl) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const place = await prisma.place.create({
      data: {
        name,
        description,
        category,
        imageUrl,
        location: {
          connect: { id: locationId },
        },
      },
    });

    res.status(201).json({ place });
  } catch (error) {
    console.error('Error creating place:', error);
    next(error);
  }
};

export const updatePlace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { name, description, locationId, category } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    } else {
      imageUrl = req.body.imageUrl;
    }
    if (!imageUrl) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const place = await prisma.place.update({
      where: { id },
      data: {
        name,
        description,
        locationId,
        category,
        ...(imageUrl && { imageUrl }),
      },
    });
    res.json(place);
  } catch (error) {
    next(error);
  }
};

export const deletePlace = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await prisma.place.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const uploadPlaceImage = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const { id } = req.params;
    const imageUrl = await uploadImage(req.file);
    const place = await prisma.place.update({
      where: { id },
      data: { imageUrl },
    });
    res.json({ imageUrl });
  } catch (error) {
    next(error);
  }
};