-- AlterTable
ALTER TABLE `Message` MODIFY `Received` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `online` BOOLEAN NOT NULL DEFAULT true;
