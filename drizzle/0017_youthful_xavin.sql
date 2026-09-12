ALTER TABLE `customers` ADD `password_reset_token_hash` varchar(64);--> statement-breakpoint
ALTER TABLE `customers` ADD `password_reset_expires_at` timestamp;