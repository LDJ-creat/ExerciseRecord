-- OpenGauss tables + demo data (connect to sport_checkin first)

-- users
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL,
  email         VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  nickname      VARCHAR(50)  NOT NULL,
  avatar_url    VARCHAR(500),
  gender        SMALLINT     NOT NULL DEFAULT 0,
  height        DECIMAL(5,1),
  weight        DECIMAL(5,1),
  status        SMALLINT     NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_users_username ON users(username);
CREATE UNIQUE INDEX uk_users_email ON users(email) WHERE email IS NOT NULL;

-- sport_types
CREATE TABLE sport_types (
  id             BIGSERIAL PRIMARY KEY,
  code           VARCHAR(50)  NOT NULL,
  name           VARCHAR(50)  NOT NULL,
  need_distance  SMALLINT     NOT NULL DEFAULT 0,
  need_calories  SMALLINT     NOT NULL DEFAULT 0,
  is_active      SMALLINT     NOT NULL DEFAULT 1,
  sort_order     INT          NOT NULL DEFAULT 0,
  user_id        BIGINT,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_sport_types_code ON sport_types(code);
CREATE INDEX idx_sport_types_user ON sport_types(user_id);
ALTER TABLE sport_types ADD CONSTRAINT fk_sport_types_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- check_ins
CREATE TABLE check_ins (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT       NOT NULL,
  sport_type_id  BIGINT       NOT NULL,
  check_date     DATE         NOT NULL,
  duration       INT          NOT NULL DEFAULT 0,
  distance       DECIMAL(8,2),
  calories       INT,
  remark         VARCHAR(500),
  is_makeup      SMALLINT     NOT NULL DEFAULT 0,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_check_ins_user_type_date ON check_ins(user_id, sport_type_id, check_date);
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, check_date);
CREATE INDEX idx_check_ins_sport_type ON check_ins(sport_type_id);
ALTER TABLE check_ins ADD CONSTRAINT fk_check_ins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE check_ins ADD CONSTRAINT fk_check_ins_sport_type FOREIGN KEY (sport_type_id) REFERENCES sport_types(id);

-- goals
CREATE TABLE goals (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT       NOT NULL,
  period_type   SMALLINT     NOT NULL,
  target_type   SMALLINT     NOT NULL,
  target_value  DECIMAL(10,2) NOT NULL,
  period_start  DATE         NOT NULL,
  period_end    DATE         NOT NULL,
  status        SMALLINT     NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_goals_user_period ON goals(user_id, period_type, period_start);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
ALTER TABLE goals ADD CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- reminder_settings
CREATE TABLE reminder_settings (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT    NOT NULL,
  is_enabled  SMALLINT  NOT NULL DEFAULT 1,
  remind_time TIME      NOT NULL DEFAULT '20:00:00',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_reminder_settings_user ON reminder_settings(user_id);
ALTER TABLE reminder_settings ADD CONSTRAINT fk_reminder_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- reminder_logs
CREATE TABLE reminder_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT    NOT NULL,
  remind_date DATE      NOT NULL,
  sent_at     TIMESTAMP,
  status      SMALLINT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_reminder_logs_user_date ON reminder_logs(user_id, remind_date);
ALTER TABLE reminder_logs ADD CONSTRAINT fk_reminder_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- demo data
INSERT INTO users (username, password_hash, nickname, gender, height, weight, status) VALUES
('alice',   '$2a$10$demo_hash_alice_xxxxxxxxxxxxxxxxxxxxxx', '爱丽丝', 2, 165.0, 55.0, 1),
('bob',     '$2a$10$demo_hash_bob_xxxxxxxxxxxxxxxxxxxxxxxx', '小明',   1, 175.0, 70.0, 1),
('charlie', '$2a$10$demo_hash_charlie_xxxxxxxxxxxxxxxxxxxx', '查理',   1, 180.0, 75.0, 1);

INSERT INTO sport_types (code, name, need_distance, need_calories, is_active, sort_order) VALUES
('running',   '跑步', 1, 1, 1, 1),
('cycling',   '骑行', 1, 1, 1, 2),
('swimming',  '游泳', 1, 1, 1, 3),
('yoga',      '瑜伽', 0, 0, 1, 4),
('strength',  '力量训练', 0, 1, 1, 5),
('walking',   '步行', 1, 1, 1, 6);

INSERT INTO check_ins (user_id, sport_type_id, check_date, duration, distance, calories, remark, is_makeup) VALUES
(1, 1, '2026-07-08', 30, 5.20, 280, '晨跑', 0),
(1, 1, '2026-07-09', 45, 8.00, 420, '公园慢跑', 0),
(1, 4, '2026-07-10', 60, NULL, NULL, '晚间瑜伽', 0),
(2, 2, '2026-07-08', 40, 15.00, 350, '环湖骑行', 0),
(2, 6, '2026-07-09', 25, 3.50, 150, '饭后散步', 0),
(2, 5, '2026-07-10', 50, NULL, 300, '健身房', 0),
(3, 3, '2026-07-09', 35, 1.20, 320, '游泳馆', 0),
(3, 1, '2026-07-10', 20, 3.00, 180, '补卡跑步', 1);

INSERT INTO goals (user_id, period_type, target_type, target_value, period_start, period_end, status) VALUES
(1, 1, 2, 300.00, '2026-07-07', '2026-07-13', 0),
(1, 2, 1, 20.00,  '2026-07-01', '2026-07-31', 0),
(2, 1, 3, 50.00,  '2026-07-07', '2026-07-13', 0),
(3, 1, 2, 200.00, '2026-07-07', '2026-07-13', 1);

INSERT INTO reminder_settings (user_id, is_enabled, remind_time) VALUES
(1, 1, '20:00:00'),
(2, 1, '19:30:00'),
(3, 0, '21:00:00');

INSERT INTO reminder_logs (user_id, remind_date, sent_at, status) VALUES
(1, '2026-07-08', '2026-07-08 20:00:05', 1),
(1, '2026-07-09', '2026-07-09 20:00:03', 1),
(2, '2026-07-08', '2026-07-08 19:30:02', 1),
(2, '2026-07-09', NULL, 0),
(3, '2026-07-09', NULL, 2);
