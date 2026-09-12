CREATE TABLE `uploaded_files` (
	`path` varchar(255) NOT NULL,
	`content_type` varchar(100) NOT NULL,
	`data` longblob NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploaded_files_path` PRIMARY KEY(`path`)
);
