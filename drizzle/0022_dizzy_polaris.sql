CREATE TABLE `staff_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` enum('login_success','login_failed','logout','staff_created','staff_updated','staff_role_changed','staff_activated','staff_deactivated','staff_deleted','password_changed_self','password_reset_by_admin','password_reset_requested','password_reset_completed') NOT NULL,
	`actor_staff_user_id` int,
	`actor_email` varchar(255),
	`target_staff_user_id` int,
	`target_email` varchar(255),
	`detail` varchar(500),
	`ip_address` varchar(64),
	`user_agent` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `staff_users` ADD `password_reset_token_hash` varchar(64);--> statement-breakpoint
ALTER TABLE `staff_users` ADD `password_reset_expires_at` timestamp;