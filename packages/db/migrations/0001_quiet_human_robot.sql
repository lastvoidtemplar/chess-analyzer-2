PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_game_headers` (
	`game_id` text NOT NULL,
	`header` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`game_id`, `header`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_game_headers`("game_id", "header", "value") SELECT "game_id", "header", "value" FROM `game_headers`;--> statement-breakpoint
DROP TABLE `game_headers`;--> statement-breakpoint
ALTER TABLE `__new_game_headers` RENAME TO `game_headers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_game_moves` (
	`game_id` text NOT NULL,
	`turn` integer NOT NULL,
	`move` text NOT NULL,
	PRIMARY KEY(`game_id`, `turn`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_game_moves`("game_id", "turn", "move") SELECT "game_id", "turn", "move" FROM `game_moves`;--> statement-breakpoint
DROP TABLE `game_moves`;--> statement-breakpoint
ALTER TABLE `__new_game_moves` RENAME TO `game_moves`;--> statement-breakpoint
CREATE TABLE `__new_game_positions` (
	`game_id` text NOT NULL,
	`turn` integer NOT NULL,
	`fen` text NOT NULL,
	PRIMARY KEY(`game_id`, `turn`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_game_positions`("game_id", "turn", "fen") SELECT "game_id", "turn", "fen" FROM `game_positions`;--> statement-breakpoint
DROP TABLE `game_positions`;--> statement-breakpoint
ALTER TABLE `__new_game_positions` RENAME TO `game_positions`;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`game_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`result` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_games`("game_id", "user_id", "name", "result") SELECT "game_id", "user_id", "name", "result" FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
CREATE UNIQUE INDEX `games_name_unique` ON `games` (`name`);