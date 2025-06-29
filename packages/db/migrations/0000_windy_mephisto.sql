CREATE TABLE `game_headers` (
	`game_id` text NOT NULL,
	`header` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`game_id`, `header`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_positions` (
	`game_id` text NOT NULL,
	`turn` integer NOT NULL,
	`san` text,
	`lan` text,
	`fen` text,
	`score_unit` text,
	`score_value` integer,
	`note` text DEFAULT 'Note...' NOT NULL,
	`lines_generated` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`game_id`, `turn`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `games` (
	`game_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`result` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_name_unique` ON `games` (`name`);--> statement-breakpoint
CREATE TABLE `lines` (
	`game_id` text NOT NULL,
	`game_turn` integer NOT NULL,
	`line` integer NOT NULL,
	`score_unit` text,
	`score_value` integer,
	PRIMARY KEY(`game_id`, `game_turn`, `line`),
	FOREIGN KEY (`game_id`,`game_turn`) REFERENCES `game_positions`(`game_id`,`turn`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lines_positiions` (
	`game_id` text NOT NULL,
	`game_turn` integer NOT NULL,
	`line` integer NOT NULL,
	`line_turn` integer NOT NULL,
	`san` text,
	`lan` text,
	`fen` text NOT NULL,
	`score_unit` text NOT NULL,
	`score_value` integer NOT NULL,
	PRIMARY KEY(`game_id`, `game_turn`, `line`, `line_turn`),
	FOREIGN KEY (`game_id`,`game_turn`,`line`) REFERENCES `lines`(`game_id`,`game_turn`,`line`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`message_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`picture` text NOT NULL
);
