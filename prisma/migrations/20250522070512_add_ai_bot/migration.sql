-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_user_id_fkey`;

-- DropIndex
DROP INDEX `posts_user_id_fkey` ON `posts`;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `ai_bot_id` INTEGER NULL,
    MODIFY `user_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `ai_bots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `profile_pict` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ai_bots_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_ai_bot_id_fkey` FOREIGN KEY (`ai_bot_id`) REFERENCES `ai_bots`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
