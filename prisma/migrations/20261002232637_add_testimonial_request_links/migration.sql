-- AlterTable
ALTER TABLE "DirectoryTestimonial" ADD COLUMN     "serviceTitle" TEXT;

-- CreateTable
CREATE TABLE "TestimonialRequestLink" (
    "id" TEXT NOT NULL,
    "serviceTitle" TEXT,
    "note" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "TestimonialRequestLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestimonialRequestLink_listingId_idx" ON "TestimonialRequestLink"("listingId");

-- AddForeignKey
ALTER TABLE "TestimonialRequestLink" ADD CONSTRAINT "TestimonialRequestLink_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
