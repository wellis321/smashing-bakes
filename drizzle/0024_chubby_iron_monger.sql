CREATE TABLE `bespoke_cake_gallery_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`caption` varchar(200),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bespoke_cake_gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bespoke_cake_testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote` text NOT NULL,
	`author_name` varchar(150),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bespoke_cake_testimonials_id` PRIMARY KEY(`id`)
);
