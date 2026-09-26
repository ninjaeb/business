-- AlterTable
ALTER TABLE "PartnerListing" ADD COLUMN     "referralCode" TEXT;

-- CreateIndex
-- Nullable + unique is safe in Postgres (multiple NULLs are allowed in a
-- unique index) — every existing row stays NULL until getOrCreateReferralCode
-- lazily assigns one the next time that listing's public page is rendered.
CREATE UNIQUE INDEX "PartnerListing_referralCode_key" ON "PartnerListing"("referralCode");
