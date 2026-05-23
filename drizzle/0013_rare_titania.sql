CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`read` integer DEFAULT false NOT NULL,
	`action_app_slug` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `os_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` text NOT NULL,
	`changelog` text,
	`released_at` integer NOT NULL
);
