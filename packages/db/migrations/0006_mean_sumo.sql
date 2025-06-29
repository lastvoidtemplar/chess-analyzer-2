CREATE TABLE `lines` (
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
