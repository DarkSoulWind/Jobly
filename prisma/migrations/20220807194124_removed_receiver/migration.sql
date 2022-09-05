/*
  Warnings:

  - You are about to drop the column `ReceiverID` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `Participant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ParticipantID` on the `Participant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_ReceiverID_fkey`;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `ReceiverID`;

-- AlterTable
ALTER TABLE `Participant` DROP PRIMARY KEY,
    MODIFY `ParticipantID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ParticipantID`);
