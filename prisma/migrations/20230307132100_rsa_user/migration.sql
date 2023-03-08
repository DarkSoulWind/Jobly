/*
  Warnings:

  - Made the column `image` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `image` VARCHAR(191) NOT NULL DEFAULT 'https://i.pinimg.com/236x/8e/73/0c/8e730ce55fb0199e7dc0bf76672e8dc6.jpg';

-- AlterTable
ALTER TABLE `UserPreference` ADD PRIMARY KEY (`userID`);

-- CreateTable
CREATE TABLE `UserKeys` (
    `userID` VARCHAR(191) NOT NULL,
    `pub` VARCHAR(191) NOT NULL,
    `priv` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserKeys_pub_key`(`pub`),
    UNIQUE INDEX `UserKeys_priv_key`(`priv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Image` (
    `imageRef` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,

    PRIMARY KEY (`imageRef`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserKeys` ADD CONSTRAINT `UserKeys_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
