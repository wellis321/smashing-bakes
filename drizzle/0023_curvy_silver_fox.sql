ALTER TABLE `orders` ADD `fulfilment_method` enum('pickup','delivery') DEFAULT 'pickup' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_address` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `bespoke_cakes_image_url` varchar(500);--> statement-breakpoint
ALTER TABLE `site_settings` ADD `bespoke_cakes_heading` varchar(200) DEFAULT 'Bespoke cakes for your Smashin'' occasion' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `bespoke_cakes_intro` text DEFAULT ('Birthdays, celebrations, anything worth marking with something a bit special — tell us what you have in mind and our baker Alanah will help bring it to life.') NOT NULL;