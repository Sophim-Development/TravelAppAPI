import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { uploadImage } from '../utils/cloudinary.js';

const prisma = new PrismaClient();

export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { placeId, rating, comment } = req.body;
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map(file => uploadImage(file)));
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        placeId,
        rating: parseInt(rating),
        comment,
        imageUrls,
      },
    });

    // Update average rating
    const reviews = await prisma.review.findMany({ where: { placeId } });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.place.update({
      where: { id: placeId },
      data: { averageRating },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }
    const reviews = await prisma.review.findMany({
      where: { placeId },
      include: { user: { select: { name: true } } },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { rating, comment } = req.body;
    let imageUrls = review.imageUrls || [];
    if (req.files && req.files.length > 0) {
      const newUrls = await Promise.all(req.files.map(file => uploadImage(file)));
      imageUrls = [...imageUrls, ...newUrls];
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating: parseInt(rating), comment, imageUrls },
    });

    // Update average rating
    const reviews = await prisma.review.findMany({ where: { placeId: review.placeId } });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.place.update({
      where: { id: review.placeId },
      data: { averageRating },
    });

    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({ where: { id } });

    // Update average rating
    const reviews = await prisma.review.findMany({ where: { placeId: review.placeId } });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;
    await prisma.place.update({
      where: { id: review.placeId },
      data: { averageRating },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const uploadReviewImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const imageUrls = await Promise.all(req.files.map(file => uploadImage(file)));
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { imageUrls: [...(review.imageUrls || []), ...imageUrls] },
    });

    res.json({ imageUrls: updatedReview.imageUrls });
  } catch (error) {
    next(error);
  }
};