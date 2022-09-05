-- DropForeignKey
ALTER TABLE `PostLikes` DROP FOREIGN KEY `PostLikes_PostID_fkey`;

-- DropForeignKey
ALTER TABLE `PostLikes` DROP FOREIGN KEY `PostLikes_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `Posts` DROP FOREIGN KEY `Posts_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `UserPreferences` DROP FOREIGN KEY `UserPreferences_UserID_fkey`;

-- AddForeignKey
ALTER TABLE `UserPreferences` ADD CONSTRAINT `UserPreferences_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLikes` ADD CONSTRAINT `PostLikes_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLikes` ADD CONSTRAINT `PostLikes_PostID_fkey` FOREIGN KEY (`PostID`) REFERENCES `Posts`(`PostID`) ON DELETE CASCADE ON UPDATE CASCADE;
