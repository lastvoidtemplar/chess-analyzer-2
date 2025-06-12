CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fen` text NOT NULL,
	`analysis` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
