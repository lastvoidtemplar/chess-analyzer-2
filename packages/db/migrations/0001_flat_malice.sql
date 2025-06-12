CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text,
	`email` text NOT NULL,
	`email_verified` integer,
	`name` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`picture` text NOT NULL
);
