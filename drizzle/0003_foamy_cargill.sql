CREATE TABLE `bespoke_order_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`details` text NOT NULL,
	`wants_newsletter` boolean NOT NULL DEFAULT false,
	`status` enum('new','contacted','archived') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bespoke_order_enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`source` varchar(100),
	`subscribed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
