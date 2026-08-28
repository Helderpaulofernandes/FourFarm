-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('BED', 'TRACTOR');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESTING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OccupantType" AS ENUM ('CROP_PLANTING', 'BIRD_BATCH');

-- CreateEnum
CREATE TYPE "OccupancyStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PropagationMethod" AS ENUM ('DIRECT_SEED', 'TRANSPLANT', 'BOTH');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('WET', 'DRY');

-- CreateEnum
CREATE TYPE "InputCategory" AS ENUM ('COMPOST', 'CONDITIONER', 'AMENDMENT', 'FEED', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('CROP', 'LIVESTOCK');

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "propagationMethod" "PropagationMethod" NOT NULL DEFAULT 'TRANSPLANT',
    "daysToMaturityMin" INTEGER NOT NULL,
    "daysToMaturityMax" INTEGER NOT NULL,
    "spacingCm" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtectionMethod" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ProtectionMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropProtectionMethod" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "protectionMethodId" TEXT NOT NULL,
    "season" "Season",

    CONSTRAINT "CropProtectionMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropSeasonalMultiplier" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "season" "Season" NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CropSeasonalMultiplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputMaterial" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InputCategory" NOT NULL,
    "unit" TEXT NOT NULL,
    "costPerUnit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InputMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowingUnit" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "unitType" "UnitType" NOT NULL,
    "label" TEXT NOT NULL,
    "gridX" INTEGER,
    "gridY" INTEGER,
    "lengthM" DOUBLE PRECISION,
    "widthM" DOUBLE PRECISION,
    "capacity" INTEGER,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowingUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occupancy" (
    "id" TEXT NOT NULL,
    "growingUnitId" TEXT NOT NULL,
    "occupantType" "OccupantType" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "status" "OccupancyStatus" NOT NULL DEFAULT 'ACTIVE',
    "successionNo" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Occupancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropPlanting" (
    "id" TEXT NOT NULL,
    "occupancyId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "propagationMethod" "PropagationMethod" NOT NULL,
    "sownAt" TIMESTAMP(3),
    "transplantedAt" TIMESTAMP(3),
    "expectedHarvestAt" TIMESTAMP(3),

    CONSTRAINT "CropPlanting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifecycleEvent" (
    "id" TEXT NOT NULL,
    "occupancyId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "photoUrl" TEXT,
    "createdById" TEXT,

    CONSTRAINT "LifecycleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputApplication" (
    "id" TEXT NOT NULL,
    "occupancyId" TEXT NOT NULL,
    "inputMaterialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "costSnapshot" DOUBLE PRECISION NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InputApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "unit" TEXT NOT NULL,
    "publicVisible" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestRecord" (
    "id" TEXT NOT NULL,
    "occupancyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "harvestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HarvestRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_farmId_idx" ON "User"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Crop_farmId_idx" ON "Crop"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_farmId_name_variety_key" ON "Crop"("farmId", "name", "variety");

-- CreateIndex
CREATE INDEX "ProtectionMethod_farmId_idx" ON "ProtectionMethod"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "ProtectionMethod_farmId_name_key" ON "ProtectionMethod"("farmId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CropProtectionMethod_cropId_protectionMethodId_season_key" ON "CropProtectionMethod"("cropId", "protectionMethodId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "CropSeasonalMultiplier_cropId_season_key" ON "CropSeasonalMultiplier"("cropId", "season");

-- CreateIndex
CREATE INDEX "InputMaterial_farmId_idx" ON "InputMaterial"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "InputMaterial_farmId_name_key" ON "InputMaterial"("farmId", "name");

-- CreateIndex
CREATE INDEX "GrowingUnit_farmId_idx" ON "GrowingUnit"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowingUnit_farmId_label_key" ON "GrowingUnit"("farmId", "label");

-- CreateIndex
CREATE INDEX "Occupancy_growingUnitId_idx" ON "Occupancy"("growingUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "CropPlanting_occupancyId_key" ON "CropPlanting"("occupancyId");

-- CreateIndex
CREATE INDEX "CropPlanting_cropId_idx" ON "CropPlanting"("cropId");

-- CreateIndex
CREATE INDEX "LifecycleEvent_occupancyId_idx" ON "LifecycleEvent"("occupancyId");

-- CreateIndex
CREATE INDEX "InputApplication_occupancyId_idx" ON "InputApplication"("occupancyId");

-- CreateIndex
CREATE INDEX "InputApplication_inputMaterialId_idx" ON "InputApplication"("inputMaterialId");

-- CreateIndex
CREATE INDEX "Product_farmId_idx" ON "Product"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_farmId_name_key" ON "Product"("farmId", "name");

-- CreateIndex
CREATE INDEX "HarvestRecord_occupancyId_idx" ON "HarvestRecord"("occupancyId");

-- CreateIndex
CREATE INDEX "HarvestRecord_productId_idx" ON "HarvestRecord"("productId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionMethod" ADD CONSTRAINT "ProtectionMethod_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropProtectionMethod" ADD CONSTRAINT "CropProtectionMethod_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropProtectionMethod" ADD CONSTRAINT "CropProtectionMethod_protectionMethodId_fkey" FOREIGN KEY ("protectionMethodId") REFERENCES "ProtectionMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSeasonalMultiplier" ADD CONSTRAINT "CropSeasonalMultiplier_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputMaterial" ADD CONSTRAINT "InputMaterial_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingUnit" ADD CONSTRAINT "GrowingUnit_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occupancy" ADD CONSTRAINT "Occupancy_growingUnitId_fkey" FOREIGN KEY ("growingUnitId") REFERENCES "GrowingUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPlanting" ADD CONSTRAINT "CropPlanting_occupancyId_fkey" FOREIGN KEY ("occupancyId") REFERENCES "Occupancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPlanting" ADD CONSTRAINT "CropPlanting_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifecycleEvent" ADD CONSTRAINT "LifecycleEvent_occupancyId_fkey" FOREIGN KEY ("occupancyId") REFERENCES "Occupancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplication" ADD CONSTRAINT "InputApplication_occupancyId_fkey" FOREIGN KEY ("occupancyId") REFERENCES "Occupancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplication" ADD CONSTRAINT "InputApplication_inputMaterialId_fkey" FOREIGN KEY ("inputMaterialId") REFERENCES "InputMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestRecord" ADD CONSTRAINT "HarvestRecord_occupancyId_fkey" FOREIGN KEY ("occupancyId") REFERENCES "Occupancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestRecord" ADD CONSTRAINT "HarvestRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
