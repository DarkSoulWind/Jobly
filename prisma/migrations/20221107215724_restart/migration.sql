/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ChatID` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Chat` table. All the data in the column will be lost.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ChatID` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `DatePosted` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `MessageID` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `Received` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `SenderID` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `Text` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `Participant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ChatID` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `ParticipantID` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `Participant` table. All the data in the column will be lost.
  - The primary key for the `SavedJob` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Link` on the `SavedJob` table. All the data in the column will be lost.
  - You are about to drop the column `SavedJobID` on the `SavedJob` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `SavedJob` table. All the data in the column will be lost.
  - You are about to drop the `Comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostLikes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreferences` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `Chat` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatID` to the `Message` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Message` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `senderID` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatID` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `SavedJob` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `link` to the `SavedJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `SavedJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Comments` DROP FOREIGN KEY `Comments_PostID_fkey`;

-- DropForeignKey
ALTER TABLE `Comments` DROP FOREIGN KEY `Comments_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `Follows` DROP FOREIGN KEY `Follows_followerId_fkey`;

-- DropForeignKey
ALTER TABLE `Follows` DROP FOREIGN KEY `Follows_followingId_fkey`;

-- DropForeignKey
ALTER TABLE `Interests` DROP FOREIGN KEY `Interests_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_ChatID_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_SenderID_fkey`;

-- DropForeignKey
ALTER TABLE `Participant` DROP FOREIGN KEY `Participant_ChatID_fkey`;

-- DropForeignKey
ALTER TABLE `Participant` DROP FOREIGN KEY `Participant_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `PostLikes` DROP FOREIGN KEY `PostLikes_PostID_fkey`;

-- DropForeignKey
ALTER TABLE `PostLikes` DROP FOREIGN KEY `PostLikes_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `Posts` DROP FOREIGN KEY `Posts_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `SavedJob` DROP FOREIGN KEY `SavedJob_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `UserPreferences` DROP FOREIGN KEY `UserPreferences_UserID_fkey`;

-- AlterTable
ALTER TABLE `Chat` DROP PRIMARY KEY,
    DROP COLUMN `ChatID`,
    DROP COLUMN `Name`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Message` DROP PRIMARY KEY,
    DROP COLUMN `ChatID`,
    DROP COLUMN `DatePosted`,
    DROP COLUMN `MessageID`,
    DROP COLUMN `Received`,
    DROP COLUMN `SenderID`,
    DROP COLUMN `Text`,
    ADD COLUMN `chatID` VARCHAR(191) NOT NULL,
    ADD COLUMN `datePosted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `received` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `senderID` VARCHAR(191) NOT NULL,
    ADD COLUMN `text` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Participant` DROP PRIMARY KEY,
    DROP COLUMN `ChatID`,
    DROP COLUMN `ParticipantID`,
    DROP COLUMN `UserID`,
    ADD COLUMN `chatID` VARCHAR(191) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `userID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SavedJob` DROP PRIMARY KEY,
    DROP COLUMN `Link`,
    DROP COLUMN `SavedJobID`,
    DROP COLUMN `UserID`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `link` VARCHAR(191) NOT NULL,
    ADD COLUMN `userID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `Comments`;

-- DropTable
DROP TABLE `Follows`;

-- DropTable
DROP TABLE `Interests`;

-- DropTable
DROP TABLE `PostLikes`;

-- DropTable
DROP TABLE `Posts`;

-- DropTable
DROP TABLE `UserPreferences`;

-- CreateTable
CREATE TABLE `UserPreference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `pronouns` VARCHAR(191) NULL,
    `countryRegion` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `school` VARCHAR(191) NULL,
    `phoneType` VARCHAR(191) NULL,
    `banner` VARCHAR(191) NULL DEFAULT 'https://swall.teahub.io/photos/small/303-3034192_default-banner-banner-jpg.jpg',
    `bio` VARCHAR(191) NULL,

    UNIQUE INDEX `UserPreference_id_key`(`id`),
    UNIQUE INDEX `UserPreference_userID_key`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `userID` VARCHAR(191) NOT NULL,
    `datePosted` DATETIME(3) NOT NULL,
    `postText` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,
    `imageRef` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` VARCHAR(191) NOT NULL,
    `postID` VARCHAR(191) NOT NULL,

    INDEX `PostLike_postID_idx`(`postID`),
    INDEX `PostLike_userID_idx`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    INDEX `Interest_userID_idx`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follow` (
    `followerId` VARCHAR(191) NOT NULL,
    `followingId` VARCHAR(191) NOT NULL,

    INDEX `Follow_followingId_idx`(`followingId`),
    PRIMARY KEY (`followerId`, `followingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `userID` VARCHAR(191) NOT NULL,
    `postID` VARCHAR(191) NOT NULL,
    `commentText` VARCHAR(191) NOT NULL,
    `datePosted` DATETIME(3) NOT NULL,

    INDEX `Comment_postID_idx`(`postID`),
    INDEX `Comment_userID_idx`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Message_chatID_idx` ON `Message`(`chatID`);

-- CreateIndex
CREATE INDEX `Message_senderID_idx` ON `Message`(`senderID`);

-- CreateIndex
CREATE INDEX `Participant_chatID_idx` ON `Participant`(`chatID`);

-- CreateIndex
CREATE INDEX `Participant_userID_idx` ON `Participant`(`userID`);

-- AddForeignKey
ALTER TABLE `UserPreference` ADD CONSTRAINT `UserPreference_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_postID_fkey` FOREIGN KEY (`postID`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interest` ADD CONSTRAINT `Interest_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postID_fkey` FOREIGN KEY (`postID`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participant` ADD CONSTRAINT `Participant_chatID_fkey` FOREIGN KEY (`chatID`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participant` ADD CONSTRAINT `Participant_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatID_fkey` FOREIGN KEY (`chatID`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderID_fkey` FOREIGN KEY (`senderID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedJob` ADD CONSTRAINT `SavedJob_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Account` RENAME INDEX `Account_userId_fkey` TO `Account_userId_idx`;

-- RenameIndex
ALTER TABLE `Session` RENAME INDEX `Session_userId_fkey` TO `Session_userId_idx`;
