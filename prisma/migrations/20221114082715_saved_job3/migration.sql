/*
  Warnings:

  - The primary key for the `SavedJob` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `SavedJob` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`userID`, `link`);
