-- CreateEnum
CREATE TYPE "Kingdom" AS ENUM ('PLANT', 'ANIMAL', 'FUNGI');

-- CreateEnum
CREATE TYPE "LifeCycle" AS ENUM ('ANNUAL', 'BIENNIAL', 'PERENNIAL');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('CULTIVAR', 'BREED', 'STRAIN');

-- CreateEnum
CREATE TYPE "RotationGroup" AS ENUM ('ROOT', 'ALLIUM', 'FRUIT', 'LEGUME', 'LEAF');

-- CreateEnum
CREATE TYPE "ProductionSystem" AS ENUM ('NURSERY', 'MARKET_GARDEN', 'FOREST', 'LAYERS', 'BROILERS');

-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('BED', 'NURSERY_BENCH', 'TRACTOR', 'FOREST_ROW', 'COOP', 'PADDOCK');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('ESTIMATED', 'TESTED', 'VALIDATED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('SUPPLIER', 'LITERATURE', 'OWN_TRIAL');

-- CreateEnum
CREATE TYPE "MaturityBasis" AS ENUM ('FROM_SOWING', 'FROM_TRANSPLANT');

-- CreateEnum
CREATE TYPE "Suitability" AS ENUM ('PREFERRED', 'POSSIBLE', 'AVOID');

-- CreateEnum
CREATE TYPE "AnchorType" AS ENUM ('SEED_DATE', 'TARGET_HARVEST', 'HATCH_DATE');

-- CreateEnum
CREATE TYPE "SchedulingDirection" AS ENUM ('FORWARD', 'BACKWARD');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SOW', 'GERMINATION_CHECK', 'POT_UP', 'HARDEN_OFF', 'TRANSPLANT', 'WATER', 'FERTILIZE', 'PEST_TREATMENT', 'WEED', 'PRUNE', 'TRELLIS', 'MULCH', 'HARVEST', 'MOVE', 'FEED', 'COLLECT_EGGS', 'MORTALITY', 'OBSERVATION', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('FINISH_TO_START');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('TIME', 'CONDITION', 'OBSERVATION');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PLANNED', 'SEEDED', 'IN_NURSERY', 'READY_TO_TRANSPLANT', 'TRANSPLANTED', 'GROWING', 'HARVESTING', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PublicStatus" AS ENUM ('PRIVATE', 'CANDIDATE', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('SOWN', 'TRANSPLANTED', 'MOVED', 'GRAZED');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PLANNED', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('SEED', 'FEED', 'COMPOST', 'CONDITIONER', 'AMENDMENT', 'PACKAGING', 'PRODUCT', 'OTHER');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('AVAILABLE', 'QUARANTINED', 'EXHAUSTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'PLANNER', 'FIELD_WORKER', 'ADMIN');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Brisbane',
    "climateZone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "defaultAreaUnit" TEXT NOT NULL DEFAULT 'm2',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FIELD_WORKER',
    "passwordHash" TEXT,

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
CREATE TABLE "ProductionArea" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "parentAreaId" TEXT,
    "areaType" "AreaType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gridX" INTEGER,
    "gridY" INTEGER,
    "lengthM" DOUBLE PRECISION,
    "widthM" DOUBLE PRECISION,
    "areaM2" DOUBLE PRECISION,
    "capacity" INTEGER,
    "capacityUnit" TEXT,
    "soilType" TEXT,
    "activeFrom" TIMESTAMP(3),
    "activeTo" TIMESTAMP(3),
    "publicVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "kingdom" "Kingdom" NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT,
    "family" TEXT,
    "lifeCycle" "LifeCycle",
    "nativeStatus" TEXT,
    "primaryRole" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarietyBreed" (
    "id" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recordType" "RecordType" NOT NULL DEFAULT 'CULTIVAR',
    "rotationGroup" "RotationGroup",
    "openPollinated" BOOLEAN,
    "hybrid" BOOLEAN,
    "heirloom" BOOLEAN,
    "typicalColour" TEXT,
    "typicalMatureSize" TEXT,
    "publicDescription" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VarietyBreed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionMethod" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productionSystem" "ProductionSystem" NOT NULL,
    "internalDescription" TEXT,
    "publicDescription" TEXT,
    "certificationRelevant" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductionMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionProfile" (
    "id" TEXT NOT NULL,
    "varietyBreedId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "locationOrClimateZone" TEXT,
    "nurseryRequired" BOOLEAN NOT NULL DEFAULT false,
    "targetNurseryDays" INTEGER,
    "targetProductionDays" INTEGER,
    "targetHarvestStartDays" INTEGER,
    "targetHarvestWindowDays" INTEGER,
    "expectedSurvivalPct" DOUBLE PRECISION,
    "expectedYieldValue" DOUBLE PRECISION,
    "expectedYieldUnit" TEXT,
    "sourceType" "SourceType",
    "sourceReference" TEXT,
    "confidenceLevel" "ConfidenceLevel" NOT NULL DEFAULT 'ESTIMATED',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductionProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "daysToGerminationMin" INTEGER,
    "daysToGerminationTypical" INTEGER,
    "daysToGerminationMax" INTEGER,
    "germinationRatePct" DOUBLE PRECISION,
    "germinationTempMinC" DOUBLE PRECISION,
    "germinationTempOptC" DOUBLE PRECISION,
    "germinationTempMaxC" DOUBLE PRECISION,
    "seedDepthMm" DOUBLE PRECISION,
    "seedsPerCell" INTEGER,
    "seedsPerMetre" DOUBLE PRECISION,
    "recommendedTrayType" TEXT,
    "daysInNursery" INTEGER,
    "hardeningDays" INTEGER,
    "targetTransplantAgeDays" INTEGER,
    "plantSpacingMm" INTEGER,
    "rowSpacingMm" INTEGER,
    "bedWidthMm" INTEGER,
    "plantsPerM2" DOUBLE PRECISION,
    "trellisRequired" BOOLEAN NOT NULL DEFAULT false,
    "pruningRequired" BOOLEAN NOT NULL DEFAULT false,
    "mulchRecommended" BOOLEAN NOT NULL DEFAULT false,
    "frostSensitivity" TEXT,
    "heatSensitivity" TEXT,
    "droughtTolerance" TEXT,
    "shadeTolerance" TEXT,
    "maturityBasis" "MaturityBasis" NOT NULL DEFAULT 'FROM_TRANSPLANT',
    "daysToFirstHarvest" INTEGER,
    "harvestWindowDays" INTEGER,
    "harvestFrequencyDays" INTEGER,
    "successionFriendly" BOOLEAN NOT NULL DEFAULT false,
    "successionIntervalDays" INTEGER,

    CONSTRAINT "CropProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonRule" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "locationOrClimateZone" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "startWeek" INTEGER,
    "endMonth" INTEGER NOT NULL,
    "endWeek" INTEGER,
    "suitability" "Suitability" NOT NULL,
    "constraintType" TEXT,
    "minThreshold" DOUBLE PRECISION,
    "maxThreshold" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "SeasonRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "anchorType" "AnchorType" NOT NULL DEFAULT 'SEED_DATE',
    "schedulingDirection" "SchedulingDirection" NOT NULL DEFAULT 'FORWARD',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTaskTemplate" (
    "id" TEXT NOT NULL,
    "workflowTemplateId" TEXT NOT NULL,
    "taskType" "ActivityType" NOT NULL,
    "taskName" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "predecessorTaskTemplateId" TEXT,
    "relationshipType" "RelationshipType",
    "lagDays" INTEGER,
    "offsetFromAnchorDays" INTEGER,
    "durationDays" INTEGER NOT NULL DEFAULT 1,
    "triggerType" "TriggerType" NOT NULL DEFAULT 'TIME',
    "triggerRule" TEXT,
    "responsibleRole" TEXT,
    "standardLabourMinutes" INTEGER,
    "publicEligible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkflowTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "parentBatchId" TEXT,
    "batchCode" TEXT NOT NULL,
    "enterpriseType" "ProductionSystem" NOT NULL,
    "varietyBreedId" TEXT NOT NULL,
    "profileId" TEXT,
    "profileVersion" INTEGER,
    "workflowTemplateId" TEXT,
    "plannedStartDate" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),
    "targetCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "initialQuantity" DOUBLE PRECISION,
    "currentQuantity" DOUBLE PRECISION,
    "quantityUnit" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'PLANNED',
    "publicStatus" "PublicStatus" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchLocation" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "placementType" "PlacementType" NOT NULL,
    "activityId" TEXT,
    "notes" TEXT,

    CONSTRAINT "BatchLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "batchId" TEXT,
    "areaId" TEXT,
    "taskTemplateId" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "plannedDateTime" TIMESTAMP(3),
    "actualStartDateTime" TIMESTAMP(3),
    "actualEndDateTime" TIMESTAMP(3),
    "status" "ActivityStatus" NOT NULL DEFAULT 'PLANNED',
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "performedByUserId" TEXT,
    "reasonCode" TEXT,
    "internalNotes" TEXT,
    "publicSummary" TEXT,
    "publicStatus" "PublicStatus" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "areaId" TEXT,
    "observationType" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measurementValue" DOUBLE PRECISION,
    "unit" TEXT,
    "rating" TEXT,
    "notes" TEXT,
    "correctiveActionRequired" BOOLEAN NOT NULL DEFAULT false,
    "correctiveActivityId" TEXT,
    "publicEligible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL,
    "supplierItemCode" TEXT,
    "trackByLot" BOOLEAN NOT NULL DEFAULT true,
    "reorderPoint" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "lotCode" TEXT NOT NULL,
    "supplierLotNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "quantityReceived" DOUBLE PRECISION NOT NULL,
    "quantityRemaining" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "storageArea" TEXT,
    "germinationTestPct" DOUBLE PRECISION,
    "status" "LotStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityInput" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "inventoryLotId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "costSnapshot" DOUBLE PRECISION,

    CONSTRAINT "ActivityInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "harvestLotCode" TEXT NOT NULL,
    "harvestDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "areaId" TEXT,
    "grossQuantity" DOUBLE PRECISION NOT NULL,
    "marketableQuantity" DOUBLE PRECISION,
    "secondsQuantity" DOUBLE PRECISION,
    "wasteQuantity" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "qualityGrade" TEXT,
    "harvestedByUserId" TEXT,
    "publicStatus" "PublicStatus" NOT NULL DEFAULT 'PRIVATE',

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "varietyBreedId" TEXT,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "saleUnit" TEXT NOT NULL,
    "standardPackSize" TEXT,
    "price" DOUBLE PRECISION,
    "publicVisible" BOOLEAN NOT NULL DEFAULT false,
    "primaryMediaUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Farm_tenantId_idx" ON "Farm"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ProductionArea_farmId_idx" ON "ProductionArea"("farmId");

