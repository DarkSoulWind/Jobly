/*
  Warnings:

  - Added the required column `DatePosted` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Comments` ADD COLUMN `DatePosted` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `image` VARCHAR(191) NULL DEFAULT 'https://i.pinimg.com/236x/8e/73/0c/8e730ce55fb0199e7dc0bf76672e8dc6.jpg';

-- CreateTable
CREATE TABLE `Chat` (
    `ChatID` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ChatID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participant` (
    `ParticipantID` VARCHAR(191) NOT NULL,
    `UserID` VARCHAR(191) NOT NULL,
    `ChatID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ParticipantID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `MessageID` VARCHAR(191) NOT NULL,
    `SenderID` VARCHAR(191) NOT NULL,
    `ReceiverID` VARCHAR(191) NOT NULL,
    `ChatID` VARCHAR(191) NOT NULL,
    `Text` VARCHAR(191) NOT NULL,
    `DatePosted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Received` BOOLEAN NOT NULL,

    PRIMARY KEY (`MessageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Participant` ADD CONSTRAINT `Participant_ChatID_fkey` FOREIGN KEY (`ChatID`) REFERENCES `Chat`(`ChatID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participant` ADD CONSTRAINT `Participant_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_ChatID_fkey` FOREIGN KEY (`ChatID`) REFERENCES `Chat`(`ChatID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_SenderID_fkey` FOREIGN KEY (`SenderID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_ReceiverID_fkey` FOREIGN KEY (`ReceiverID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
