-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `providerName` VARCHAR(191) NOT NULL,
    `providerReference` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payment_bookingId_idx`(`bookingId`),
    INDEX `Payment_userId_idx`(`userId`),
    INDEX `Payment_eventId_idx`(`eventId`),
    INDEX `Payment_status_idx`(`status`),
    INDEX `Payment_providerReference_idx`(`providerReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER NOT NULL,
    `transactionType` VARCHAR(191) NOT NULL,
    `providerReference` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `responsePayload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentTransaction_paymentId_idx`(`paymentId`),
    INDEX `PaymentTransaction_transactionType_idx`(`transactionType`),
    INDEX `PaymentTransaction_status_idx`(`status`),
    INDEX `PaymentTransaction_providerReference_idx`(`providerReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER NOT NULL,
    `bookingId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Refund_paymentId_idx`(`paymentId`),
    INDEX `Refund_bookingId_idx`(`bookingId`),
    INDEX `Refund_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentTransaction` ADD CONSTRAINT `PaymentTransaction_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
