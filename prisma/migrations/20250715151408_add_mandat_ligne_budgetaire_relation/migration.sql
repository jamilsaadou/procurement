/*
  Warnings:

  - Added the required column `ligneBudgetaireId` to the `Mandat` table without a default value. This is not possible if the table is not empty.

*/

-- Créer une ligne budgétaire par défaut si elle n'existe pas
INSERT IGNORE INTO `LigneBudgetaire` (`id`, `numero`, `libelle`, `createdAt`, `updatedAt`, `description`, `montantInitial`, `montantRestant`)
VALUES ('default-ligne-budgetaire', 'LB-DEFAULT', 'Ligne budgétaire par défaut', NOW(), NOW(), 'Ligne budgétaire créée automatiquement pour les mandats existants', 0, 0);

-- AlterTable - Ajouter la colonne avec une valeur par défaut temporaire
ALTER TABLE `Mandat` ADD COLUMN `ligneBudgetaireId` VARCHAR(191) NOT NULL DEFAULT 'default-ligne-budgetaire';

-- Supprimer la valeur par défaut après avoir ajouté la colonne
ALTER TABLE `Mandat` ALTER COLUMN `ligneBudgetaireId` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `Mandat_ligneBudgetaireId_fkey` ON `Mandat`(`ligneBudgetaireId`);

-- AddForeignKey
ALTER TABLE `Mandat` ADD CONSTRAINT `Mandat_ligneBudgetaireId_fkey` FOREIGN KEY (`ligneBudgetaireId`) REFERENCES `LigneBudgetaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