-- CreateIndex
CREATE INDEX "ProductionArea_parentAreaId_idx" ON "ProductionArea"("parentAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionArea_farmId_code_key" ON "ProductionArea"("farmId", "code");

-- CreateIndex
CREATE INDEX "Species_farmId_idx" ON "Species"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Species_farmId_commonName_key" ON "Species"("farmId", "commonName");

-- CreateIndex
CREATE INDEX "VarietyBreed_speciesId_idx" ON "VarietyBreed"("speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "VarietyBreed_speciesId_name_key" ON "VarietyBreed"("speciesId", "name");

-- CreateIndex
CREATE INDEX "ProductionMethod_farmId_idx" ON "ProductionMethod"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionMethod_farmId_name_key" ON "ProductionMethod"("farmId", "name");

-- CreateIndex
CREATE INDEX "ProductionProfile_varietyBreedId_idx" ON "ProductionProfile"("varietyBreedId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionProfile_varietyBreedId_methodId_version_key" ON "ProductionProfile"("varietyBreedId", "methodId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "CropProfile_profileId_key" ON "CropProfile"("profileId");

-- CreateIndex
CREATE INDEX "SeasonRule_profileId_idx" ON "SeasonRule"("profileId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_profileId_idx" ON "WorkflowTemplate"("profileId");

-- CreateIndex
CREATE INDEX "WorkflowTaskTemplate_workflowTemplateId_idx" ON "WorkflowTaskTemplate"("workflowTemplateId");

-- CreateIndex
CREATE INDEX "ProductionBatch_farmId_idx" ON "ProductionBatch"("farmId");

-- CreateIndex
CREATE INDEX "ProductionBatch_varietyBreedId_idx" ON "ProductionBatch"("varietyBreedId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBatch_farmId_batchCode_key" ON "ProductionBatch"("farmId", "batchCode");

-- CreateIndex
CREATE INDEX "BatchLocation_batchId_idx" ON "BatchLocation"("batchId");

-- CreateIndex
CREATE INDEX "BatchLocation_areaId_idx" ON "BatchLocation"("areaId");

-- CreateIndex
CREATE INDEX "Activity_farmId_idx" ON "Activity"("farmId");

-- CreateIndex
CREATE INDEX "Activity_batchId_idx" ON "Activity"("batchId");

-- CreateIndex
CREATE INDEX "Activity_areaId_idx" ON "Activity"("areaId");

-- CreateIndex
CREATE INDEX "Observation_batchId_idx" ON "Observation"("batchId");

-- CreateIndex
CREATE INDEX "Observation_areaId_idx" ON "Observation"("areaId");

-- CreateIndex
CREATE INDEX "Item_farmId_idx" ON "Item"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_farmId_code_key" ON "Item"("farmId", "code");

-- CreateIndex
CREATE INDEX "InventoryLot_itemId_idx" ON "InventoryLot"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLot_itemId_lotCode_key" ON "InventoryLot"("itemId", "lotCode");

-- CreateIndex
CREATE INDEX "ActivityInput_activityId_idx" ON "ActivityInput"("activityId");

-- CreateIndex
CREATE INDEX "ActivityInput_inventoryLotId_idx" ON "ActivityInput"("inventoryLotId");

-- CreateIndex
CREATE INDEX "Harvest_batchId_idx" ON "Harvest"("batchId");

-- CreateIndex
CREATE INDEX "Product_farmId_idx" ON "Product"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_farmId_sku_key" ON "Product"("farmId", "sku");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionArea" ADD CONSTRAINT "ProductionArea_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionArea" ADD CONSTRAINT "ProductionArea_parentAreaId_fkey" FOREIGN KEY ("parentAreaId") REFERENCES "ProductionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarietyBreed" ADD CONSTRAINT "VarietyBreed_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionMethod" ADD CONSTRAINT "ProductionMethod_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionProfile" ADD CONSTRAINT "ProductionProfile_varietyBreedId_fkey" FOREIGN KEY ("varietyBreedId") REFERENCES "VarietyBreed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionProfile" ADD CONSTRAINT "ProductionProfile_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "ProductionMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropProfile" ADD CONSTRAINT "CropProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProductionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRule" ADD CONSTRAINT "SeasonRule_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProductionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTemplate" ADD CONSTRAINT "WorkflowTemplate_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProductionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTaskTemplate" ADD CONSTRAINT "WorkflowTaskTemplate_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "WorkflowTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTaskTemplate" ADD CONSTRAINT "WorkflowTaskTemplate_predecessorTaskTemplateId_fkey" FOREIGN KEY ("predecessorTaskTemplateId") REFERENCES "WorkflowTaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_parentBatchId_fkey" FOREIGN KEY ("parentBatchId") REFERENCES "ProductionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_varietyBreedId_fkey" FOREIGN KEY ("varietyBreedId") REFERENCES "VarietyBreed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProductionProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "WorkflowTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchLocation" ADD CONSTRAINT "BatchLocation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchLocation" ADD CONSTRAINT "BatchLocation_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ProductionArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchLocation" ADD CONSTRAINT "BatchLocation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ProductionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ProductionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_correctiveActivityId_fkey" FOREIGN KEY ("correctiveActivityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityInput" ADD CONSTRAINT "ActivityInput_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityInput" ADD CONSTRAINT "ActivityInput_inventoryLotId_fkey" FOREIGN KEY ("inventoryLotId") REFERENCES "InventoryLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ProductionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_varietyBreedId_fkey" FOREIGN KEY ("varietyBreedId") REFERENCES "VarietyBreed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
