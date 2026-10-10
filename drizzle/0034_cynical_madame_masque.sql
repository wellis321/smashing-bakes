CREATE TABLE `health_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_key` varchar(255) NOT NULL,
	`kind` varchar(30) NOT NULL,
	`page` varchar(500) NOT NULL,
	`title` varchar(300) NOT NULL,
	`detail` text,
	`who` varchar(20) NOT NULL DEFAULT 'developer',
	`how_to_fix` text,
	`status` enum('open','working','fixed','ignored') NOT NULL DEFAULT 'open',
	`note` text,
	`first_seen` timestamp NOT NULL DEFAULT (now()),
	`last_seen` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `health_tasks_task_key_unique` UNIQUE(`task_key`)
);
