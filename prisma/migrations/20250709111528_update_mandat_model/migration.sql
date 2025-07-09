/*
  Warnings:

  - You are about to alter the column `mandatId` on the `Convention` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Mandat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Mandat` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `adressePartenaire` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateSignature` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailPartenaire` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formeJuridique` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statut` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephonePartenaire` to the `Mandat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeMandat` to the `Mandat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Convention` DROP FOREIGN KEY `Convention_mandatId_fkey`;

-- DropIndex
DROP INDEX `Convention_mandatId_fkey` ON `Convention`;

-- AlterTable
ALTER TABLE `Convention` MODIFY `mandatId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Mandat` DROP PRIMARY KEY,
    ADD COLUMN `adressePartenaire` VARCHAR(191) NOT NULL,
    ADD COLUMN `dateSignature` DATETIME(3) NOT NULL,
    ADD COLUMN `emailPartenaire` VARCHAR(191) NOT NULL,
    ADD COLUMN `formeJuridique` VARCHAR(191) NOT NULL,
    ADD COLUMN `statut` VARCHAR(191) NOT NULL,
    ADD COLUMN `telephonePartenaire` VARCHAR(191) NOT NULL,
    ADD COLUMN `typeMandat` VARCHAR(191) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Convention` ADD CONSTRAINT `Convention_mandatId_fkey` FOREIGN KEY (`mandatId`) REFERENCES `Mandat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
