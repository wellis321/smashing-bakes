CREATE TABLE `flavor_poll_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poll_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `flavor_poll_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flavor_poll_vote_selections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vote_id` int NOT NULL,
	`option_id` int NOT NULL,
	CONSTRAINT `flavor_poll_vote_selections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flavor_poll_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poll_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flavor_poll_votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `flavor_poll_votes_poll_customer_unique` UNIQUE(`poll_id`,`customer_id`)
);
--> statement-breakpoint
CREATE TABLE `flavor_polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`prize_description` text,
	`deadline_text` varchar(150),
	`is_active` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flavor_polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `flavor_poll_options` ADD CONSTRAINT `flavor_poll_options_poll_id_flavor_polls_id_fk` FOREIGN KEY (`poll_id`) REFERENCES `flavor_polls`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flavor_poll_vote_selections` ADD CONSTRAINT `flavor_poll_vote_selections_vote_id_flavor_poll_votes_id_fk` FOREIGN KEY (`vote_id`) REFERENCES `flavor_poll_votes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flavor_poll_vote_selections` ADD CONSTRAINT `flavor_poll_vote_selections_option_id_flavor_poll_options_id_fk` FOREIGN KEY (`option_id`) REFERENCES `flavor_poll_options`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flavor_poll_votes` ADD CONSTRAINT `flavor_poll_votes_poll_id_flavor_polls_id_fk` FOREIGN KEY (`poll_id`) REFERENCES `flavor_polls`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flavor_poll_votes` ADD CONSTRAINT `flavor_poll_votes_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;