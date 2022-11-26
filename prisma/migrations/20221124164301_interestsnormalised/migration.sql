/*
  Warnings:

  - The primary key for the `Interest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Interest` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `Interest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Interest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Interest` DROP FOREIGN KEY `Interest_userID_fkey`;

-- AlterTable
ALTER TABLE `Interest` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `userID`,
    ADD PRIMARY KEY (`name`);

-- CreateTable
CREATE TABLE `UserInterest` (
    `userID` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userID`, `name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Follow_followerId_followingId_idx` ON `Follow`(`followerId`, `followingId`);

-- CreateIndex
CREATE UNIQUE INDEX `Interest_name_key` ON `Interest`(`name`);

-- AddForeignKey
ALTER TABLE `UserInterest` ADD CONSTRAINT `UserInterest_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserInterest` ADD CONSTRAINT `UserInterest_name_fkey` FOREIGN KEY (`name`) REFERENCES `Interest`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;
