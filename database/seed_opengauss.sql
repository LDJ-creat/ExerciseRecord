-- sport_checkin seed data (OpenGauss)

INSERT INTO sport_types (code, name, need_distance, need_calories, is_active, sort_order) VALUES
  ('running',  '跑步', 1, 1, 1, 1),
  ('walking',  '步行', 1, 0, 1, 2),
  ('cycling',  '骑行', 1, 1, 1, 3),
  ('swimming', '游泳', 0, 1, 1, 4),
  ('fitness',  '健身', 0, 1, 1, 5),
  ('other',    '其他', 0, 0, 1, 6)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  need_distance = EXCLUDED.need_distance,
  need_calories = EXCLUDED.need_calories,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;
