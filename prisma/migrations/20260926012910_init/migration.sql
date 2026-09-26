-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `role` ENUM('PARTNER', 'ADMIN') NOT NULL DEFAULT 'PARTNER',
    `phone` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `directoryApprovalMode` ENUM('EVERY_SUBMISSION', 'FIRST_SUBMISSION_ONLY', 'NONE') NOT NULL DEFAULT 'EVERY_SUBMISSION',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnerListing` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `companyName` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `services` JSON NOT NULL,
    `industry` ENUM('TECHNOLOGY', 'RETAIL_ECOMMERCE', 'HEALTHCARE', 'FINANCE_BANKING', 'MANUFACTURING', 'CONSTRUCTION_REAL_ESTATE', 'EDUCATION', 'HOSPITALITY_TOURISM', 'PROFESSIONAL_SERVICES', 'MEDIA_ENTERTAINMENT', 'TRANSPORTATION_LOGISTICS', 'AGRICULTURE', 'ENERGY_UTILITIES', 'GOVERNMENT_NONPROFIT', 'TELECOMMUNICATIONS', 'AUTOMOTIVE', 'FOOD_BEVERAGE', 'LEGAL', 'MARKETING_ADVERTISING', 'OTHER') NULL,
    `website` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `operatingHours` JSON NULL,
    `faqs` JSON NULL,
    `translations` JSON NULL,
    `logoUrl` LONGTEXT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(191) NULL,
    `reviewNote` TEXT NULL,
    `submittedAt` DATETIME(3) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `publishedAt` DATETIME(3) NULL,
    `publishedSnapshot` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PartnerListing_slug_key`(`slug`),
    INDEX `PartnerListing_status_idx`(`status`),
    INDEX `PartnerListing_partnerId_idx`(`partnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BusinessCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnerListingCategory` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `PartnerListingCategory_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `PartnerListingCategory_listingId_categoryId_key`(`listingId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectoryListingImage` (
    `id` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `data` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `listingId` VARCHAR(191) NOT NULL,

    INDEX `DirectoryListingImage_listingId_idx`(`listingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectoryLead` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'PICKED_UP', 'CONTACTED', 'QUOTED', 'WON', 'LOST') NOT NULL DEFAULT 'NEW',
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'en',
    `value` DECIMAL(12, 2) NULL,
    `notes` TEXT NULL,
    `pickedUpAt` DATETIME(3) NULL,
    `firstRepliedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,

    INDEX `DirectoryLead_listingId_status_idx`(`listingId`, `status`),
    INDEX `DirectoryLead_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectoryLeadReply` (
    `id` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,
    `sendError` TEXT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    INDEX `DirectoryLeadReply_leadId_idx`(`leadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartnerListing` ADD CONSTRAINT `PartnerListing_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerListingCategory` ADD CONSTRAINT `PartnerListingCategory_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `PartnerListing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerListingCategory` ADD CONSTRAINT `PartnerListingCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `BusinessCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectoryListingImage` ADD CONSTRAINT `DirectoryListingImage_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `PartnerListing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectoryLead` ADD CONSTRAINT `DirectoryLead_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `PartnerListing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectoryLeadReply` ADD CONSTRAINT `DirectoryLeadReply_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `DirectoryLead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectoryLeadReply` ADD CONSTRAINT `DirectoryLeadReply_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
