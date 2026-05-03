-- Auto-generated from Flyway migrations. Do not edit manually.
-- Regenerate with: ./scripts/generate-schema.sh
-- Source: backend/src/main/resources/db/migration/*.sql

CREATE TABLE `learning_project` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `learning_tag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_learning_tag_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `learning_task` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_learning_task_project` (`project_id`),
  CONSTRAINT `fk_learning_task_project` FOREIGN KEY (`project_id`) REFERENCES `learning_project` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `learning_task_tag` (
  `task_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`task_id`,`tag_id`),
  KEY `fk_learning_task_tag_tag` (`tag_id`),
  CONSTRAINT `fk_learning_task_tag_tag` FOREIGN KEY (`tag_id`) REFERENCES `learning_tag` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_learning_task_tag_task` FOREIGN KEY (`task_id`) REFERENCES `learning_task` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `task_activity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `task_id` bigint NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` varchar(500) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_task_activity_task` (`task_id`),
  CONSTRAINT `fk_task_activity_task` FOREIGN KEY (`task_id`) REFERENCES `learning_task` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `task_comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `task_id` bigint NOT NULL,
  `content` varchar(1000) NOT NULL,
  `author` varchar(50) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_task_comment_task` (`task_id`),
  CONSTRAINT `fk_task_comment_task` FOREIGN KEY (`task_id`) REFERENCES `learning_task` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
