CREATE TABLE `newsletter_highlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newsletter_id` int NOT NULL,
	`image_url` varchar(500),
	`title` varchar(150) NOT NULL,
	`description` varchar(300),
	`link_url` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `newsletter_highlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(200) NOT NULL,
	`preheader` varchar(200),
	`hero_image_url` varchar(500),
	`heading` varchar(200) NOT NULL,
	`intro` text,
	`cta_label` varchar(100),
	`cta_url` varchar(500),
	`sign_off` varchar(200),
	`status` enum('draft','scheduled','sent') NOT NULL DEFAULT 'draft',
	`scheduled_for` timestamp,
	`sent_at` timestamp,
	`recipient_count` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `customers` ADD `unsubscribe_token` varchar(64);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `unsubscribe_token` varchar(64);--> statement-breakpoint
ALTER TABLE `customers` ADD CONSTRAINT `customers_unsubscribe_token_unique` UNIQUE(`unsubscribe_token`);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD CONSTRAINT `newsletter_subscribers_unsubscribe_token_unique` UNIQUE(`unsubscribe_token`);--> statement-breakpoint
ALTER TABLE `newsletter_highlights` ADD CONSTRAINT `newsletter_highlights_newsletter_id_newsletters_id_fk` FOREIGN KEY (`newsletter_id`) REFERENCES `newsletters`(`id`) ON DELETE no action ON UPDATE no action;