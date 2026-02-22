CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`examType` varchar(64) NOT NULL,
	`classification` enum('normal','patologico') NOT NULL,
	`observation` text,
	`reportText` text NOT NULL,
	`doctorName` varchar(255) DEFAULT 'Dr. Roberto Freire Margotti',
	`doctorCRM` varchar(64) DEFAULT 'CRM-BA 26929',
	`doctorRQE` varchar(64) DEFAULT 'RQE: 21367',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
