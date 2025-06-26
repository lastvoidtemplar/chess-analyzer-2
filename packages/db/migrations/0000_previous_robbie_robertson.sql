CREATE TABLE `game_headers` (
	`game_id` text NOT NULL,
	`header` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`game_id`, `header`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_moves` (
	`game_id` text NOT NULL,
	`turn` integer NOT NULL,
	`move` text NOT NULL,
	PRIMARY KEY(`game_id`, `turn`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_positions` (
	`game_id` text NOT NULL,
	`turn` integer NOT NULL,
	`fen` text NOT NULL,
	PRIMARY KEY(`game_id`, `turn`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `games` (
	`game_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`result` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`picture` text NOT NULL
);
