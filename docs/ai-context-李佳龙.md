# AI 开发上下文总结 — 李佳龙

> **项目：** 运动打卡系统（ExerciseRecord）  
> **角色：** 后端业务开发 · M01 登录/资料 · M02 打卡 CRUD · M03 目标管理 · M04 统计 API  
> **开发周期：** 2026-07-09 ~ 2026-07-10  
> **任务来源：** [飞书多维表格](https://qcndmg3uorlg.feishu.cn/base/I6rKbjA7wacoNbsdArHcE3bUnqf?table=tblOhzC9mW5ygMnb&view=vewhP7JKEa)

---

## 一、负责任务清单

| Task ID | 任务描述 | Wave | 分支 / Worktree |
|---------|----------|------|-----------------|
| T00-04 | GORM 模型与数据库连接 | Wave 0 | `main` |
| T01-02 | 用户登录 API | Wave 1 | `feat/T01-02-login` |
| T01-04 | 个人资料与密码修改 API | Wave 1 | `feat/T01-04-profile` |
| T02-03 | 打卡列表/详情/编辑/删除 API | Wave 2 | `feat/T02-03-checkin-crud` |
| T03-01 | 目标创建/查询/修改 API | Wave 3-A | `.worktrees/T03-goal/` |
| T03-02 | 目标进度计算 API | Wave 3-A | `.worktrees/T03-goal/` |
| T04-01 | 个人统计 API | Wave 3-B | `.worktrees/T04-stats/` |
| T06-02 | 端到端验收测试 | Wave 4 | `main`（全员） |

---

## 二、提供给 AI 的核心上下文

### 2.1 必读文档

| 优先级 | 文件 | 用途 |
|--------|------|------|
| 1 | `AGENTS.md` | 全局上下文、API 规范、错误码 |
| 2 | 当前任务 `docs/superpowers/plans/tasks/Txx-xx-*.md` | 实现步骤、验收标准 |
| 3 | `docs/superpowers/plans/execution-order.md` | 依赖关系、Wave 3 并行组 |
| 4 | `database/schema.sql` | 表结构、字段约束（业务逻辑依据） |

### 2.2 典型 Agent 提示词

```
请执行 Txx-xx。阅读 AGENTS.md 和 docs/superpowers/plans/tasks/<TASK_FILE>.md。

【执行要求】
- TDD：先写 service 层单元测试
- 使用 SQLite 内存库（testutil_test.go 公共夹具）
- 遵循统一响应格式与 JWT 用户隔离
- go test ./... 全部通过
- 不要 git commit

【Wave 3 注意】
若在 .worktrees/T03-goal/ 或 .worktrees/T04-stats/ 开发，
完成后需 merge 回 main，注意 main.go 路由冲突。
```

### 2.3 业务规则上下文（写入提示词）

**打卡模块（T02-03）：**
- 列表支持 `start_date` / `end_date` / `sport_type_id` 筛选
- 越权访问他人记录 → `40301`
- 编辑后唯一性冲突 → `40901`
- 分页默认 `page_size=20`

**目标模块（T03-01~02）：**
- `period_type` 1=周 / 2=月；`target_type` 1=次数 / 2=时长 / 3=距离
- `(user_id, period_type, period_start)` 唯一 → `40901`
- 进度 API：`GET /api/goal/progress` **须注册在** `GET /:id` **之前**
- 自动状态：`actual >= target` → `status=1`；周期结束未达成 → `status=2`

**统计模块（T04-01）：**
- `GET /api/stats/personal?period=day|week|month|all`
- 响应：`summary` / `by_period` / `by_sport_type` / `trend`
- `by_period` 在 `all` 周期下按月分桶

---

## 三、AI 辅助开发工作流

### 3.1 Wave 0 — GORM 模型（T00-04）

依赖 T00-01 + T00-03 完成后执行：

- 实现 6 个 GORM 模型：`User`、`SportType`、`CheckIn`、`Goal`、`ReminderSetting`、`ReminderLog`
- MySQL 连接封装（`internal/database/database.go`）
- 验证 `DB connected` 日志

### 3.2 Wave 1 — 认证链后半段

| 任务 | 端点 | 要点 |
|------|------|------|
| T01-02 | `POST /api/auth/login` | JWT 签发（7 天）、返回 token + user |
| T01-04 | `GET/PUT /api/user/profile` | 可选字段用 `optional.Float64`；`PUT /api/user/password` |

**契约冻结：** T01-04 完成后 M01 全部 API 可用。

### 3.3 Wave 2 — 打卡 CRUD（T02-03）

在 T02-02 完成后实现：

```
GET  /api/checkin/list     # 筛选 + 分页
GET  /api/checkin/:id      # 单条详情
PUT  /api/checkin/:id      # 编辑
DELETE /api/checkin/:id    # 删除
```

TDD 测试：列表筛选、越权 403、编辑冲突 409、删除成功。

### 3.4 Wave 3 — 并行组 A/B

**组 A 目标链（`.worktrees/T03-goal/`）：**

```
T03-01 目标 CRUD → T03-02 进度聚合 → （前端 T03-03 由刘佳豪完成）
```

**组 B 统计链（`.worktrees/T04-stats/`）：**

```
T04-01 个人统计 → （T04-02 排行由黎达均完成）→ （前端 T04-03 由刘佳豪完成）
```

Wave 3 启动条件：T02-02 完成（有打卡数据）+ T01-03 完成（JWT）。

每个任务完成后触发 **code-reviewer** 子 Agent 审查，修复 BLOCKER 与 Important 项。

---

## 四、关键产出文件

```
backend/internal/
├── model/                          # 6 个 GORM 模型
├── service/
│   ├── user_service.go             # 资料更新
│   ├── user_service_test.go
│   ├── checkin_service.go          # 打卡 CRUD（扩展）
│   ├── checkin_service_test.go
│   ├── goal_service.go             # 目标 CRUD
│   ├── goal_progress.go            # 进度计算
│   ├── goal_service_test.go
│   ├── goal_progress_test.go
│   ├── stats_service.go            # 个人统计聚合
│   └── stats_service_test.go
├── handler/
│   ├── user_handler.go
│   ├── checkin_handler.go
│   ├── goal_handler.go
│   └── stats_handler.go
└── pkg/optional/float64.go         # 可空浮点（身高/体重清空）
```

---

## 五、遇到的问题与 AI 协作经验

| 问题 | 处理方式 |
|------|----------|
| 目标进度路由被 `/:id` 拦截 | `GET /progress` 注册在 `PUT /:id` 之前 |
| 资料页无法清空身高/体重 | 新增 `optional.Float64`，区分 JSON absent/null/number |
| 目标历史列表与当前 Tab 重复 | 历史筛选改为 `period_end < today` |
| Wave 3 并行 `main.go` 冲突 | 合并时手动整合 goal/stats/calendar/reminder 路由 |
| `period=all` 内存聚合性能 | 课程规模可接受，code review 标注为技术债 |

### TDD 测试覆盖（本人负责模块）

| 模块 | 测试文件 | 用例数 |
|------|----------|--------|
| 用户资料 | `user_service_test.go` | 含越权、null 清空 |
| 打卡 CRUD | `checkin_service_test.go` | 列表/越权/编辑/删除 |
| 目标 | `goal_service_test.go` + `goal_progress_test.go` | 7 + 6 项 |
| 统计 | `stats_service_test.go` | 9 项个人统计 |

### 协作建议

1. Wave 3 可与 Wave 2 后端并行，但**必须等 T02-02** 有打卡数据才能验证聚合逻辑
2. 使用 Worktree 隔离 `.worktrees/T03-goal/` 和 `.worktrees/T04-stats/`
3. 合并顺序：后端 API 先合入 `main`，再合前端 Worktree
4. 每个 service 保持显式 `Select` 列，避免 `SELECT *`

---

## 六、参考链接

- 开发计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 任务索引：`docs/superpowers/plans/execution-order.md` §四
- E2E 验收：`docs/qa-acceptance.md`
