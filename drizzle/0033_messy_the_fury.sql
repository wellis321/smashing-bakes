CREATE TABLE `health_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`run_id` varchar(36) NOT NULL,
	`kind` varchar(30) NOT NULL,
	`url` varchar(500) NOT NULL,
	`performance` int,
	`accessibility` int,
	`best_practices` int,
	`seo` int,
	`metrics` text,
	`details` text,
	`error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_runs_id` PRIMARY KEY(`id`)
);
