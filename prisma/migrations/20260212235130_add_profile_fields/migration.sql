-- Remap old enum values before shrinking the enum
UPDATE `applications` SET `status` = 'REVIEWED' WHERE `status` = 'IN_PROGRESS';
UPDATE `applications` SET `status` = 'REJECTED' WHERE `status` = 'ACCEPTED';

-- AlterTable
ALTER TABLE `applications` MODIFY `status` ENUM('PENDING', 'REVIEWED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable: add new columns first
ALTER TABLE `profiles`
    ADD COLUMN `competences` VARCHAR(191) NULL,
    ADD COLUMN `experiences` VARCHAR(191) NULL,
    ADD COLUMN `formation` VARCHAR(191) NULL;

-- Migrate existing data
UPDATE `profiles`
SET `competences` = `description`
WHERE `description` IS NOT NULL AND `competences` IS NULL;

-- Drop old column
ALTER TABLE `profiles` DROP COLUMN `description`;
