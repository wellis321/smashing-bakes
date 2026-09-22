ALTER TABLE `bespoke_cake_gallery_items` ADD `image_zoom` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `bespoke_cake_gallery_items` ADD `focal_point` varchar(20) DEFAULT 'center' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `bespoke_cakes_image_zoom` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `bespoke_cakes_image_focal_point` varchar(20) DEFAULT 'center' NOT NULL;