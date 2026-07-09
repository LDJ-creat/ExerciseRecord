# 运动打卡系统 — 总体开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首个开发周期（7/9–7/10）内从零完成运动打卡系统全部目标功能：六大模块全量落地，用户可完成「注册 → 打卡 → 设目标 → 看统计/排行 → 看日历 → 收提醒」完整闭环。

**Architecture:** 前后端分离三层架构。`backend/` 使用 Go + Gin 提供 RESTful API，统一 JSON 响应 `{ code, message, data }`；`frontend/` 使用 React + Vite + HeroUI v3 + Tailwind CSS v4 + React Router + Axios，图表用 Recharts；`database/` 使用**本地安装**的 MySQL 8.0+（InnoDB/utf8mb4）。JWT Bearer 鉴权，密码 bcrypt。M04/M05 不单独建表，基于 `check_ins` 聚合查询。

**Tech Stack:** React 19+, Vite, TypeScript, HeroUI (`@heroui/react` + `@heroui/styles`), Tailwind CSS v4, Recharts, Axios | Go 1.22+, Gin, GORM, golang-jwt, bcrypt | MySQL 8.0+（本地实例）

**范围说明（无 P0/P1 分期）：** 本计划覆盖需求文档中全部功能点，含原文档标注为 P1/P2 的条目（个人资料、密码修改、补卡、记录编辑删除、目标修改、历史目标、类型分布、趋势分析、个人排名、Streak、智能跳过、浏览器通知），以及**日历热力图**与**提醒历史日志 UI**。

**已确认技术决策（2026-07-09）：**
- 前端框架：**React**
- 认证方案：**JWT**
- UI 组件库：**HeroUI v3**（替代 Ant Design）
- 数据库环境：**本地 MySQL 实例**（不使用 Docker Compose）
- 注册方式：**仅 username**，首周期不支持邮箱注册
- 首期必做增强：**日历热力图** + **提醒历史日志 UI**

---

## 一、项目目录结构

```
ExerciseRecord/
├── backend/
│   ├── cmd/server/main.go              # 入口
│   ├── internal/
│   │   ├── config/config.go            # 环境变量/配置
│   │   ├── middleware/auth.go          # JWT 中间件
│   │   ├── model/                      # GORM 模型
│   │   ├── handler/                    # HTTP handlers
│   │   ├── service/                    # 业务逻辑
│   │   └── repository/                 # 数据访问
│   ├── pkg/response/response.go        # 统一响应
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── api/                        # Axios 封装 + 各模块 API
│   │   ├── components/                 # 通用组件（HeroUI 封装）
│   │   ├── pages/                      # 页面（按模块）
│   │   ├── hooks/                      # useAuth, useReminder 等
│   │   ├── router/index.tsx
│   │   ├── store/auth.ts               # Token/用户信息
│   │   ├── index.css                   # Tailwind + HeroUI 样式入口
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/
│   ├── schema.sql                      # 建表 DDL
│   └── seed.sql                        # 运动类型初始数据
└── docs/
```

---

## 二、开发阶段总览

| 阶段 | 时间 | 产出 | 负责人侧重 |
|------|------|------|-----------|
| Phase 0 脚手架 | 7/9 上午 | 项目骨架、DB、统一规范 | 黎达均 |
| Phase 1 M01 用户管理 | 7/9 2 上午 | 注册/登录/资料/改密/JWT | 黎达均 |
| Phase 2 M02 运动打卡 | 7/9 下午 | 打卡 CRUD、补卡、唯一性校验 | 黎达均(后端) + 刘佳豪(前端) |
| Phase 3 M03 目标管理 | 7/9 晚 | 周/月目标、进度、历史 | 李佳龙 |
| Phase 4 M04 统计排行 | 7/10 上午 | 个人统计、图表、Top50 排行 | 李佳龙 |
| Phase 5 M05 日历 + M06 提醒 | 7/10 下午 | 月历、热力图、Streak、浏览器通知、提醒历史 | 丰坤华 |
| Phase 6 联调验收 | 7/10 晚 | E2E 流程、BUG 修复、文档 | 全员 |

---

