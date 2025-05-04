import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const getPrivacyPolicies = async (req, res) => {
  try {
    const policies = await prisma.privacyPolicy.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch privacy policies' });
  }
};

export const getActivePrivacyPolicy = async (req, res) => {
  try {
    const policy = await prisma.privacyPolicy.findFirst({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' }
    });
    if (!policy) {
      return res.status(404).json({ error: 'No active privacy policy found' });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active privacy policy' });
  }
};

export const createPrivacyPolicy = async (req, res) => {
  try {
    const { version, content, isActive } = req.body;

    if (isActive) {
      // Deactivate all other policies
      await prisma.privacyPolicy.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const policy = await prisma.privacyPolicy.create({
      data: {
        version,
        content,
        isActive,
        publishedAt: isActive ? new Date() : null
      }
    });
    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create privacy policy' });
  }
};

export const getTermsOfService = async (req, res) => {
  try {
    const terms = await prisma.termsOfService.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(terms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch terms of service' });
  }
};

export const getActiveTermsOfService = async (req, res) => {
  try {
    const terms = await prisma.termsOfService.findFirst({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' }
    });
    if (!terms) {
      return res.status(404).json({ error: 'No active terms of service found' });
    }
    res.json(terms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active terms of service' });
  }
};

export const createTermsOfService = async (req, res) => {
  try {
    const { version, content, isActive } = req.body;

    if (isActive) {
      // Deactivate all other terms
      await prisma.termsOfService.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const terms = await prisma.termsOfService.create({
      data: {
        version,
        content,
        isActive,
        publishedAt: isActive ? new Date() : null
      }
    });
    res.status(201).json(terms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create terms of service' });
  }
}; 