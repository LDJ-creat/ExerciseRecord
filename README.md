# 运动打卡系统（ExerciseRecord）

面向个人用户的运动自我管理 Web 应用：注册登录、多类型运动打卡、周/月目标、数据统计排行、日历热力图、打卡提醒。

> 详细 Agent 上下文与 API 规范见 [AGENTS.md](./AGENTS.md)

---

## 环境要求

| 依赖 | 版本 |
|------|------|
| Go | 1.22+ |
| Node.js | 18+ |
| MySQL | 8.0+（本地安装，非 Docker） |
| npm | 9+ |

---

## 快速启动

### 1. 数据库初始化

```powershell
# 复制并编辑数据库配置
copy backend\.env.example backend\.env
# 修改 DB_PASSWORD、JWT_SECRET 等

# 一键建库、建表、种子数据
cd backend
go run ./cmd/bootstrap
```

`bootstrap` 会创建 `sport_checkin` 数据库，执行 `database/schema.sql` 和 `database/seed.sql`（6 种运动类型）。

### 2. 启动后端

```powershell
cd backend
go run ./cmd/server
```

默认监听 **http://localhost:8080**，健康检查：`GET /health`

### 3. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

默认 **http://localhost:5173**，Vite 已将 `/api` 代理到 `:8080`。

---

## 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 API | 8080 | Gin HTTP 服务 |
| 前端 Dev | 5173 | Vite 开发服务器 |
| MySQL | 3306 | 本地数据库 |

---

## 测试账号

系统无预置用户，请通过注册页创建：

1. 打开 http://localhost:5173/register
2. 输入用户名（仅 username，无邮箱）、密码（≥6 位）、昵称
3. 注册后自动跳转登录，或手动登录

**E2E 测试用户：** 验收脚本会自动创建 `e2e_a_*` / `e2e_b_*` 临时用户，无需手动准备。

---

## 功能模块

| 路由 | 功能 |
|------|------|
| `/checkin` | 运动打卡（表单 + 列表 + 补录） |
| `/goals` | 周/月目标设定与进度 |
| `/stats` | 个人统计（Recharts 图表） |
| `/ranking` | 排行榜 Top50 |
| `/calendar` | 日历热力图 + 连续打卡 Streak |
| `/settings` | 提醒设置与历史 |

---

## 测试

```powershell
# 后端单元测试
cd backend
go test ./...

# E2E 验收（需后端已启动）
go test -tags=integration ./internal/service -run TestE2E -v

# 前端构建
cd frontend
npm run build
```

验收报告：[docs/qa-acceptance.md](./docs/qa-acceptance.md)

---

## 项目结构

```
ExerciseRecord/
├── AGENTS.md           # Agent 开发上下文
├── README.md           # 本文件
├── backend/            # Go API（Gin + GORM + JWT）
├── frontend/           # React SPA（HeroUI v3 + Tailwind v4）
├── database/           # schema.sql, seed.sql
└── docs/
    ├── design/         # 设计规范「晨曦跑道 · Dawn Track」
    └── superpowers/plans/  # 开发计划与任务
```

---

## 设计规范

前端遵循 **「晨曦跑道 · Dawn Track」** 设计方向，详见 [docs/design/design-system.md](./docs/design/design-system.md)。

---

## 团队

课程大作业 · 2026-07-08 ~ 2026-07-10
