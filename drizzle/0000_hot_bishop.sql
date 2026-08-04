CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`alt_text` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_primary` boolean NOT NULL DEFAULT false,
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`sku` varchar(50),
	`price_override_pence` int,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`description` text,
	`base_price_pence` int NOT NULL,
	`sale_price_pence` int,
	`badge` enum('none','sale','new') NOT NULL DEFAULT 'none',
	`is_active` boolean NOT NULL DEFAULT true,
	`is_featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `staff_sessions` (
	`id` varchar(64) NOT NULL,
	`staff_user_id` int NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(150) NOT NULL,
	`role` enum('admin','staff') NOT NULL DEFAULT 'staff',
	`is_active` boolean NOT NULL DEFAULT true,
	`failed_login_attempts` int NOT NULL DEFAULT 0,
	`locked_until` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_sessions` ADD CONSTRAINT `staff_sessions_staff_user_id_staff_users_id_fk` FOREIGN KEY (`staff_user_id`) REFERENCES `staff_users`(`id`) ON DELETE no action ON UPDATE no action;