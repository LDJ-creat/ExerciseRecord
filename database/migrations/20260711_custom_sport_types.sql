-- 用户自定义运动类型：为 sport_types 增加 user_id
-- 已有库执行本脚本；新库直接使用 schema.sql

ALTER TABLE `sport_types`
  ADD COLUMN `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'NULL=系统内置，非NULL=用户自定义' AFTER `sort_order`,
  ADD KEY `idx_sport_types_user` (`user_id`),
  ADD CONSTRAINT `fk_sport_types_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
