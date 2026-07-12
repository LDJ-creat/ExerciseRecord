# OpenGauss 答辩演示命令手册

> 运动打卡系统 · 数据库演示用  
> 数据库：`sport_checkin` | 容器：`opengauss` | 端口：`15432`

---

## 连接信息

| 项目 | 值 |
|------|-----|
| 数据库类型 | openGauss Lite 5.0.3 |
| 容器名 | `opengauss` |
| 主机端口 | `localhost:15432` |
| 数据库名 | `sport_checkin` |
| 用户名 | `gaussdb` |
| 密码 | `OpenGauss@123` |

---

## 一、启动前检查

确认 Docker 容器正在运行：

```powershell
docker ps --filter "name=opengauss"
```

若容器已停止，执行：

```powershell
docker start opengauss
```

---

## 二、进入 OpenGauss 交互式命令行（推荐答辩方式）

```powershell
docker exec -it -u omm opengauss bash -lc "gsql -d sport_checkin -U gaussdb -W OpenGauss@123"
```

进入后提示符为 `sport_checkin=#`，可连续执行下方 SQL 元命令。

---

## 三、答辩演示步骤（按顺序执行）

### 1. 查看所有数据库

```sql
\l
```

### 2. 确认当前数据库

```sql
SELECT current_database();
```

### 3. 列出所有表（共 6 张）

```sql
\dt
```

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `sport_types` | 运动类型字典 |
| `check_ins` | 运动打卡记录 |
| `goals` | 运动目标 |
| `reminder_settings` | 打卡提醒设置 |
| `reminder_logs` | 提醒发送日志 |

### 4. 查看表结构

```sql
\d users
\d sport_types
\d check_ins
\d goals
\d reminder_settings
\d reminder_logs
```

### 5. 查看各表数据

```sql
SELECT * FROM users;
SELECT * FROM sport_types;
SELECT * FROM check_ins;
SELECT * FROM goals;
SELECT * FROM reminder_settings;
SELECT * FROM reminder_logs;
```

### 6. 业务联表查询（展示表关系）

```sql
SELECT c.id, u.nickname, s.name AS sport, c.check_date, c.duration, c.distance, c.remark
FROM check_ins c
JOIN users u ON c.user_id = u.id
JOIN sport_types s ON c.sport_type_id = s.id
ORDER BY c.check_date;
```

### 7. 统计各表数据量

```sql
SELECT
  (SELECT COUNT(*) FROM users)             AS users,
  (SELECT COUNT(*) FROM sport_types)       AS sport_types,
  (SELECT COUNT(*) FROM check_ins)         AS check_ins,
  (SELECT COUNT(*) FROM goals)             AS goals,
  (SELECT COUNT(*) FROM reminder_settings) AS reminder_settings,
  (SELECT COUNT(*) FROM reminder_logs)     AS reminder_logs;
```

### 8. 退出

```sql
\q
```

---

## 四、单条命令快速展示（不进入交互模式）

**列出所有表：**

```powershell
docker exec -u omm opengauss bash -lc "gsql -d sport_checkin -U gaussdb -W OpenGauss@123 -c '\dt'"
```

**查看用户表：**

```powershell
docker exec -u omm opengauss bash -lc "gsql -d sport_checkin -U gaussdb -W OpenGauss@123 -c 'SELECT * FROM users;'"
```

**查看打卡记录：**

```powershell
docker exec -u omm opengauss bash -lc "gsql -d sport_checkin -U gaussdb -W OpenGauss@123 -c 'SELECT * FROM check_ins;'"
```

**查看表结构（users）：**

```powershell
docker exec -u omm opengauss bash -lc "gsql -d sport_checkin -U gaussdb -W OpenGauss@123 -c '\d users'"
```

**联表查询：**

```powershell
docker exec -u omm opengauss bash -lc "gsql -d sport_checkin -U gaussdb -W OpenGauss@123 -c 'SELECT c.id, u.nickname, s.name AS sport, c.check_date, c.duration FROM check_ins c JOIN users u ON c.user_id=u.id JOIN sport_types s ON c.sport_type_id=s.id ORDER BY c.check_date;'"
```

---

## 五、建议演示流程（约 2 分钟）

1. `docker ps` — 展示容器运行中
2. 进入 `gsql` 交互环境
3. `\dt` — 展示 6 张业务表
4. `\d check_ins` — 展示打卡表字段结构
5. `SELECT * FROM users;` — 3 个演示用户
6. `SELECT * FROM check_ins;` — 8 条打卡记录
7. 联表查询 — 说明用户、运动类型、打卡记录的关系
8. 统计查询 — 各表数据量一览

---

## 六、初始化脚本位置

如需重新建库建表，SQL 脚本位于：

- `database/opengauss_tables.sql` — 表结构 + 演示数据
