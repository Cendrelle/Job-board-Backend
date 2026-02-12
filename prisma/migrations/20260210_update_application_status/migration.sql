-- AlterEnum
-- This migration adds new values to an existing enum.
-- With MySQL databases, this is done by adding the enum value to the `CHECK` constraint.
-- When you rename an enum value, both the old and new values are part of the enum until the migration is finalized
-- After the migration is finalized, the old value will be removed

ALTER TABLE `applications` MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED', 'REVIEWED') NOT NULL DEFAULT 'PENDING';
