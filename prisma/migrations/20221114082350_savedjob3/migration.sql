/*
  Warnings:

  - The primary key for the `SavedJob` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `type` to the `SavedJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SavedJob` DROP PRIMARY KEY,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`, `link`);
