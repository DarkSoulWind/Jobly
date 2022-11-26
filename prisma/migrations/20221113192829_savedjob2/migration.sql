/*
  Warnings:

  - Added the required column `description` to the `SavedJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employer` to the `SavedJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `SavedJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SavedJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SavedJob` ADD COLUMN `dateAdded` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `employer` VARCHAR(191) NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
