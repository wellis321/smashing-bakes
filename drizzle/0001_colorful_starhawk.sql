CREATE TABLE `promotion_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotion_id` int NOT NULL,
	`label` varchar(100) NOT NULL,
	`description` varchar(250) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `promotion_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150) NOT NULL,
	`title` varchar(200) NOT NULL,
	`tagline` varchar(250),
	`hero_image_url` varchar(500),
	`intro_text` text,
	`prize_description` text,
	`area_text` varchar(150),
	`deadline_text` varchar(150),
	`cta_label` varchar(100),
	`cta_url` varchar(500),
	`is_published` boolean NOT NULL DEFAULT false,
	`is_featured_on_homepage` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `promotion_steps` ADD CONSTRAINT `promotion_steps_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE no action ON UPDATE no action;