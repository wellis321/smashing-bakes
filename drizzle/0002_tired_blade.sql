CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_id` int NOT NULL,
	`title` varchar(150) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `menu_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_menus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_date` date NOT NULL,
	`title` varchar(200),
	`opening_hours_text` varchar(200),
	`note_text` text,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_menus_id` PRIMARY KEY(`id`),
	CONSTRAINT `weekly_menus_menu_date_unique` UNIQUE(`menu_date`)
);
--> statement-breakpoint
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_section_id_menu_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `menu_sections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu_sections` ADD CONSTRAINT `menu_sections_menu_id_weekly_menus_id_fk` FOREIGN KEY (`menu_id`) REFERENCES `weekly_menus`(`id`) ON DELETE no action ON UPDATE no action;