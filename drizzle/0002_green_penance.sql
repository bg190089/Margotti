CREATE TABLE `customInstructions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`examType` varchar(64) NOT NULL,
	`trigger` varchar(255) NOT NULL,
	`instruction` text NOT NULL,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customInstructions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learningPatterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`examType` varchar(64) NOT NULL,
	`pattern` text NOT NULL,
	`frequency` int NOT NULL DEFAULT 0,
	`confidence` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningPatterns_id` PRIMARY KEY(`id`)
);
