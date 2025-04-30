import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBookingAnalytics = async () => {
  const bookings = await prisma.booking.groupBy({
    by: ['tripId'],
    _count: { id: true },
  });

  const analytics = await Promise.all(bookings.map(async (b) => {
    const trip = await prisma.trip.findUnique({
      where: { id: b.tripId },
      include: { location: true },
    });
    const places = await prisma.place.findMany({
      where: { locationId: trip.locationId },
    });
    const averagePlaceRating = places.length > 0
      ? places.reduce((sum, p) => sum + (p.averageRating || 0), 0) / places.length
      : null;

    return {
      locationId: trip.locationId,
      locationName: trip.location.name,
      bookingCount: b._count.id,
      averagePlaceRating,
    };
  }));

  return analytics;
};