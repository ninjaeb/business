-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'VISITOR';

-- AlterTable
ALTER TABLE "DirectoryTestimonial" ADD COLUMN "authorId" TEXT;

-- CreateIndex
CREATE INDEX "DirectoryTestimonial_authorId_idx" ON "DirectoryTestimonial"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryTestimonial_listingId_authorId_key" ON "DirectoryTestimonial"("listingId", "authorId");

-- AddForeignKey
ALTER TABLE "DirectoryTestimonial" ADD CONSTRAINT "DirectoryTestimonial_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
