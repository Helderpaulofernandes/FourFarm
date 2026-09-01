-- CreateEnum
CREATE TYPE "CSAFrequency" AS ENUM ('WEEKLY', 'FORTNIGHTLY');

-- CreateEnum
CREATE TYPE "CSASubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isSubscription" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CSASubscription" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "frequency" "CSAFrequency" NOT NULL,
    "status" "CSASubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSASubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickYourOwnBooking" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "partySize" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickYourOwnBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CSASubscription_stripeSubscriptionId_key" ON "CSASubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "CSASubscription_farmId_idx" ON "CSASubscription"("farmId");

-- CreateIndex
CREATE INDEX "CSASubscription_customerId_idx" ON "CSASubscription"("customerId");

-- CreateIndex
CREATE INDEX "PickYourOwnBooking_farmId_idx" ON "PickYourOwnBooking"("farmId");

-- CreateIndex
CREATE INDEX "PickYourOwnBooking_customerId_idx" ON "PickYourOwnBooking"("customerId");

-- AddForeignKey
ALTER TABLE "CSASubscription" ADD CONSTRAINT "CSASubscription_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSASubscription" ADD CONSTRAINT "CSASubscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSASubscription" ADD CONSTRAINT "CSASubscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickYourOwnBooking" ADD CONSTRAINT "PickYourOwnBooking_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickYourOwnBooking" ADD CONSTRAINT "PickYourOwnBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
