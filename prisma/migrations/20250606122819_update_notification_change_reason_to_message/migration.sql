/*
  Warnings:

  - You are about to drop the column `reason` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `reason`,
    ADD COLUMN `message` TEXT NULL;
