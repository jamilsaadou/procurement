-- AlterTable
ALTER TABLE `LigneBudgetaire` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `montantInitial` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `montantRestant` DOUBLE NOT NULL DEFAULT 0;
