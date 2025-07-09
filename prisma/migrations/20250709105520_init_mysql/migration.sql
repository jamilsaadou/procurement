-- CreateTable
CREATE TABLE `Convention` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `mandatId` VARCHAR(191) NOT NULL,
    `ligneBudgetaireId` VARCHAR(191) NOT NULL,
    `modeSelection` VARCHAR(191) NOT NULL,
    `typeConvention` VARCHAR(191) NOT NULL,
    `numeroConvention` VARCHAR(191) NOT NULL,
    `objet` VARCHAR(191) NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `montantTotal` DOUBLE NOT NULL,
    `periodicitePaiement` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `duree` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Convention_numero_key`(`numero`),
    UNIQUE INDEX `Convention_numeroConvention_key`(`numeroConvention`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mandat` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `nomPartenaire` VARCHAR(191) NOT NULL,
    `representantLegal` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Mandat_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LigneBudgetaire` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `libelle` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LigneBudgetaire_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EcheancePaiement` (
    `id` VARCHAR(191) NOT NULL,
    `conventionId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Convention` ADD CONSTRAINT `Convention_mandatId_fkey` FOREIGN KEY (`mandatId`) REFERENCES `Mandat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Convention` ADD CONSTRAINT `Convention_ligneBudgetaireId_fkey` FOREIGN KEY (`ligneBudgetaireId`) REFERENCES `LigneBudgetaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EcheancePaiement` ADD CONSTRAINT `EcheancePaiement_conventionId_fkey` FOREIGN KEY (`conventionId`) REFERENCES `Convention`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
