CREATE TABLE `gunthrank_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`igdb_id` integer,
	`name` text NOT NULL,
	`slug` text,
	`cover_url` text,
	`platforms` text,
	`genres` text,
	`release_date` integer,
	`summary` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gunthrank_games_igdb_id_unique` ON `gunthrank_games` (`igdb_id`);--> statement-breakpoint
CREATE TABLE `gunthrank_rankings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`game_id` integer NOT NULL,
	`tier` text NOT NULL,
	`objective_note` integer,
	`note_text` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `gunthrank_games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gunthrank_user_game_unique` ON `gunthrank_rankings` (`user_id`,`game_id`);