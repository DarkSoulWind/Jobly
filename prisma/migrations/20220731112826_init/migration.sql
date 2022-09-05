-- CreateTable
CREATE TABLE `User` (
    `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `PhoneNumber` VARCHAR(191) NOT NULL,
    `PFP` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_UserID_key`(`UserID`),
    UNIQUE INDEX `User_Username_key`(`Username`),
    UNIQUE INDEX `User_Email_key`(`Email`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPreferences` (
    `PreferencesID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `FirstName` VARCHAR(191) NULL,
    `LastName` VARCHAR(191) NULL,
    `Pronouns` VARCHAR(191) NULL,
    `CountryRegion` VARCHAR(191) NULL,
    `PostalCode` VARCHAR(191) NULL,
    `City` VARCHAR(191) NULL,
    `School` VARCHAR(191) NULL,
    `PhoneType` VARCHAR(191) NULL,

    UNIQUE INDEX `UserPreferences_PreferencesID_key`(`PreferencesID`),
    UNIQUE INDEX `UserPreferences_UserID_key`(`UserID`),
    PRIMARY KEY (`PreferencesID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Posts` (
    `PostID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `DatePosted` DATETIME(3) NOT NULL,
    `PostText` VARCHAR(191) NOT NULL,
    `Image` VARCHAR(191) NULL,

    UNIQUE INDEX `Posts_PostID_key`(`PostID`),
    UNIQUE INDEX `Posts_UserID_key`(`UserID`),
    PRIMARY KEY (`PostID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostLikes` (
    `LikeID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `PostID` INTEGER NOT NULL,

    PRIMARY KEY (`LikeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPreferences` ADD CONSTRAINT `UserPreferences_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLikes` ADD CONSTRAINT `PostLikes_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLikes` ADD CONSTRAINT `PostLikes_PostID_fkey` FOREIGN KEY (`PostID`) REFERENCES `Posts`(`PostID`) ON DELETE RESTRICT ON UPDATE CASCADE;
