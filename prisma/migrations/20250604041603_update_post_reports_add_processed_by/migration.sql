-- AlterTable
ALTER TABLE `post_reports` ADD COLUMN `processed_by_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `post_reports` ADD CONSTRAINT `post_reports_processed_by_id_fkey` FOREIGN KEY (`processed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
