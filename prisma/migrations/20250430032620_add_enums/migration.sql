/*
  Warnings:

  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `imageUrl` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Place` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Trip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'owner', 'user');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('bus', 'hotel', 'train', 'flight', 'car', 'boat', 'bike', 'motobike', 'other');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('temple', 'beach', 'restaurant', 'market', 'other');

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "imageUrl" TEXT NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "PlaceCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "type",
ADD COLUMN     "type" "TripType" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';
