-- AlterTable
ALTER TABLE "DirectoryTestimonial" ADD COLUMN     "authorCompany" TEXT,
ADD COLUMN     "authorTitle" TEXT;

-- AlterTable
ALTER TABLE "TestimonialRequestLink" ADD COLUMN     "customerCompany" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerTitle" TEXT;
