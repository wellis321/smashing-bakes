CREATE TABLE `posters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`heading` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`image_url` varchar(500),
	`style` enum('announcement','sold-out','celebration','general') NOT NULL DEFAULT 'general',
	`cta_label` varchar(100),
	`cta_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posters_id` PRIMARY KEY(`id`)
);