## 三、统一规范（所有 Phase 共用）

### 3.1 API 响应格式

```go
// backend/pkg/response/response.go
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func OK(c *gin.Context, data interface{}) {
    c.JSON(200, Response{Code: 0, Message: "ok", Data: data})
}
func Fail(c *gin.Context, httpStatus, code int, msg string) {
    c.JSON(httpStatus, Response{Code: code, Message: msg})
}
```

### 3.2 错误码约定

| code | 含义 |
|------|------|
| 0 | 成功 |
| 40001 | 参数校验失败 |
| 40101 | 未登录/Token 无效 |
| 40301 | 越权访问 |
| 40401 | 资源不存在 |
| 40901 | 业务冲突（如重复打卡） |
| 50001 | 服务器内部错误 |

### 3.3 JWT Payload

```json
{ "user_id": 1, "username": "alice", "exp": 1730000000 }
```

Header: `Authorization: Bearer <token>`

### 3.4 HeroUI 前端规范

参考 [HeroUI Quick Start](https://www.heroui.com/docs/react/getting-started/quick-start) 与 [Vite 集成指南](https://www.heroui.com/docs/react/getting-started/frameworks)。

**依赖：**
```bash
npm i @heroui/react @heroui/styles tailwindcss @tailwindcss/vite
```

**样式入口（`frontend/src/index.css`）：**
```css
@import "tailwindcss";
@import "@heroui/styles";
```
导入顺序固定：`tailwindcss` 必须在 `@heroui/styles` 之前。

**Vite 配置：**
```ts
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } } },
});
```

**组件使用：** 从 `@heroui/react` 按需导入（`Button`, `Input`, `Card`, `Modal`, `Select`, `Switch`, `Tabs`, `Table`, `Progress` 等）。HeroUI v3 无需 Provider，安装并导入样式后即可使用。

**UI 映射约定（替代原 Ant Design）：**

| 场景 | HeroUI 组件 |
|------|-------------|
| 表单输入 | `Input`, `TextField`, `Select`, `DatePicker` |
| 按钮 | `Button` |
| 卡片/布局 | `Card`, `Navbar`, `Divider` |
| 弹窗 | `Modal` |
| 开关/进度 | `Switch`, `Progress` |
| 表格 | `Table` |
| 标签页 | `Tabs` |
| 提示 | `toast` 或自定义 Alert 组件 |

---

## Phase 0: 项目脚手架与数据库

### Task 0.1: 初始化后端启动后端

**Files:**
- Create: `backend/go.mod`, `backend/cmd/server/main.go`, `backend/internal/config/config.go`

- [ ] **Step 1: 初始化 Go 模块**

Run:
```bash
cd backend && go mod init github.com/exercise-record/backend
go get github.com/gin-gonic/gin gorm.io/gorm gorm.io/driver/mysql github.com/golang-jwt/jwt/v5 golang.org/x/crypto/bcrypt github.com/spf13/viper
```

- [ ] **Step 2: 编写 main.go 启动 Gin**

```go
// backend/cmd/server/main.go
package main

import (
    "github.com/exercise-record/backend/internal/config"
    "github.com/gin-gonic/gin"
)

func main() {
    cfg := config.Load()
    r := gin.Default()
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })
    r.Run(":" + cfg.Port)
}
```

- [ ] **Step 3: 验证启动**

Run: `go run ./cmd/server`
Expected: 监听 `:8080`，`GET /health` 返回 `{"status":"ok"}`

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "chore: init Go backend scaffold"
```

### Task 0.2: 初始化 React + HeroUI 前端

**Files:**
- Create: `frontend/` (Vite React TS 模板)
- Create: `frontend/src/index.css`

- [ ] **Step 1: 创建 Vite 项目并安装依赖**

Run:
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
npm install @heroui/react @heroui/styles tailwindcss @tailwindcss/vite axios react-router-dom recharts dayjs
```

- [ ] **Step 2: 配置 Tailwind + HeroUI 样式**

```css
/* frontend/src/index.css */
@import "tailwindcss";
@import "@heroui/styles";
```

在 `main.tsx` 顶部 `import "./index.css"`。

- [ ] **Step 3: 配置 Vite 代理与 Tailwind 插件**

```ts
// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } },
  },
});
```

- [ ] **Step 4: 验证 HeroUI 组件渲染**

在 `App.tsx` 中临时放置 `<Button variant="primary">Hello HeroUI</Button>`（从 `@heroui/react` 导入），确认样式正常。

Run: `npm run dev`
Expected: 页面可访问 `http://localhost:5173`，HeroUI 按钮样式正确

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "chore: init React frontend with HeroUI and Tailwind"
```

### Task 0.3: 数据库 DDL 与种子数据（本地 MySQL）

**Files:**
- Create: `database/schema.sql`, `database/seed.sql`
- Create: `backend/.env.example`（本地 MySQL 连接配置）

- [ ] **Step 1: 编写 schema.sql**

按数据库设计文档创建 6 张表：`users`, `sport_types`, `check_ins`, `goals`, `reminder_settings`, `reminder_logs`。包含全部索引、外键、`uk_check_ins_user_type_date` 唯一约束。`users.email` 字段保留但首周期注册不使用。

- [ ] **Step 2: 编写 seed.sql**

插入 6 种运动类型：running, walking, cycling, swimming, fitness, other。

- [ ] **Step 3: 在本地 MySQL 实例执行建表**

前提：本机已安装并启动 MySQL 8.0+ 服务。

Run:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sport_checkin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p sport_checkin < database/schema.sql
mysql -u root -p sport_checkin < database/seed.sql
```

Expected: `SHOW TABLES;` 显示 6 张表，`sport_types` 有 6 行。

- [ ] **Step 4: 编写 `.env.example`**

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sport_checkin
JWT_SECRET=your_jwt_secret
PORT=8080
```

- [ ] **Step 5: Commit**

```bash
git add database/ backend/.env.example
git commit -m "feat: add database schema and seed data for local MySQL"
```

### Task 0.4: GORM 模型与 DB 连接

**Files:**
- Create: `backend/internal/model/*.go`, `backend/internal/config/config.go` (DB DSN)
- Modify: `backend/cmd/server/main.go`

- [ ] **Step 1: 定义 User 模型**

```go
// backend/internal/model/user.go
type User struct {
    ID           uint64    `gorm:"primaryKey"`
    Username     string    `gorm:"size:50;uniqueIndex;not null"`
    Email        *string   `gorm:"size:100;uniqueIndex"`
    PasswordHash string    `gorm:"size:255;not null"`
    Nickname     string    `gorm:"size:50;not null"`
    AvatarURL    *string   `gorm:"size:500"`
    Gender       uint8     `gorm:"not null;default:0"`
    Height       *float64  `gorm:"type:decimal(5,1)"`
    Weight       *float64  `gorm:"type:decimal(5,1)"`
    Status       uint8     `gorm:"not null;default:1"`
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

- [ ] **Step 2: 定义 CheckIn, Goal, SportType, ReminderSetting, ReminderLog 模型**（字段与 schema.sql 一一对应）

- [ ] **Step 3: main.go 中初始化 GORM 连接并 AutoMigrate（开发环境）**

- [ ] **Step 4: 启动验证无 panic**

Run: `go run ./cmd/server`
Expected: 日志输出 DB connected

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add GORM models and database connection"
```

---

## Phase 1: M01 用户管理模块

### Task 1.1: 用户注册 API

**Files:**
- Create: `backend/internal/handler/auth_handler.go`, `backend/internal/service/auth_service.go`
- Test: `backend/internal/service/auth_service_test.go`

- [ ] **Step 1: 写失败测试 — 密码少于6位应拒绝**

```go
func TestRegister_PasswordTooShort(t *testing.T) {
    svc := NewAuthService(testDB)
    _, err := svc.Register(context.Background(), RegisterInput{
        Username: "alice", Password: "12345", Nickname: "Alice",
    })
    require.Error(t, err)
    assert.Contains(t, err.Error(), "password")
}
```

- [ ] **Step 2: 运行测试确认 FAIL**

Run: `go test ./internal/service/... -run TestRegister_PasswordTooShort -v`
Expected: FAIL

- [ ] **Step 3: 实现 Register**

逻辑：校验 username 唯一、password ≥ 6、bcrypt hash、创建 user（**仅 username + nickname，不处理 email**）、同时创建默认 `reminder_settings`（is_enabled=1, remind_time=20:00:00）。

- [ ] **Step 4: 注册路由 `POST /api/auth/register`**

Request:
```json
{ "username": "alice", "password": "123456", "nickname": "Alice" }
```
Response:
```json
{ "code": 0, "message": "ok", "data": { "user_id": 1, "username": "alice" } }
```

- [ ] **Step 5: 测试 PASS + Commit**

### Task 1.2: 用户登录 API

**Files:**
- Modify: `backend/internal/handler/auth_handler.go`

- [ ] **Step 1: 实现 `POST /api/auth/login`**

Request: `{ "username": "alice", "password": "123456" }`
Response: `{ "code": 0, "data": { "token": "<jwt>", "user": { "id": 1, "username": "alice", "nickname": "Alice" } } }`

- [ ] **Step 2: JWT 签发（exp 7天）**

- [ ] **Step 3: 错误密码返回 401**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add user register and login APIs"
```

### Task 1.3: JWT 鉴权中间件

**Files:**
- Create: `backend/internal/middleware/auth.go`

- [ ] **Step 1: 实现 AuthMiddleware**

解析 `Authorization: Bearer <token>`，校验签名与过期，将 `user_id` 写入 `gin.Context`。

- [ ] **Step 2: 未登录访问受保护路由返回 401**

- [ ] **Step 3: Commit**

### Task 1.4: 个人资料与密码修改

**Files:**
- Create: `backend/internal/handler/user_handler.go`

- [ ] **Step 1: `GET /api/user/profile`** — 返回当前用户资料

- [ ] **Step 2: `PUT /api/user/profile`** — 修改 nickname, avatar_url, gender, height, weight

- [ ] **Step 3: `PUT /api/user/password`** — 校验旧密码，更新 password_hash

- [ ] **Step 4: 所有路由挂载 AuthMiddleware**

- [ ] **Step 5: Commit**

### Task 1.5: 前端登录注册页

**Files:**
- Create: `frontend/src/pages/auth/Login.tsx`, `Register.tsx`
- Create: `frontend/src/api/auth.ts`, `frontend/src/store/auth.ts`
- Create: `frontend/src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Axios 拦截器** — 自动附加 Token，401 跳转登录

- [ ] **Step 2: 登录/注册表单页**（HeroUI `Input` + `Button` + `Card` 布局）

- [ ] **Step 3: ProtectedRoute** — 未登录重定向 `/login`

- [ ] **Step 4: 个人资料页 `/profile`** — HeroUI `Tabs` 分栏：编辑昵称/头像/性别/身高/体重，修改密码

- [ ] **Step 5: 手动验证注册→登录→改资料→改密码流程**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add auth pages and profile management"
```

---

## Phase 2: M02 运动打卡模块

### Task 2.1: 运动类型列表 API

**Files:**
- Create: `backend/internal/handler/sport_handler.go`

- [ ] **Step 1: `GET /api/sport-types`** — 返回启用的运动类型列表

Response data:
```json
[{ "id": 1, "code": "running", "name": "跑步", "need_distance": 1, "need_calories": 1 }]
```

- [ ] **Step 2: Commit**

### Task 2.2: 提交打卡 API

**Files:**
- Create: `backend/internal/handler/checkin_handler.go`, `backend/internal/service/checkin_service.go`
- Test: `backend/internal/service/checkin_service_test.go`

- [ ] **Step 1: 写失败测试 — 同用户同日期同类型重复打卡**

```go
func TestCreateCheckIn_DuplicateRejected(t *testing.T) {
    // 先创建一条 running@2026-07-01
    // 再创建同条件记录
    // 期望返回 409 冲突错误
}
```

- [ ] **Step 2: 实现 `POST /api/checkin`**

Request:
```json
{
  "sport_type_id": 1,
  "check_date": "2026-07-08",
  "duration": 30,
  "distance": 5.0,
  "calories": 300,
  "remark": "晨跑"
}
```

业务规则：
- duration/distance/calories ≥ 0
- check_date 不可为未来日期
- check_date < today → is_makeup = 1
- 唯一约束冲突 → code 40901

- [ ] **Step 3: 测试 PASS + Commit**

### Task 2.3: 打卡列表/详情/编辑/删除

**Files:**
- Modify: `backend/internal/handler/checkin_handler.go`

- [ ] **Step 1: `GET /api/checkin/list`** — 支持 query: `start_date`, `end_date`, `sport_type_id`, `page`, `page_size`

- [ ] **Step 2: `GET /api/checkin/:id`** — 详情（校验 user_id 归属）

- [ ] **Step 3: `PUT /api/checkin/:id`** — 编辑（不可改 user_id，改日期需重新校验唯一性）

- [ ] **Step 4: `DELETE /api/checkin/:id`** — 软删除或硬删除（硬删除即可）

- [ ] **Step 5: Commit**

### Task 2.4: 前端打卡页面

**Files:**
- Create: `frontend/src/pages/checkin/CheckInForm.tsx`, `CheckInList.tsx`, `frontend/src/api/checkin.ts`

- [ ] **Step 1: 打卡表单** — HeroUI `Select`（运动类型）、`DatePicker`（允许选过去日期=补卡）、`Input`（时长/距离/卡路里/备注）、`Button` 提交

- [ ] **Step 2: 打卡列表** — HeroUI `Table` 展示记录，筛选（日期范围、运动类型），`Modal` 编辑/删除

- [ ] **Step 3: 重复打卡时展示后端 409 错误提示**

- [ ] **Step 4: Commit**

---

## Phase 3: M03 目标管理模块

### Task 3.1: 创建/查询目标 API

**Files:**
- Create: `backend/internal/handler/goal_handler.go`, `backend/internal/service/goal_service.go`

- [ ] **Step 1: `POST /api/goal`**

Request:
```json
{
  "period_type": 1,
  "target_type": 2,
  "target_value": 300,
  "period_start": "2026-07-07",
  "period_end": "2026-07-13"
}
```

规则：每用户每 `(period_type, period_start)` 唯一；period_type: 1=周 2=月；target_type: 1=次数 2=时长 3=距离。

- [ ] **Step 2: `GET /api/goal`** — 当前进行中目标 + query `history=1` 返回历史目标

- [ ] **Step 3: `PUT /api/goal/:id`** — 周期内允许修改 target_value（status=0 才可改）

- [ ] **Step 4: Commit**

### Task 3.2: 目标进度计算 API

**Files:**
- Create: `backend/internal/service/goal_progress.go`

- [ ] **Step 1: `GET /api/goal/progress`**

返回当前周/月目标进度：
```json
{
  "goals": [{
    "id": 1,
    "period_type": 1,
    "target_type": 2,
    "target_value": 300,
    "actual_value": 120,
    "progress_percent": 40.0,
    "status": 0
  }]
}
```

计算逻辑（来自 DB 设计文档 6.1）：
- target_type=1: `COUNT(check_ins.id)` where check_date in [period_start, period_end]
- target_type=2: `SUM(duration)`
- target_type=3: `SUM(distance)`
- progress = actual / target × 100
- actual ≥ target → status=1（已达成）

- [ ] **Step 2: 周期结束后访问时自动标记 status=2（未达成）**

- [ ] **Step 3: Commit**

### Task 3.3: 前端目标管理页

**Files:**
- Create: `frontend/src/pages/goal/GoalManage.tsx`, `frontend/src/api/goal.ts`

- [ ] **Step 1: 目标设定表单** — HeroUI `Tabs`（周/月）、`Select`（指标类型）、`Input`（目标值）

- [ ] **Step 2: 进度条展示** — HeroUI `Progress` 组件

- [ ] **Step 3: 历史目标列表 Tab**

- [ ] **Step 4: Commit**

---

## Phase 4: M04 统计排行模块

### Task 4.1: 个人统计 API

**Files:**
- Create: `backend/internal/handler/stats_handler.go`, `backend/internal/service/stats_service.go`

- [ ] **Step 1: `GET /api/stats/personal`**

Query: `period=day|week|month|all`

Response:
```json
{
  "summary": {
    "total_count": 50,
    "total_duration": 1500,
    "total_distance": 120.5,
    "total_calories": 8000
  },
  "by_period": [{ "label": "2026-07-01", "count": 2, "duration": 60, "distance": 10, "calories": 400 }],
  "by_sport_type": [{ "sport_type_id": 1, "name": "跑步", "count": 20, "percent": 40.0 }],
  "trend": [{ "date": "2026-07-01", "duration": 30, "distance": 5 }]
}
```

- [ ] **Step 2: 全部基于 check_ins 聚合，校验 user_id 归属**

- [ ] **Step 3: Commit**

### Task 4.2: 全局排行 API

**Files:**
- Modify: `backend/internal/handler/stats_handler.go`

- [ ] **Step 1: `GET /api/stats/ranking`**

Query: `dimension=count|duration|distance`, `period=all|month|week`

Response:
```json
{
  "rankings": [
    { "rank": 1, "user_id": 3, "nickname": "Bob", "value": 120 }
  ],
  "my_rank": { "rank": 15, "value": 45 }
}
```

规则：Top 50，不暴露他人详细打卡记录。

- [ ] **Step 2: Commit**

### Task 4.3: 前端统计与排行页

**Files:**
- Create: `frontend/src/pages/stats/StatsDashboard.tsx`, `RankingPage.tsx`

- [ ] **Step 1: 概览卡片** — HeroUI `Card` 展示累计次数/时长/距离/卡路里

- [ ] **Step 2: Recharts 饼图** — 运动类型分布

- [ ] **Step 3: Recharts 折线图** — 趋势分析

- [ ] **Step 4: 排行榜** — HeroUI `Table` + `Select` 维度切换，个人排名行高亮

- [ ] **Step 5: Commit**

---

## Phase 5: M05 日历视图 + M06 打卡提醒

### Task 5.1: 日历数据 API

**Files:**
- Create: `backend/internal/handler/calendar_handler.go`, `backend/internal/service/calendar_service.go`

- [ ] **Step 1: `GET /api/calendar`**

Query: `year=2026&month=7`

Response:
```json
{
  "year": 2026,
  "month": 7,
  "days": [
    {
      "date": "2026-07-08",
      "checked": true,
      "count": 2,
      "total_duration": 60,
      "total_distance": 8.5,
      "heat_level": 3
    }
  ],
  "streak": 5,
  "max_duration": 120
}
```

`heat_level` 计算：按当月 `total_duration` 分 0–4 五档（0=无打卡，4=最高运动量），供前端热力图着色。

- [ ] **Step 2: Streak 算法** — 从今天/昨天起向前遍历连续自然日（有打卡记录即算打卡日）

- [ ] **Step 3: Commit**

### Task 5.2: 提醒设置与提醒日志 API

**Files:**
- Create: `backend/internal/handler/reminder_handler.go`, `backend/internal/service/reminder_service.go`

- [ ] **Step 1: `GET /api/reminder`** — 返回 is_enabled, remind_time

- [ ] **Step 2: `PUT /api/reminder`** — 更新开关与时间

Request: `{ "is_enabled": 1, "remind_time": "20:00" }`

- [ ] **Step 3: `GET /api/reminder/logs`** — 分页返回当前用户提醒历史

Query: `page`, `page_size`

Response:
```json
{
  "items": [
    { "id": 1, "remind_date": "2026-07-08", "sent_at": "2026-07-08T20:00:00", "status": 1 }
  ],
  "total": 30
}
```

`status`: 0=失败, 1=成功, 2=已跳过（当日已打卡）

- [ ] **Step 4: 提醒触发时写入 `reminder_logs`** — 前端 `useReminder` 触发通知后调用 `POST /api/reminder/logs` 记录发送结果；跳过时 status=2

- [ ] **Step 5: Commit**

### Task 5.3: 前端日历页（含热力图）

**Files:**
- Create: `frontend/src/pages/calendar/CalendarView.tsx`, `frontend/src/components/CalendarHeatmap.tsx`

- [ ] **Step 1: 月历网格** — 自定义 grid + HeroUI `Card` 容器，支持月份前后切换

- [ ] **Step 2: 打卡状态标记** — 已打卡日期根据 `heat_level` 显示 5 级渐变色（绿/浅绿/黄/橙/深绿热力图）

- [ ] **Step 3: 点击日期弹出 HeroUI `Modal`** — 展示当日打卡详情列表或空状态

- [ ] **Step 4: 顶部 HeroUI `Card`** — 展示 Streak 连续打卡天数

- [ ] **Step 5: 图例说明** — 热力图颜色深浅与运动量对应关系

- [ ] **Step 6: Commit**

### Task 5.4: 前端提醒功能

**Files:**
- Create: `frontend/src/hooks/useReminder.ts`, `frontend/src/pages/settings/ReminderSettings.tsx`
- Create: `frontend/src/api/reminder.ts`

- [ ] **Step 1: 提醒设置页** — HeroUI `Switch`（开关）+ `Input` type="time" 或时间选择组件

- [ ] **Step 2: 请求浏览器 Notification 权限**

- [ ] **Step 3: useReminder hook** — 每分钟检查：
  - is_enabled = true
  - 当前 HH:mm = remind_time
  - 当日无打卡记录（调用 `/api/checkin/list?start_date=today&end_date=today`）
  - 满足则 `new Notification("运动打卡提醒", { body: "今天还没有打卡哦！" })`，并调用 `POST /api/reminder/logs` 记录 status=1
  - 当日已打卡则调用 `POST /api/reminder/logs` 记录 status=2（智能跳过 FR-06-03）

- [ ] **Step 4: Commit**

### Task 5.5: 提醒历史日志 UI

**Files:**
- Create: `frontend/src/pages/settings/ReminderHistory.tsx`

- [ ] **Step 1: 提醒历史列表页** — HeroUI `Table` 展示 remind_date、sent_at、status（成功/失败/已跳过）

- [ ] **Step 2: 分页加载** — 调用 `GET /api/reminder/logs`

- [ ] **Step 3: 状态 Badge** — HeroUI 样式区分三种 status

- [ ] **Step 4: 在设置页或侧边栏添加入口链接**

- [ ] **Step 5: Commit**

---

## Phase 6: 联调、布局与验收

### Task 6.1: 应用布局与导航

**Files:**
- Create: `frontend/src/components/AppLayout.tsx`, `frontend/src/router/index.tsx`

- [ ] **Step 1: 侧边栏/顶栏导航** — HeroUI `Navbar` 或侧边 `Card` 导航：打卡、目标、统计、排行、日历、设置（含提醒历史）

- [ ] **Step 2: 登录态显示昵称 + HeroUI `Button` 退出**

- [ ] **Step 3: Commit**

### Task 6.2: 端到端验收测试

- [ ] **Step 1: 流程 A** — 注册新用户 → 登录 → 提交今日跑步打卡

- [ ] **Step 2: 流程 B** — 补卡昨天骑行 → 列表可见 is_makeup 标记

- [ ] **Step 3: 流程 C** — 设周目标 300 分钟 → 打卡后进度更新

- [ ] **Step 4: 流程 D** — 统计页数据与手动计算一致

- [ ] **Step 5: 流程 E** — 排行榜 Top50 + 我的排名

- [ ] **Step 6: 流程 F** — 日历标记 + 热力图色阶 + Streak 正确

- [ ] **Step 7: 流程 G** — 提醒设置保存 + 未打卡日触发通知 + 日志写入

- [ ] **Step 8: 流程 H** — 提醒历史页正确展示成功/跳过/失败记录

- [ ] **Step 9: 安全** — 用户 A 的 Token 不可操作用户 B 的数据（返回 403）

### Task 6.3: README 与启动文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 环境要求（Go、Node.js、本地 MySQL 8.0+）、HeroUI 前端启动、后端启动、默认端口、测试账号说明**

- [ ] **Step 2: Commit**

```bash
git commit -m "docs: add README and complete integration"
```

---

## 四、接口清单速查

| 模块 | 方法 | 路径 | 鉴权 |
|------|------|------|------|
| M01 | POST | /api/auth/register | 否 |
| M01 | POST | /api/auth/login | 否 |
| M01 | GET/PUT | /api/user/profile | 是 |
| M01 | PUT | /api/user/password | 是 |
| M02 | GET | /api/sport-types | 是 |
| M02 | POST | /api/checkin | 是 |
| M02 | GET | /api/checkin/list | 是 |
| M02 | GET/PUT/DELETE | /api/checkin/:id | 是 |
| M03 | POST/GET/PUT | /api/goal | 是 |
| M03 | GET | /api/goal/progress | 是 |
| M04 | GET | /api/stats/personal | 是 |
| M04 | GET | /api/stats/ranking | 是 |
| M05 | GET | /api/calendar | 是 |
| M06 | GET/PUT | /api/reminder | 是 |
| M06 | GET | /api/reminder/logs | 是 |
| M06 | POST | /api/reminder/logs | 是 |

---

## 五、并行开发建议（4人团队）

```
7/9 上午  ── 全员: Phase 0 脚手架（黎达均主导后端+本地DB，刘佳豪/丰坤华搭 HeroUI 前端，李佳龙写 schema）
7/9 下午  ── 黎达均: Phase 1 完成 → Phase 2 后端
           ── 刘佳豪: Phase 2 前端（HeroUI 打卡页，等 API 就绪后对接）
           ── 李佳龙: Phase 3（依赖 M02 打卡数据，可先写 mock）
           ── 丰坤华: AppLayout + Phase 5 日历/热力图 UI 骨架
7/10 上午 ── 李佳龙: Phase 4
           ── 丰坤华: Phase 5 提醒 + 提醒历史页 + 日历 API 对接
           ── 刘佳豪: Phase 2 联调收尾
7/10 下午 ── 全员: Phase 6 联调验收（含热力图、提醒历史 E2E）
```

**接口契约先行：** Phase 0 完成后，黎达均输出 OpenAPI 或 Postman Collection，前端可并行 mock 开发。

---

## 六、规范自检（Spec Coverage）

| 需求 | 对应 Task | 覆盖 |
|------|-----------|------|
| FR-01-01~05 用户管理 | Task 1.1~1.5 | ✅ |
| FR-02-01~06 运动打卡 | Task 2.1~2.4 | ✅ |
| FR-03-01~05 目标管理 | Task 3.1~3.3 | ✅ |
| FR-04-01~06 统计排行 | Task 4.1~4.3 | ✅ |
| FR-05-01~04 日历视图 | Task 5.1, 5.3 | ✅ |
| FR-05 热力图增强 | Task 5.1, 5.3 | ✅ |
| FR-06-01~04 打卡提醒 | Task 5.2, 5.4, 5.5 | ✅ |
| 提醒历史日志 UI | Task 5.2, 5.5 | ✅ |
| NFR-06 bcrypt | Task 1.1 | ✅ |
| NFR-07 越权防护 | Task 1.3 + 各 handler | ✅ |

---

## 七、已确认技术决策（归档）

| 决策项 | 确认结果 | 日期 |
|--------|----------|------|
| 前端框架 | **React** | 2026-07-09 |
| 认证方案 | **JWT** | 2026-07-09 |
| UI 组件库 | **HeroUI v3** + Tailwind CSS v4 | 2026-07-09 |
| MySQL 环境 | **本地安装实例**（非 Docker） | 2026-07-09 |
| 邮箱注册 | **首周期不支持**，仅 username | 2026-07-09 |
| 日历热力图 | **纳入首期必做** | 2026-07-09 |
| 提醒历史日志 UI | **纳入首期必做** | 2026-07-09 |

---

*Plan complete. 共 6 个 Phase、27 个 Task，覆盖六大模块全部目标功能（含热力图与提醒历史）。*

**细粒度任务文件：** `docs/superpowers/plans/tasks/T*.md`（27 个）  
**开发顺序指南：** `docs/superpowers/plans/execution-order.md`  
**设计规范：** `docs/design/design-system.md`  
**Agent 上下文：** `AGENTS.md`
