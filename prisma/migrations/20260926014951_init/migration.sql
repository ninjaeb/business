-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PartnerDealStatus" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "DirectoryApprovalMode" AS ENUM ('EVERY_SUBMISSION', 'FIRST_SUBMISSION_ONLY', 'NONE');

-- CreateEnum
CREATE TYPE "PartnerListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DirectoryLeadStatus" AS ENUM ('NEW', 'PICKED_UP', 'CONTACTED', 'QUOTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('TECHNOLOGY', 'RETAIL_ECOMMERCE', 'HEALTHCARE', 'FINANCE_BANKING', 'MANUFACTURING', 'CONSTRUCTION_REAL_ESTATE', 'EDUCATION', 'HOSPITALITY_TOURISM', 'PROFESSIONAL_SERVICES', 'MEDIA_ENTERTAINMENT', 'TRANSPORTATION_LOGISTICS', 'AGRICULTURE', 'ENERGY_UTILITIES', 'GOVERNMENT_NONPROFIT', 'TELECOMMUNICATIONS', 'AUTOMOTIVE', 'FOOD_BEVERAGE', 'LEGAL', 'MARKETING_ADVERTISING', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "title" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PARTNER',
    "phone" TEXT,
    "companyName" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "Industry",
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "PartnerCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerContact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "PartnerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerDeal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "PartnerDealStatus" NOT NULL DEFAULT 'OPEN',
    "expectedCloseDate" TIMESTAMP(3),
    "notes" TEXT,
    "wonAt" TIMESTAMP(3),
    "lostAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,
    "companyId" TEXT,
    "contactId" TEXT,

    CONSTRAINT "PartnerDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,
    "companyId" TEXT,
    "contactId" TEXT,
    "dealId" TEXT,

    CONSTRAINT "PartnerTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerTaskAssignee" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PartnerTaskAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "directoryApprovalMode" "DirectoryApprovalMode" NOT NULL DEFAULT 'EVERY_SUBMISSION',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerListing" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "PartnerListingStatus" NOT NULL DEFAULT 'DRAFT',
    "companyName" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "services" JSONB NOT NULL,
    "industry" "Industry",
    "website" TEXT,
    "address" TEXT,
    "state" TEXT,
    "country" TEXT,
    "operatingHours" JSONB,
    "faqs" JSONB,
    "translations" JSONB,
    "logoUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "reviewNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "publishedSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "PartnerListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerListingCategory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "PartnerListingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryListingImage" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "DirectoryListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryLead" (
    "id" TEXT NOT NULL,
    "status" "DirectoryLeadStatus" NOT NULL DEFAULT 'NEW',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "value" DECIMAL(12,2),
    "notes" TEXT,
    "pickedUpAt" TIMESTAMP(3),
    "firstRepliedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "DirectoryLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryLeadReply" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "sendError" TEXT,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "DirectoryLeadReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PartnerCompany_partnerId_idx" ON "PartnerCompany"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerCompany_partnerId_name_idx" ON "PartnerCompany"("partnerId", "name");

-- CreateIndex
CREATE INDEX "PartnerContact_partnerId_idx" ON "PartnerContact"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerContact_companyId_idx" ON "PartnerContact"("companyId");

-- CreateIndex
CREATE INDEX "PartnerContact_partnerId_lastName_firstName_idx" ON "PartnerContact"("partnerId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "PartnerDeal_partnerId_idx" ON "PartnerDeal"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerDeal_companyId_idx" ON "PartnerDeal"("companyId");

-- CreateIndex
CREATE INDEX "PartnerDeal_contactId_idx" ON "PartnerDeal"("contactId");

-- CreateIndex
CREATE INDEX "PartnerDeal_partnerId_status_idx" ON "PartnerDeal"("partnerId", "status");

-- CreateIndex
CREATE INDEX "PartnerTask_partnerId_idx" ON "PartnerTask"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerTask_companyId_idx" ON "PartnerTask"("companyId");

-- CreateIndex
CREATE INDEX "PartnerTask_contactId_idx" ON "PartnerTask"("contactId");

-- CreateIndex
CREATE INDEX "PartnerTask_dealId_idx" ON "PartnerTask"("dealId");

-- CreateIndex
CREATE INDEX "PartnerTask_partnerId_dueDate_idx" ON "PartnerTask"("partnerId", "dueDate");

-- CreateIndex
CREATE INDEX "PartnerTaskAssignee_userId_idx" ON "PartnerTaskAssignee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerTaskAssignee_taskId_userId_key" ON "PartnerTaskAssignee"("taskId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerListing_slug_key" ON "PartnerListing"("slug");

-- CreateIndex
CREATE INDEX "PartnerListing_status_idx" ON "PartnerListing"("status");

-- CreateIndex
CREATE INDEX "PartnerListing_partnerId_idx" ON "PartnerListing"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessCategory_name_key" ON "BusinessCategory"("name");

-- CreateIndex
CREATE INDEX "PartnerListingCategory_categoryId_idx" ON "PartnerListingCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerListingCategory_listingId_categoryId_key" ON "PartnerListingCategory"("listingId", "categoryId");

-- CreateIndex
CREATE INDEX "DirectoryListingImage_listingId_idx" ON "DirectoryListingImage"("listingId");

-- CreateIndex
CREATE INDEX "DirectoryLead_listingId_status_idx" ON "DirectoryLead"("listingId", "status");

-- CreateIndex
CREATE INDEX "DirectoryLead_createdAt_idx" ON "DirectoryLead"("createdAt");

-- CreateIndex
CREATE INDEX "DirectoryLeadReply_leadId_idx" ON "DirectoryLeadReply"("leadId");

-- AddForeignKey
ALTER TABLE "PartnerCompany" ADD CONSTRAINT "PartnerCompany_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerContact" ADD CONSTRAINT "PartnerContact_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerContact" ADD CONSTRAINT "PartnerContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "PartnerCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerDeal" ADD CONSTRAINT "PartnerDeal_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerDeal" ADD CONSTRAINT "PartnerDeal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "PartnerCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerDeal" ADD CONSTRAINT "PartnerDeal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "PartnerContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTask" ADD CONSTRAINT "PartnerTask_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTask" ADD CONSTRAINT "PartnerTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "PartnerCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTask" ADD CONSTRAINT "PartnerTask_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "PartnerContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTask" ADD CONSTRAINT "PartnerTask_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "PartnerDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTaskAssignee" ADD CONSTRAINT "PartnerTaskAssignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "PartnerTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTaskAssignee" ADD CONSTRAINT "PartnerTaskAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerListing" ADD CONSTRAINT "PartnerListing_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerListingCategory" ADD CONSTRAINT "PartnerListingCategory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerListingCategory" ADD CONSTRAINT "PartnerListingCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BusinessCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryListingImage" ADD CONSTRAINT "DirectoryListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryLead" ADD CONSTRAINT "DirectoryLead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PartnerListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryLeadReply" ADD CONSTRAINT "DirectoryLeadReply_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "DirectoryLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryLeadReply" ADD CONSTRAINT "DirectoryLeadReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
