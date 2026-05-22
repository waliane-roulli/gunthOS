CREATE TABLE `nudges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_user_id` text NOT NULL,
	`to_user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`username` text,
	`display_username` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`bio` text,
	`status_message` text,
	`avatar_data_url` text,
	`favorite_app` text,
	`gunthos_rank` text,
	`online_status` text DEFAULT 'offline',
	`last_heartbeat` integer
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "email_verified", "image", "username", "display_username", "created_at", "updated_at", "bio", "status_message", "avatar_data_url", "favorite_app", "gunthos_rank", "online_status", "last_heartbeat") SELECT "id", "name", "email", "email_verified", "image", "username", "display_username", "created_at", "updated_at", "bio", "status_message", "avatar_data_url", "favorite_app", "gunthos_rank", "online_status", "last_heartbeat" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);