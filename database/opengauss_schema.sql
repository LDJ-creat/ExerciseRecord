-- sport_checkin OpenGauss schema
-- Converted from MySQL schema.sql

CREATE DATABASE sport_checkin
  WITH ENCODING = 'UTF8'
       LC_COLLATE = 'C'
       LC_CTYPE = 'C'
       TEMPLATE = template0;

\c sport_checkin

-- users
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname      VARCHAR(50)  NOT NULL,
  avatar_url    VARCHAR(500) DEFAULT NULL,
  gender        SMALLINT     NOT NULL DEFAULT 0,
  height        DECIMAL(5,1) DEFAULT NULL,
  weight        DECIMAL(5,1) DEFAULT NULL,
  status        SMALLINT     NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_users_username ON users (username);
CREATE UNIQUE INDEX uk_users_email ON users (email) WHERE email IS NOT NULL;
COMMENT ON TABLE users IS '用户表';

-- sport_types
CREATE TABLE sport_types (
  id             BIGSERIAL PRIMARY KEY,
  code           VARCHAR(50)  NOT NULL,
  name           VARCHAR(50)  NOT NULL,
  need_distance  SMALLINT     NOT NULL DEFAULT 0,
  need_calories  SMALLINT     NOT NULL DEFAULT 0,
  is_active      SMALLINT     NOT NULL DEFAULT 1,
  sort_order     INT          NOT NULL DEFAULT 0,
  user_id        BIGINT       DEFAULT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sport_types_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX uk_sport_types_code ON sport_types (code);
CREATE INDEX idx_sport_types_user ON sport_types (user_id);
COMMENT ON TABLE sport_types IS '运动类型字典';

-- check_ins
CREATE TABLE check_ins (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT       NOT NULL,
  sport_type_id  BIGINT       NOT NULL,
  check_date     DATE         NOT NULL,
  duration       INT          NOT NULL DEFAULT 0,
  distance       DECIMAL(8,2) DEFAULT NULL,
  calories       INT          DEFAULT NULL,
  remark         VARCHAR(500) DEFAULT NULL,
  is_makeup      SMALLINT     NOT NULL DEFAULT 0,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_check_ins_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_check_ins_sport_type FOREIGN KEY (sport_type_id) REFERENCES sport_types (id)
);
CREATE UNIQUE INDEX uk_check_ins_user_type_date ON check_ins (user_id, sport_type_id, check_date);
CREATE INDEX idx_check_ins_user_date ON check_ins (user_id, check_date);
CREATE INDEX idx_check_ins_sport_type ON check_ins (sport_type_id);
COMMENT ON TABLE check_ins IS '运动打卡记录';

-- goals
CREATE TABLE goals (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT        NOT NULL,
  period_type   SMALLINT      NOT NULL,
  target_type   SMALLINT      NOT NULL,
  target_value  DECIMAL(10,2) NOT NULL,
  period_start  DATE          NOT NULL,
  period_end    DATE          NOT NULL,
  status        SMALLINT      NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX uk_goals_user_period ON goals (user_id, period_type, period_start);
CREATE INDEX idx_goals_user_status ON goals (user_id, status);
COMMENT ON TABLE goals IS '运动目标';

-- reminder_settings
CREATE TABLE reminder_settings (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT    NOT NULL,
  is_enabled  SMALLINT  NOT NULL DEFAULT 1,
  remind_time TIME      NOT NULL DEFAULT '20:00:00',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reminder_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX uk_reminder_settings_user ON reminder_settings (user_id);
COMMENT ON TABLE reminder_settings IS '打卡提醒设置';

-- reminder_logs
CREATE TABLE reminder_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT    NOT NULL,
  remind_date DATE      NOT NULL,
  sent_at     TIMESTAMP DEFAULT NULL,
  status      SMALLINT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reminder_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_reminder_logs_user_date ON reminder_logs (user_id, remind_date);
COMMENT ON TABLE reminder_logs IS '提醒发送日志';
