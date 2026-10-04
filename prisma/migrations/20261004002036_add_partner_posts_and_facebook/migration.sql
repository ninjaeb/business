-- CreateEnum
CREATE TYPE "PartnerPostKind" AS ENUM ('NEWS', 'PROMOTION');

-- CreateTable
CREATE TABLE "PartnerPost" (
    "id" TEXT NOT NULL,
    "kind" "PartnerPostKind" NOT NULL DEFAULT 'NEWS',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "endDate" TIMESTAMP(3),
    "facebookPostId" TEXT,
    "facebookPostedAt" TIMESTAMP(3),
    "facebookPostError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "PartnerPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacebookPageConnection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "encryptedAccessToken" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "FacebookPageConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerPost_listingId_idx" ON "PartnerPost"("listingId");

-- CreateIndex
CREATE INDEX "PartnerPost_partnerId_idx" ON "PartnerPost"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "FacebookPageConnection_listingId_key" ON "FacebookPageConnection"("listingId");

-- AddForeignKey
ALTER TABLE "PartnerPost" ADD CONSTRAINT "PartnerPost_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPost" ADD CONSTRAINT "PartnerPost_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacebookPageConnection" ADD CONSTRAINT "FacebookPageConnection_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
