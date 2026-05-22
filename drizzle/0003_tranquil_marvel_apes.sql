CREATE TABLE `linked_gunth_comment_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comment_id` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `linked_gunth_comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`author_id` text,
	`bot_name` text,
	`bot_avatar` text,
	`content` text NOT NULL,
	`parent_id` integer,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `linked_gunth_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_endorsements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_user_id` text NOT NULL,
	`to_user_id` text NOT NULL,
	`skill_name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_experiences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`start_year` integer NOT NULL,
	`end_year` integer,
	`is_current` integer DEFAULT false NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_follows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`follower_id` text NOT NULL,
	`followed_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`followed_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`icon` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` text,
	`bot_name` text,
	`bot_title` text,
	`bot_avatar` text,
	`content` text NOT NULL,
	`bot_reaction_counts` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_profile_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_user_id` text NOT NULL,
	`viewer_user_id` text,
	`bot_name` text,
	`bot_title` text,
	`bot_emoji` text,
	`viewed_at` integer NOT NULL,
	FOREIGN KEY (`profile_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`viewer_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`open_to_work` integer DEFAULT false NOT NULL,
	`headline` text,
	`location` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` text,
	`bot_name` text,
	`reaction` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `linked_gunth_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linked_gunth_recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_user_id` text NOT NULL,
	`to_user_id` text NOT NULL,
	`content` text NOT NULL,
	`relationship` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
