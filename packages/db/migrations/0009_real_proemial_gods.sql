CREATE TABLE `lines_positiions` (
	`game_id` text NOT NULL,
	`game_turn` integer NOT NULL,
	`line` integer NOT NULL,
	`line_turn` integer NOT NULL,
	`san` text,
	`lan` text,
	`fen` text,
	`score_unit` text,
	`score_value` integer,
	PRIMARY KEY(`game_id`, `game_turn`, `line`, `line_turn`),
	FOREIGN KEY (`game_id`,`game_turn`) REFERENCES `game_positions`(`game_id`,`turn`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_lines` (
	`game_id` text NOT NULL,
	`game_turn` integer NOT NULL,
	`line` integer NOT NULL,
	`score_unit` text,
	`score_value` integer,
	PRIMARY KEY(`game_id`, `game_turn`, `line`),
	FOREIGN KEY (`game_id`,`game_turn`) REFERENCES `game_positions`(`game_id`,`turn`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_lines`("game_id", "game_turn", "line", "score_unit", "score_value") SELECT "game_id", "game_turn", "line", "score_unit", "score_value" FROM `lines`;--> statement-breakpoint
DROP TABLE `lines`;--> statement-breakpoint
ALTER TABLE `__new_lines` RENAME TO `lines`;--> statement-breakpoint
PRAGMA foreign_keys=ON;