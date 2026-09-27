-- CreateTable
CREATE TABLE "PartnerListingBranchLink" (
    "id" TEXT NOT NULL,
    "listingAId" TEXT NOT NULL,
    "listingBId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerListingBranchLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerListingBranchLink_listingBId_idx" ON "PartnerListingBranchLink"("listingBId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerListingBranchLink_listingAId_listingBId_key" ON "PartnerListingBranchLink"("listingAId", "listingBId");

-- AddForeignKey
ALTER TABLE "PartnerListingBranchLink" ADD CONSTRAINT "PartnerListingBranchLink_listingAId_fkey" FOREIGN KEY ("listingAId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerListingBranchLink" ADD CONSTRAINT "PartnerListingBranchLink_listingBId_fkey" FOREIGN KEY ("listingBId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
