PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_lines_positiions` (
	`game_id` text NOT NULL,
	`game_turn` integer NOT NULL,
	`line` integer NOT NULL,
	`line_turn` integer NOT NULL,
	`san` text NOT NULL,
	`lan` text NOT NULL,
	`fen` text NOT NULL,
	`score_unit` text NOT NULL,
	`score_value` integer NOT NULL,
	PRIMARY KEY(`game_id`, `game_turn`, `line`, `line_turn`),
	FOREIGN KEY (`game_id`,`game_turn`,`line`) REFERENCES `lines`(`game_id`,`game_turn`,`line`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_lines_positiions`("game_id", "game_turn", "line", "line_turn", "san", "lan", "fen", "score_unit", "score_value") SELECT "game_id", "game_turn", "line", "line_turn", "san", "lan", "fen", "score_unit", "score_value" FROM `lines_positiions`;--> statement-breakpoint
DROP TABLE `lines_positiions`;--> statement-breakpoint
ALTER TABLE `__new_lines_positiions` RENAME TO `lines_positiions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;