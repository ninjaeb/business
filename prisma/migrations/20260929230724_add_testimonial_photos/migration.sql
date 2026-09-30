-- AlterTable
ALTER TABLE "DirectoryListingImage" ADD COLUMN     "testimonialId" TEXT;

-- CreateIndex
CREATE INDEX "DirectoryListingImage_testimonialId_idx" ON "DirectoryListingImage"("testimonialId");

-- AddForeignKey
ALTER TABLE "DirectoryListingImage" ADD CONSTRAINT "DirectoryListingImage_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "DirectoryTestimonial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
