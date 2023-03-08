/*
  Warnings:

  - You are about to drop the `UserKeys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserKeys` DROP FOREIGN KEY `UserKeys_userID_fkey`;

-- DropTable
DROP TABLE `UserKeys`;

-- CreateTable
CREATE TABLE `UserKey` (
    `userID` VARCHAR(191) NOT NULL,
    `pub` VARCHAR(191) NOT NULL,
    `priv` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserKey_userID_key`(`userID`),
    UNIQUE INDEX `UserKey_pub_key`(`pub`),
    UNIQUE INDEX `UserKey_priv_key`(`priv`),
    PRIMARY KEY (`userID`, `pub`, `priv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserKey` ADD CONSTRAINT `UserKey_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
