-- CreateEnum
CREATE TYPE "DirectoryGuideStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "DirectoryListingImage" ADD COLUMN     "guideId" TEXT,
ALTER COLUMN "listingId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DirectoryGuide" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "DirectoryGuideStatus" NOT NULL DEFAULT 'DRAFT',
    "industry" "Industry",
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "DirectoryGuide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryGuide_slug_key" ON "DirectoryGuide"("slug");

-- CreateIndex
CREATE INDEX "DirectoryGuide_status_idx" ON "DirectoryGuide"("status");

-- CreateIndex
CREATE INDEX "DirectoryGuide_industry_idx" ON "DirectoryGuide"("industry");

-- CreateIndex
CREATE INDEX "DirectoryListingImage_guideId_idx" ON "DirectoryListingImage"("guideId");

-- AddForeignKey
ALTER TABLE "DirectoryListingImage" ADD CONSTRAINT "DirectoryListingImage_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "DirectoryGuide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryGuide" ADD CONSTRAINT "DirectoryGuide_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
