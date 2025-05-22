/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `ai_bots` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `ai_bots` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ai_bots_name_key` ON `ai_bots`;

-- AlterTable
ALTER TABLE `ai_bots` ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ai_bots_username_key` ON `ai_bots`(`username`);
