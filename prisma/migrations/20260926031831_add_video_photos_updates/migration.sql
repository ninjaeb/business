-- AlterTable
ALTER TABLE "DirectoryListingImage" ADD COLUMN     "caption" TEXT;

-- AlterTable
ALTER TABLE "PartnerListing" ADD COLUMN     "photoIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updates" JSONB,
ADD COLUMN     "videoUrl" TEXT;
