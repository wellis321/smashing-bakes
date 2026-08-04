CREATE TABLE `business_choices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotion_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`business_id` int NOT NULL,
	`choice_date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `business_choices_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_choices_promo_customer_date_unique` UNIQUE(`promotion_id`,`customer_id`,`choice_date`)
);
--> statement-breakpoint
CREATE TABLE `local_businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`category` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `local_businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `promotions` ADD `mechanic` enum('manual','business_picker') DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `business_choices` ADD CONSTRAINT `business_choices_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_choices` ADD CONSTRAINT `business_choices_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_choices` ADD CONSTRAINT `business_choices_business_id_local_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `local_businesses`(`id`) ON DELETE no action ON UPDATE no action;