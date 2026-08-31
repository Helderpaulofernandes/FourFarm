-- CreateEnum
CREATE TYPE "CanopyStratum" AS ENUM ('EMERGENT', 'HIGH', 'MEDIUM', 'LOW', 'SHRUB', 'GROUND_COVER', 'CLIMBER');

-- CreateEnum
CREATE TYPE "SuccessionalStage" AS ENUM ('PLACENTA', 'SECONDARY', 'CLIMAX');

-- CreateTable
CREATE TABLE "TreeProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "canopyStratum" "CanopyStratum" NOT NULL,
    "successionalStage" "SuccessionalStage" NOT NULL,
    "matureHeightM" DOUBLE PRECISION,
    "matureSpreadM" DOUBLE PRECISION,
    "withinRowSpacingM" DOUBLE PRECISION,
    "betweenRowSpacingM" DOUBLE PRECISION,
    "yearsToFirstYield" DOUBLE PRECISION,
    "nitrogenFixer" BOOLEAN NOT NULL DEFAULT false,
    "chopAndDropCandidate" BOOLEAN NOT NULL DEFAULT false,
    "pruningFrequencyMonths" INTEGER,

    CONSTRAINT "TreeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TreeProfile_profileId_key" ON "TreeProfile"("profileId");

-- AddForeignKey
ALTER TABLE "TreeProfile" ADD CONSTRAINT "TreeProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProductionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
