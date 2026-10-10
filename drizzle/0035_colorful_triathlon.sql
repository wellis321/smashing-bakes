CREATE TABLE `site_visits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` date NOT NULL,
	`kind` varchar(10) NOT NULL,
	`name` varchar(200) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`visitors` int NOT NULL DEFAULT 0,
	CONSTRAINT `site_visits_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_visits_day_kind_name_unique` UNIQUE(`day`,`kind`,`name`)
);
