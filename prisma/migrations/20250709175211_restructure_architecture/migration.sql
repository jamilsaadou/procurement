/*
  Warnings:

  - You are about to drop the column `adressePartenaire` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the column `dateSignature` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the column `emailPartenaire` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the column `formeJuridique` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the column `nomPartenaire` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the column `representantLegal` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the column `telephonePartenaire` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the column `typeMandat` on the `Mandat` table. All the data in the column will be lost.
  - You are about to drop the `EcheancePaiement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `partenaireId` to the `Convention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateCreation` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titre` to the `Mandat` table without a default value. This is not possible if the table is not empty.

*/

-- Créer la table Partenaire d'abord
CREATE TABLE `Partenaire` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `statutJuridique` VARCHAR(191) NOT NULL,
    `representantLegal` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `fax` VARCHAR(191) NULL,
    `autresInfos` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrer les données des mandats vers les partenaires
INSERT INTO `Partenaire` (`id`, `nom`, `statutJuridique`, `representantLegal`, `adresse`, `email`, `telephone`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as id,
    `nomPartenaire` as nom,
    `formeJuridique` as statutJuridique,
    `representantLegal`,
    `adressePartenaire` as adresse,
    `emailPartenaire` as email,
    `telephonePartenaire` as telephone,
    NOW() as createdAt,
    NOW() as updatedAt
FROM `Mandat`;

-- Ajouter temporairement une colonne pour stocker l'ID du partenaire
ALTER TABLE `Mandat` ADD COLUMN `temp_partenaire_id` VARCHAR(191);

-- Mettre à jour avec les IDs des partenaires créés
UPDATE `Mandat` m 
SET `temp_partenaire_id` = (
    SELECT p.id 
    FROM `Partenaire` p 
    WHERE p.nom = m.nomPartenaire 
    AND p.representantLegal = m.representantLegal 
    LIMIT 1
);

-- Ajouter la colonne partenaireId à Convention
ALTER TABLE `Convention` ADD COLUMN `partenaireId` VARCHAR(191);

-- Mettre à jour les conventions avec les IDs des partenaires
UPDATE `Convention` c 
SET `partenaireId` = (
    SELECT m.temp_partenaire_id 
    FROM `Mandat` m 
    WHERE m.id = c.mandatId
);

-- Rendre partenaireId obligatoire maintenant qu'il est rempli
ALTER TABLE `Convention` MODIFY COLUMN `partenaireId` VARCHAR(191) NOT NULL;

-- Ajouter les nouvelles colonnes au modèle Mandat avec des valeurs par défaut
ALTER TABLE `Mandat` 
ADD COLUMN `titre` VARCHAR(191) DEFAULT 'Mandat par défaut',
ADD COLUMN `dateCreation` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN `description` VARCHAR(191) NULL;

-- Mettre à jour les valeurs par défaut avec des données existantes
UPDATE `Mandat` SET 
    `titre` = CONCAT('Mandat - ', `typeMandat`),
    `dateCreation` = `dateSignature`;

-- Rendre les colonnes obligatoires maintenant qu'elles sont remplies
ALTER TABLE `Mandat` 
MODIFY COLUMN `titre` VARCHAR(191) NOT NULL,
MODIFY COLUMN `dateCreation` DATETIME(3) NOT NULL;

-- Supprimer les anciennes colonnes du modèle Mandat
ALTER TABLE `Mandat` 
DROP COLUMN `adressePartenaire`,
DROP COLUMN `dateSignature`,
DROP COLUMN `emailPartenaire`,
DROP COLUMN `formeJuridique`,
DROP COLUMN `nomPartenaire`,
DROP COLUMN `representantLegal`,
DROP COLUMN `telephonePartenaire`,
DROP COLUMN `typeMandat`,
DROP COLUMN `temp_partenaire_id`;

-- Créer la table Paiement (remplace EcheancePaiement)
CREATE TABLE `Paiement` (
    `id` VARCHAR(191) NOT NULL,
    `conventionId` VARCHAR(191) NOT NULL,
    `pourcentage` DOUBLE NOT NULL,
    `montant` DOUBLE NOT NULL,
    `datePrevue` DATETIME(3) NULL,
    `dateEffective` DATETIME(3) NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'En attente',
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrer les données d'EcheancePaiement vers Paiement
INSERT INTO `Paiement` (`id`, `conventionId`, `pourcentage`, `montant`, `datePrevue`, `statut`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as id,
    `conventionId`,
    0 as pourcentage, -- À calculer manuellement plus tard
    `montant`,
    `date` as datePrevue,
    `statut`,
    `createdAt`,
    `updatedAt`
FROM `EcheancePaiement`;

-- Supprimer les contraintes de clé étrangère d'EcheancePaiement
ALTER TABLE `EcheancePaiement` DROP FOREIGN KEY `EcheancePaiement_conventionId_fkey`;

-- Supprimer la table EcheancePaiement
DROP TABLE `EcheancePaiement`;

-- Ajouter les contraintes de clé étrangère
ALTER TABLE `Convention` ADD CONSTRAINT `Convention_partenaireId_fkey` FOREIGN KEY (`partenaireId`) REFERENCES `Partenaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Paiement` ADD CONSTRAINT `Paiement_conventionId_fkey` FOREIGN KEY (`conventionId`) REFERENCES `Convention`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
