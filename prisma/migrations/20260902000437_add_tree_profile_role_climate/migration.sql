-- CreateEnum
CREATE TYPE "VegetationRole" AS ENUM ('BIOMASS', 'TARGET', 'BOTH');

-- CreateEnum
CREATE TYPE "ClimateSuitability" AS ENUM ('TROPICAL', 'SUBTROPICAL', 'TEMPERATE');

-- AlterTable
ALTER TABLE "TreeProfile" ADD COLUMN     "climateSuitability" "ClimateSuitability" NOT NULL DEFAULT 'SUBTROPICAL',
ADD COLUMN     "role" "VegetationRole" NOT NULL DEFAULT 'TARGET',
ADD COLUMN     "successionWave" INTEGER;
