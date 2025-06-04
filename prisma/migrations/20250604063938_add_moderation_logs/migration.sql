-- CreateTable
CREATE TABLE `moderator_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moderator_id` INTEGER NOT NULL,
    `action` ENUM('DELETE_POST', 'BAN_USER', 'UNBAN_USER') NOT NULL,
    `violation_type` ENUM('SPAM', 'HARASSMENT', 'FALSE_INFORMATION', 'HATE_SPEECH', 'NUDITY', 'VIOLENCE', 'OTHER') NOT NULL,
    `post_id` INTEGER NULL,
    `target_user_id` INTEGER NULL,
    `reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `moderator_logs` ADD CONSTRAINT `moderator_logs_moderator_id_fkey` FOREIGN KEY (`moderator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderator_logs` ADD CONSTRAINT `moderator_logs_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderator_logs` ADD CONSTRAINT `moderator_logs_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
