/*
  Warnings:

  - You are about to drop the column `ligneBudgetaireId` on the `Mandat` table. All the data in the column will be lost.

*/

-- CreateTable first
CREATE TABLE `MandatLigneBudgetaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mandatId` INTEGER NOT NULL,
    `ligneBudgetaireId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MandatLigneBudgetaire_mandatId_fkey`(`mandatId`),
    INDEX `MandatLigneBudgetaire_ligneBudgetaireId_fkey`(`ligneBudgetaireId`),
    UNIQUE INDEX `MandatLigneBudgetaire_mandatId_ligneBudgetaireId_key`(`mandatId`, `ligneBudgetaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate existing data from Mandat.ligneBudgetaireId to MandatLigneBudgetaire table
INSERT INTO `MandatLigneBudgetaire` (`mandatId`, `ligneBudgetaireId`, `createdAt`)
SELECT `id`, `ligneBudgetaireId`, NOW()
FROM `Mandat`
WHERE `ligneBudgetaireId` IS NOT NULL;

-- Now drop the foreign key and column
-- DropForeignKey
ALTER TABLE `Mandat` DROP FOREIGN KEY `Mandat_ligneBudgetaireId_fkey`;

-- DropIndex
DROP INDEX `Mandat_ligneBudgetaireId_fkey` ON `Mandat`;

-- AlterTable
ALTER TABLE `Mandat` DROP COLUMN `ligneBudgetaireId`;

-- AddForeignKey
ALTER TABLE `MandatLigneBudgetaire` ADD CONSTRAINT `MandatLigneBudgetaire_mandatId_fkey` FOREIGN KEY (`mandatId`) REFERENCES `Mandat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MandatLigneBudgetaire` ADD CONSTRAINT `MandatLigneBudgetaire_ligneBudgetaireId_fkey` FOREIGN KEY (`ligneBudgetaireId`) REFERENCES `LigneBudgetaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
