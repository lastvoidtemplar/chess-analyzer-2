PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`picture` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "name", "email", "picture") SELECT "id", "username", "name", "email", "picture" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;