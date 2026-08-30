CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`welcome_offer_code` varchar(50) NOT NULL DEFAULT 'WELCOME10',
	`welcome_offer_description` varchar(255) NOT NULL DEFAULT '10% off your next pickup order',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
