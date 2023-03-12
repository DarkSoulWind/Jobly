/*
  Warnings:

  - You are about to drop the column `key` on the `MessageKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pub]` on the table `MessageKey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[priv]` on the table `MessageKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `priv` to the `MessageKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pub` to the `MessageKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MessageKey` DROP COLUMN `key`,
    ADD COLUMN `priv` VARCHAR(191) NOT NULL,
    ADD COLUMN `pub` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `MessageKey_pub_key` ON `MessageKey`(`pub`);

-- CreateIndex
CREATE UNIQUE INDEX `MessageKey_priv_key` ON `MessageKey`(`priv`);
