-- Retire Quoted/Won/Lost in favor of a single Closed - Converted to Deal
-- terminal status (see DirectoryLeadStatusSelect/convertDirectoryLeadToDeal).
-- Existing rows in a removed value are remapped rather than left to break
-- the enum swap below: a Won lead already reached the outcome the new
-- status describes, so it becomes Closed - Converted to Deal; Quoted and
-- Lost have no equivalent left, so both reopen as Contacted (and any
-- closedAt a Lost row had is cleared to match — a Contacted lead was never
-- "closed" anywhere else in the app).
UPDATE "DirectoryLead" SET "closedAt" = NULL WHERE "status" = 'LOST';

-- AlterEnum
BEGIN;
CREATE TYPE "DirectoryLeadStatus_new" AS ENUM ('NEW', 'PICKED_UP', 'CONTACTED', 'CLOSED_CONVERTED');
ALTER TABLE "public"."DirectoryLead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "DirectoryLead" ALTER COLUMN "status" TYPE "DirectoryLeadStatus_new" USING (
  CASE "status"::text
    WHEN 'QUOTED' THEN 'CONTACTED'
    WHEN 'WON' THEN 'CLOSED_CONVERTED'
    WHEN 'LOST' THEN 'CONTACTED'
    ELSE "status"::text
  END::"DirectoryLeadStatus_new"
);
ALTER TYPE "DirectoryLeadStatus" RENAME TO "DirectoryLeadStatus_old";
ALTER TYPE "DirectoryLeadStatus_new" RENAME TO "DirectoryLeadStatus";
DROP TYPE "public"."DirectoryLeadStatus_old";
ALTER TABLE "DirectoryLead" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "DirectoryLead" ADD COLUMN     "convertedDealId" TEXT;

-- CreateIndex
CREATE INDEX "DirectoryLead_convertedDealId_idx" ON "DirectoryLead"("convertedDealId");

-- AddForeignKey
ALTER TABLE "DirectoryLead" ADD CONSTRAINT "DirectoryLead_convertedDealId_fkey" FOREIGN KEY ("convertedDealId") REFERENCES "PartnerDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
