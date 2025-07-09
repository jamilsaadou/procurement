/*
  Warnings:

  - Added the required column `dateDebut` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateFin` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionsIntervention` to the `Mandat` table without a default value. This is not possible if the table is not empty.

*/

-- Add columns with default values first
ALTER TABLE `Mandat` 
ADD COLUMN `nom` VARCHAR(191) DEFAULT 'Mandat par défaut',
ADD COLUMN `dateDebut` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN `dateFin` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN `regionsIntervention` VARCHAR(191) DEFAULT '["Echelle nationale"]';

-- Update existing records with meaningful data
UPDATE `Mandat` SET 
    `nom` = `titre`,
    `dateDebut` = `dateCreation`,
    `dateFin` = DATE_ADD(`dateCreation`, INTERVAL 1 YEAR),
    `regionsIntervention` = '["Echelle nationale"]'
WHERE `nom` = 'Mandat par défaut';

-- Remove default values to make columns required
ALTER TABLE `Mandat` 
MODIFY COLUMN `nom` VARCHAR(191) NOT NULL,
MODIFY COLUMN `dateDebut` DATETIME(3) NOT NULL,
MODIFY COLUMN `dateFin` DATETIME(3) NOT NULL,
MODIFY COLUMN `regionsIntervention` VARCHAR(191) NOT NULL;
