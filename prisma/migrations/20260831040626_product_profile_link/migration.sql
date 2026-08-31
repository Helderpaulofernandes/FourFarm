-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "profileId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProductionProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
