CREATE TABLE `media_library_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(500) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`alt_text` varchar(255),
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_library_items_id` PRIMARY KEY(`id`)
);
