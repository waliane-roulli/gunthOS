ALTER TABLE `user` ADD COLUMN `online_status` text DEFAULT 'offline';
--> statement-breakpoint
ALTER TABLE `user` ADD COLUMN `last_heartbeat` integer;
