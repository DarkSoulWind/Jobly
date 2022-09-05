-- AlterTable
ALTER TABLE `Posts` ADD COLUMN `ImageRef` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `online` BOOLEAN NOT NULL DEFAULT false;
