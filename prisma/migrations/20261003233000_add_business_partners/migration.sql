-- CreateEnum
CREATE TYPE "BusinessPartnerLinkStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "BusinessPartnerLink" (
    "id" TEXT NOT NULL,
    "status" "BusinessPartnerLinkStatus" NOT NULL DEFAULT 'PENDING',
    "requesterListingId" TEXT NOT NULL,
    "recipientListingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "BusinessPartnerLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartnerInvite" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "whatsappSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviterListingId" TEXT NOT NULL,

    CONSTRAINT "BusinessPartnerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPartnerLink_recipientListingId_status_idx" ON "BusinessPartnerLink"("recipientListingId", "status");

-- CreateIndex
CREATE INDEX "BusinessPartnerLink_requesterListingId_status_idx" ON "BusinessPartnerLink"("requesterListingId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerLink_requesterListingId_recipientListingId_key" ON "BusinessPartnerLink"("requesterListingId", "recipientListingId");

-- CreateIndex
CREATE INDEX "BusinessPartnerInvite_inviterListingId_idx" ON "BusinessPartnerInvite"("inviterListingId");

-- AddForeignKey
ALTER TABLE "BusinessPartnerLink" ADD CONSTRAINT "BusinessPartnerLink_requesterListingId_fkey" FOREIGN KEY ("requesterListingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerLink" ADD CONSTRAINT "BusinessPartnerLink_recipientListingId_fkey" FOREIGN KEY ("recipientListingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerInvite" ADD CONSTRAINT "BusinessPartnerInvite_inviterListingId_fkey" FOREIGN KEY ("inviterListingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
