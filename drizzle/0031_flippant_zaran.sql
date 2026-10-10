CREATE TABLE `admin_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int,
	`staff_name` varchar(150) NOT NULL,
	`page_path` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','working','resolved','parked') NOT NULL DEFAULT 'new',
	`note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_feedback_id` PRIMARY KEY(`id`)
);
