-- CreateEnum
CREATE TYPE "FlockType" AS ENUM ('LAYER', 'BROILER');

-- CreateTable
CREATE TABLE "PoultryProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "flockType" "FlockType" NOT NULL,
    "breedName" TEXT,
    "broodingDays" INTEGER,
    "growOutDays" INTEGER,
    "targetStockingDensity" DOUBLE PRECISION,
    "targetStockingDensityUnit" TEXT,
    "expectedFeedConsumptionPerBirdDay" DOUBLE PRECISION,
    "expectedEggsPerHenWeek" DOUBLE PRECISION,
    "expectedLiveWeightKg" DOUBLE PRECISION,
    "targetLayingStartDays" INTEGER,
    "targetProcessingAgeDays" INTEGER,
    "expectedMortalityPct" DOUBLE PRECISION,

    CONSTRAINT "PoultryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoultryProfile_profileId_key" ON "PoultryProfile"("profileId");

-- AddForeignKey
ALTER TABLE "PoultryProfile" ADD CONSTRAINT "PoultryProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProductionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
