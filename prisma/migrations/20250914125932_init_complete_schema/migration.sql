-- CreateTable
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

-- CreateTable
CREATE TABLE `Convention` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `mandatId` INTEGER NOT NULL,
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
    `partenaireId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Convention_numero_key`(`numero`),
    UNIQUE INDEX `Convention_numeroConvention_key`(`numeroConvention`),
    INDEX `Convention_ligneBudgetaireId_fkey`(`ligneBudgetaireId`),
    INDEX `Convention_mandatId_fkey`(`mandatId`),
    INDEX `Convention_partenaireId_fkey`(`partenaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mandat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NULL,
    `nom` VARCHAR(191) NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `regionsIntervention` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `dateCreation` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,

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
    `description` VARCHAR(191) NULL,
    `montantInitial` DOUBLE NOT NULL DEFAULT 0,
    `montantRestant` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `LigneBudgetaire_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
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

-- CreateTable
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

    INDEX `Paiement_conventionId_fkey`(`conventionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `statut` VARCHAR(191) NOT NULL DEFAULT 'actif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_token_key`(`token`),
    INDEX `Session_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Convention` ADD CONSTRAINT `Convention_ligneBudgetaireId_fkey` FOREIGN KEY (`ligneBudgetaireId`) REFERENCES `LigneBudgetaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Convention` ADD CONSTRAINT `Convention_mandatId_fkey` FOREIGN KEY (`mandatId`) REFERENCES `Mandat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Convention` ADD CONSTRAINT `Convention_partenaireId_fkey` FOREIGN KEY (`partenaireId`) REFERENCES `Partenaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MandatLigneBudgetaire` ADD CONSTRAINT `MandatLigneBudgetaire_mandatId_fkey` FOREIGN KEY (`mandatId`) REFERENCES `Mandat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MandatLigneBudgetaire` ADD CONSTRAINT `MandatLigneBudgetaire_ligneBudgetaireId_fkey` FOREIGN KEY (`ligneBudgetaireId`) REFERENCES `LigneBudgetaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paiement` ADD CONSTRAINT `Paiement_conventionId_fkey` FOREIGN KEY (`conventionId`) REFERENCES `Convention`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
