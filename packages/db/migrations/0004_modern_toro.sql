CREATE TABLE `messages` (
	`message_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`message` text DEFAULT '',
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
