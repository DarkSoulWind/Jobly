/*
  Warnings:

  - The primary key for the `Participant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `SavedJob` table. All the data in the column will be lost.
  - The primary key for the `UserPreference` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserPreference` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `UserPreference_id_key` ON `UserPreference`;

-- AlterTable
ALTER TABLE `Comment` MODIFY `datePosted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Message` MODIFY `text` VARCHAR(280) NOT NULL;

-- AlterTable
ALTER TABLE `Participant` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`userID`, `chatID`);

-- AlterTable
ALTER TABLE `Post` MODIFY `datePosted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `postText` VARCHAR(280) NOT NULL;

-- AlterTable
ALTER TABLE `SavedJob` DROP COLUMN `id`;

-- AlterTable
ALTER TABLE `UserPreference` DROP PRIMARY KEY,
    DROP COLUMN `id`;

-- CreateTable
CREATE TABLE `MessageCipherKey` (
    `messageID` VARCHAR(191) NOT NULL,
    `key` VARCHAR(280) NOT NULL,

    PRIMARY KEY (`messageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Comment_postID_userID_idx` ON `Comment`(`postID`, `userID`);

-- AddForeignKey
ALTER TABLE `MessageCipherKey` ADD CONSTRAINT `MessageCipherKey_messageID_fkey` FOREIGN KEY (`messageID`) REFERENCES `Message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
