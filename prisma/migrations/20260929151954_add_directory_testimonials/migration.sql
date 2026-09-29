-- CreateEnum
CREATE TYPE "DirectoryTestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "PartnerListing" ADD COLUMN     "googleReviewUrl" TEXT;

-- CreateTable
CREATE TABLE "DirectoryTestimonial" (
    "id" TEXT NOT NULL,
    "status" "DirectoryTestimonialStatus" NOT NULL DEFAULT 'PENDING',
    "authorName" TEXT NOT NULL,
    "rating" INTEGER,
    "body" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "DirectoryTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DirectoryTestimonial_listingId_status_idx" ON "DirectoryTestimonial"("listingId", "status");

-- CreateIndex
CREATE INDEX "DirectoryTestimonial_status_idx" ON "DirectoryTestimonial"("status");

-- AddForeignKey
ALTER TABLE "DirectoryTestimonial" ADD CONSTRAINT "DirectoryTestimonial_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
