/*
  Warnings:

  - You are about to drop the `MessageCipherKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MessageCipherKey` DROP FOREIGN KEY `MessageCipherKey_messageID_fkey`;

-- DropTable
DROP TABLE `MessageCipherKey`;

-- CreateTable
CREATE TABLE `MessageKey` (
    `messageID` VARCHAR(191) NOT NULL,
    `key` VARCHAR(280) NOT NULL,

    PRIMARY KEY (`messageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MessageKey` ADD CONSTRAINT `MessageKey_messageID_fkey` FOREIGN KEY (`messageID`) REFERENCES `Message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
