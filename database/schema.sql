-- sport_checkin database schema
-- MySQL 8.0+ / InnoDB / utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)     NOT NULL COMMENT '登录用户名',
  `email`         VARCHAR(100)    DEFAULT NULL COMMENT '邮箱（首周期不使用）',
  `password_hash` VARCHAR(255)    NOT NULL COMMENT 'bcrypt 密码哈希',
  `nickname`      VARCHAR(50)     NOT NULL COMMENT '昵称',
  `avatar_url`    VARCHAR(500)    DEFAULT NULL COMMENT '头像 URL',
  `gender`        TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0未知 1男 2女',
  `height`        DECIMAL(5,1)    DEFAULT NULL COMMENT '身高 cm',
  `weight`        DECIMAL(5,1)    DEFAULT NULL COMMENT '体重 kg',
  `status`        TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------
-- sport_types
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sport_types` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`           VARCHAR(50)     NOT NULL COMMENT '类型编码',
  `name`           VARCHAR(50)     NOT NULL COMMENT '类型名称',
  `need_distance`  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否需要距离',
  `need_calories`  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否需要卡路里',
  `is_active`      TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1启用 0停用',
  `sort_order`     INT             NOT NULL DEFAULT 0 COMMENT '排序',
  `user_id`        BIGINT UNSIGNED DEFAULT NULL COMMENT 'NULL=系统内置，非NULL=用户自定义',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sport_types_code` (`code`),
  KEY `idx_sport_types_user` (`user_id`),
  CONSTRAINT `fk_sport_types_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动类型字典';

-- -----------------------------------------------------
-- check_ins
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `check_ins` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
  `sport_type_id`  BIGINT UNSIGNED NOT NULL COMMENT '运动类型 ID',
  `check_date`     DATE            NOT NULL COMMENT '打卡日期',
  `duration`       INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '时长（分钟）',
  `distance`       DECIMAL(8,2)    DEFAULT NULL COMMENT '距离 km',
  `calories`       INT UNSIGNED    DEFAULT NULL COMMENT '卡路里',
  `remark`         VARCHAR(500)    DEFAULT NULL COMMENT '备注',
  `is_makeup`      TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '1补卡 0正常',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_check_ins_user_type_date` (`user_id`, `sport_type_id`, `check_date`),
  KEY `idx_check_ins_user_date` (`user_id`, `check_date`),
  KEY `idx_check_ins_sport_type` (`sport_type_id`),
  CONSTRAINT `fk_check_ins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_check_ins_sport_type` FOREIGN KEY (`sport_type_id`) REFERENCES `sport_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动打卡记录';

-- -----------------------------------------------------
-- goals
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `goals` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
  `period_type`   TINYINT UNSIGNED NOT NULL COMMENT '1周 2月',
  `target_type`   TINYINT UNSIGNED NOT NULL COMMENT '1次数 2时长 3距离',
  `target_value`  DECIMAL(10,2)   NOT NULL COMMENT '目标值',
  `period_start`  DATE            NOT NULL COMMENT '周期开始',
  `period_end`    DATE            NOT NULL COMMENT '周期结束',
  `status`        TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0进行中 1已达成 2未达成',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_goals_user_period` (`user_id`, `period_type`, `period_start`),
  KEY `idx_goals_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动目标';

-- -----------------------------------------------------
-- reminder_settings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reminder_settings` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
  `is_enabled`  TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1开启 0关闭',
  `remind_time` TIME            NOT NULL DEFAULT '20:00:00' COMMENT '提醒时间',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reminder_settings_user` (`user_id`),
  CONSTRAINT `fk_reminder_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡提醒设置';

-- -----------------------------------------------------
-- reminder_logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reminder_logs` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
  `remind_date` DATE            NOT NULL COMMENT '提醒日期',
  `sent_at`     DATETIME        DEFAULT NULL COMMENT '发送时间',
  `status`      TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0失败 1成功 2已跳过',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reminder_logs_user_date` (`user_id`, `remind_date`),
  CONSTRAINT `fk_reminder_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒发送日志';

SET FOREIGN_KEY_CHECKS = 1;
