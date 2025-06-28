PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_game_positions` (
	`game_id` text NOT NULL,
	`turn` integer NOT NULL,
	`san` text,
	`lan` text,
	`fen` text,
	`score_unit` text,
	`score_value` integer,
	`note` text DEFAULT 'Note...' NOT NULL,
	PRIMARY KEY(`game_id`, `turn`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_game_positions`("game_id", "turn", "san", "lan", "fen", "score_unit", "score_value", "note") SELECT "game_id", "turn", "san", "lan", "fen", "score_unit", "score_value", "note" FROM `game_positions`;--> statement-breakpoint
DROP TABLE `game_positions`;--> statement-breakpoint
ALTER TABLE `__new_game_positions` RENAME TO `game_positions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`message_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_messages`("message_id", "user_id", "message", "timestamp") SELECT "message_id", "user_id", "message", "timestamp" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;