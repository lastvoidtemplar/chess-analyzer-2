CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event` text,
	`site` text,
	`date` text,
	`white` text,
	`black` text,
	`result` text,
	`time_control` text,
	`white_elo` text,
	`black_elo` text,
	`eco` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `moves` (
	`move_id` integer NOT NULL,
	`game_id` text,
	`notation` text NOT NULL,
	PRIMARY KEY(`game_id`, `move_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`picture` text NOT NULL
);
