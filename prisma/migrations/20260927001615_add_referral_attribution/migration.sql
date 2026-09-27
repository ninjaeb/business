-- AlterTable
ALTER TABLE "PartnerListing" ADD COLUMN     "shareWonValueWithReferrers" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "DirectoryLead" ADD COLUMN     "referrerId" TEXT;

-- CreateTable
CREATE TABLE "ListingReferralView" (
    "id" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,

    CONSTRAINT "ListingReferralView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DirectoryLead_referrerId_idx" ON "DirectoryLead"("referrerId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingReferralView_listingId_referrerId_key" ON "ListingReferralView"("listingId", "referrerId");

-- CreateIndex
CREATE INDEX "ListingReferralView_referrerId_idx" ON "ListingReferralView"("referrerId");

-- AddForeignKey
ALTER TABLE "DirectoryLead" ADD CONSTRAINT "DirectoryLead_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingReferralView" ADD CONSTRAINT "ListingReferralView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingReferralView" ADD CONSTRAINT "ListingReferralView_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
