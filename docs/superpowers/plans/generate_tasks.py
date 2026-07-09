# -*- coding: utf-8 -*-
"""Generate task markdown files. Run once: python docs/superpowers/plans/generate_tasks.py"""
import os

BASE = os.path.join(os.path.dirname(__file__), "tasks")

TEMPLATE = """# {title}

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `{task_id}` |
| **Phase** | {phase} |
| **类型** | {task_type} |
| **预估工时** | {estimate} |
| **推荐分支** | `{branch}` |
| **Worktree** | {worktree} |
| **依赖任务** | {deps} |
| **阻塞任务** | {blocks} |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：{task_id} — {short_title}
前置条件：{deps_note}

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

{func_design}

---

## 实现方式

{impl}

---

## 涉及文件

{files}

---

## 实现步骤

{steps}

---

## 测试与验收标准

{acceptance}

---

## 完成检查清单

{checklist}

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
"""

TASKS = [
    {
        "task_id": "T00-01", "file": "T00-01-backend-scaffold.md",
        "title": "Task T00-01: 初始化 Go 后端脚手架", "short_title": "Go 后端脚手架",
        "phase": "Phase 0", "task_type": "backend", "estimate": "30min",
        "branch": "main", "worktree": "否（main 直接开发）",
        "deps": "无", "blocks": "T00-04, T01-01", "deps_note": "无，项目首个后端任务",
        "func_design": "建立 Go 后端最小可运行骨架：Gin HTTP 服务、配置加载、`/health` 健康检查。",
        "impl": "go mod init → 安装 gin/viper → config.Load() 读 PORT → main 注册 /health。",
        "files": "- Create: `backend/go.mod`, `backend/cmd/server/main.go`, `backend/internal/config/config.go`",
        "steps": "- [ ] Step 1: 初始化 Go 模块\n- [ ] Step 2: 实现 config.go\n- [ ] Step 3: 实现 main.go\n- [ ] Step 4: go run 验证\n- [ ] Step 5: 提交",
        "acceptance": "| 1 | 服务启动 | go run 无 panic |\n| 2 | /health | 返回 status ok |",
        "checklist": "- [ ] 验收通过\n- [ ] 保持脚手架纯净",
    },
    {
        "task_id": "T00-02", "file": "T00-02-frontend-heroui-scaffold.md",
        "title": "Task T00-02: 初始化 React + HeroUI 前端脚手架", "short_title": "React+HeroUI 脚手架",
        "phase": "Phase 0", "task_type": "frontend", "estimate": "45min",
        "branch": "feat/T00-02-frontend-scaffold",
        "worktree": "`.worktrees/T00-02-frontend/`（与 T00-01 并行）",
        "deps": "无", "blocks": "T01-05, T06-01", "deps_note": "无，可与 T00-01/T00-03 并行",
        "func_design": "Vite React TS + HeroUI v3 + Tailwind v4 + 设计 Token + API 代理。",
        "impl": "按 design-system.md 配置样式链、字体、design-tokens.css、vite proxy。",
        "files": "- Create: frontend/ 全套\n- Create: frontend/src/styles/design-tokens.css, typography.css",
        "steps": "- [ ] 创建 Vite 项目\n- [ ] 安装 HeroUI+Tailwind\n- [ ] 引入 tokens 和字体\n- [ ] 配置代理\n- [ ] 验证 Button 渲染\n- [ ] 提交",
        "acceptance": "| 1 | dev server | localhost:5173 可访问 |\n| 2 | HeroUI 样式 | Button 正确 |\n| 3 | 背景色 | #F4F7FB |",
        "checklist": "- [ ] tokens 已引入\n- [ ] 可并行合并",
    },
    {
        "task_id": "T00-03", "file": "T00-03-database-schema.md",
        "title": "Task T00-03: 数据库 DDL 与种子数据", "short_title": "MySQL 建表",
        "phase": "Phase 0", "task_type": "database", "estimate": "45min",
        "branch": "main", "worktree": "否",
        "deps": "无", "blocks": "T00-04, 全部后端", "deps_note": "无，可与 T00-01/T00-02 并行",
        "func_design": "6 张表 DDL + 运动类型种子 + .env.example。",
        "impl": "schema.sql + seed.sql，本地 mysql 执行。",
        "files": "- Create: database/schema.sql, seed.sql, backend/.env.example",
        "steps": "- [ ] 编写 schema\n- [ ] 编写 seed\n- [ ] 本地执行\n- [ ] 验证\n- [ ] 提交",
        "acceptance": "| 1 | 6 张表 | SHOW TABLES |\n| 2 | 6 行类型 | sport_types |",
        "checklist": "- [ ] 无真实密码入库",
    },
    {
        "task_id": "T00-04", "file": "T00-04-gorm-models.md",
        "title": "Task T00-04: GORM 模型与数据库连接", "short_title": "GORM 模型",
        "phase": "Phase 0", "task_type": "backend", "estimate": "45min",
        "branch": "main", "worktree": "否",
        "deps": "T00-01, T00-03", "blocks": "T01-01", "deps_note": "T00-01+T00-03 完成",
        "func_design": "6 个 GORM 模型 + MySQL 连接初始化。",
        "impl": "model/*.go + config DSN + main 连接 DB。",
        "files": "- Create: backend/internal/model/*.go\n- Modify: config.go, main.go",
        "steps": "- [ ] User 模型\n- [ ] 其余 5 模型\n- [ ] DB 连接\n- [ ] 验证\n- [ ] 提交",
        "acceptance": "| 1 | DB connected 日志 |\n| 2 | 6 模型文件 |",
        "checklist": "- [ ] /health 仍可用",
    },
    {
        "task_id": "T01-01", "file": "T01-01-user-register-api.md",
        "title": "Task T01-01: 用户注册 API", "short_title": "注册 API",
        "phase": "Phase 1", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T01-01-register", "worktree": "否（顺序开发）",
        "deps": "T00-04", "blocks": "T01-02, T01-05", "deps_note": "GORM 已连接",
        "func_design": "POST /api/auth/register：username 唯一、密码≥6、bcrypt、创建默认 reminder_settings。仅 username，无 email。",
        "impl": "TDD：先写密码过短测试 → auth_service.Register → auth_handler → 路由。",
        "files": "- Create: handler/auth_handler.go, service/auth_service.go, service/auth_service_test.go\n- Create: pkg/response/response.go",
        "steps": "- [ ] 写失败测试\n- [ ] 实现 Register\n- [ ] 注册路由\n- [ ] 测试 PASS\n- [ ] 提交",
        "acceptance": "| 1 | 正常注册 | code 0 |\n| 2 | 密码<6 | 40001 |\n| 3 | 重复用户名 | 40901 |\n| 4 | 默认提醒 | reminder_settings 自动创建 |",
        "checklist": "- [ ] bcrypt 哈希\n- [ ] 不处理 email",
    },
    {
        "task_id": "T01-02", "file": "T01-02-user-login-api.md",
        "title": "Task T01-02: 用户登录 API", "short_title": "登录 API",
        "phase": "Phase 1", "task_type": "backend", "estimate": "45min",
        "branch": "feat/T01-02-login", "worktree": "否",
        "deps": "T01-01", "blocks": "T01-03, T01-05", "deps_note": "注册 API 已完成",
        "func_design": "POST /api/auth/login：校验密码，签发 JWT（7天），返回 token + user。",
        "impl": "auth_service.Login + JWT 签发（golang-jwt）。",
        "files": "- Modify: auth_handler.go, auth_service.go\n- Create: pkg/jwt/jwt.go",
        "steps": "- [ ] 实现 Login\n- [ ] JWT 签发\n- [ ] 错误密码 401\n- [ ] 提交",
        "acceptance": "| 1 | 正确登录 | 返回 token |\n| 2 | 错误密码 | 40101 |\n| 3 | JWT 可解析 | payload 含 user_id |",
        "checklist": "- [ ] exp 7天",
    },
    {
        "task_id": "T01-03", "file": "T01-03-jwt-middleware.md",
        "title": "Task T01-03: JWT 鉴权中间件", "short_title": "JWT 中间件",
        "phase": "Phase 1", "task_type": "backend", "estimate": "30min",
        "branch": "feat/T01-03-jwt-middleware", "worktree": "否",
        "deps": "T01-02", "blocks": "T01-04, T02-01", "deps_note": "JWT 签发已实现",
        "func_design": "AuthMiddleware：解析 Bearer Token，校验签名/过期，注入 user_id 到 Context。",
        "impl": "middleware/auth.go，未登录返回 40101。",
        "files": "- Create: backend/internal/middleware/auth.go",
        "steps": "- [ ] 实现中间件\n- [ ] 测试受保护路由\n- [ ] 提交",
        "acceptance": "| 1 | 无 Token | 401 |\n| 2 | 有效 Token | 通过 |\n| 3 | 过期 Token | 401 |",
        "checklist": "- [ ] user_id 写入 Context",
    },
    {
        "task_id": "T01-04", "file": "T01-04-user-profile-api.md",
        "title": "Task T01-04: 个人资料与密码修改 API", "short_title": "资料/改密 API",
        "phase": "Phase 1", "task_type": "backend", "estimate": "45min",
        "branch": "feat/T01-04-profile", "worktree": "否",
        "deps": "T01-03", "blocks": "T01-05", "deps_note": "JWT 中间件可用",
        "func_design": "GET/PUT /api/user/profile；PUT /api/user/password（校验旧密码）。",
        "impl": "user_handler.go，所有路由挂 AuthMiddleware。",
        "files": "- Create: backend/internal/handler/user_handler.go",
        "steps": "- [ ] GET profile\n- [ ] PUT profile\n- [ ] PUT password\n- [ ] 挂载中间件\n- [ ] 提交",
        "acceptance": "| 1 | GET 返回本人资料 |\n| 2 | PUT 更新成功 |\n| 3 | 旧密码错误 | 40001 |\n| 4 | 未登录 | 401 |",
        "checklist": "- [ ] 仅操作本人数据",
    },
    {
        "task_id": "T01-05", "file": "T01-05-auth-frontend.md",
        "title": "Task T01-05: 前端登录注册与资料页", "short_title": "认证前端",
        "phase": "Phase 1", "task_type": "frontend", "estimate": "90min",
        "branch": "feat/T01-05-auth-frontend",
        "worktree": "`.worktrees/T01-05-auth/`",
        "deps": "T00-02, T01-04", "blocks": "T02-04, T06-01", "deps_note": "前端脚手架+M01 API 全部就绪",
        "func_design": "登录/注册页、Axios 拦截器、ProtectedRoute、个人资料页。遵循 Dawn Track 设计规范。",
        "impl": "HeroUI Card+Input+Button+Tabs；localStorage 存 token；401 跳登录。",
        "files": "- Create: pages/auth/Login.tsx, Register.tsx, pages/profile/Profile.tsx\n- Create: api/client.ts, api/auth.ts, store/auth.ts, components/ProtectedRoute.tsx",
        "steps": "- [ ] Axios 拦截器\n- [ ] 登录注册页（设计规范）\n- [ ] ProtectedRoute\n- [ ] 资料页 Tabs\n- [ ] 手动流程验证\n- [ ] 提交",
        "acceptance": "| 1 | 注册→登录 | 成功获取 token |\n| 2 | 改资料 | 刷新后保持 |\n| 3 | 改密码 | 新密码可登录 |\n| 4 | 未登录访问 | 跳 /login |\n| 5 | 视觉 | 符合 design-system |",
        "checklist": "- [ ] 注册无 email 字段\n- [ ] LaneStripe 用于登录页 Hero",
    },
    {
        "task_id": "T02-01", "file": "T02-01-sport-types-api.md",
        "title": "Task T02-01: 运动类型列表 API", "short_title": "运动类型 API",
        "phase": "Phase 2", "task_type": "backend", "estimate": "20min",
        "branch": "feat/T02-01-sport-types", "worktree": "否",
        "deps": "T01-03", "blocks": "T02-02, T02-04", "deps_note": "JWT 中间件可用",
        "func_design": "GET /api/sport-types：返回启用中的运动类型字典。",
        "impl": "sport_handler.go，查询 is_active=1，按 sort_order。",
        "files": "- Create: backend/internal/handler/sport_handler.go",
        "steps": "- [ ] 实现 handler\n- [ ] 挂 AuthMiddleware\n- [ ] 提交",
        "acceptance": "| 1 | 返回 6 种类型 |\n| 2 | 含 need_distance 字段 |",
        "checklist": "- [ ] 需登录访问",
    },
    {
        "task_id": "T02-02", "file": "T02-02-checkin-create-api.md",
        "title": "Task T02-02: 提交打卡 API", "short_title": "打卡创建 API",
        "phase": "Phase 2", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T02-02-checkin-create", "worktree": "否",
        "deps": "T02-01", "blocks": "T02-03, T02-04, T03-02", "deps_note": "运动类型 API 可用",
        "func_design": "POST /api/checkin：记录运动数据；补卡逻辑；唯一性校验；非负校验；不可未来日期。",
        "impl": "TDD 重复打卡测试 → checkin_service.Create → handler。",
        "files": "- Create: handler/checkin_handler.go, service/checkin_service.go, checkin_service_test.go",
        "steps": "- [ ] 写重复打卡失败测试\n- [ ] 实现 Create\n- [ ] 路由 POST /api/checkin\n- [ ] 测试 PASS\n- [ ] 提交",
        "acceptance": "| 1 | 正常打卡 | code 0 |\n| 2 | 重复打卡 | 40901 |\n| 3 | 未来日期 | 40001 |\n| 4 | 补卡 | is_makeup=1 |",
        "checklist": "- [ ] user_id 来自 JWT",
    },
    {
        "task_id": "T02-03", "file": "T02-03-checkin-crud-api.md",
        "title": "Task T02-03: 打卡列表/详情/编辑/删除 API", "short_title": "打卡 CRUD API",
        "phase": "Phase 2", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T02-03-checkin-crud", "worktree": "否",
        "deps": "T02-02", "blocks": "T02-04, T05-04", "deps_note": "打卡创建 API 已完成",
        "func_design": "GET list（筛选+分页）、GET :id、PUT :id、DELETE :id。校验 user_id 归属。",
        "impl": "扩展 checkin_handler + service。",
        "files": "- Modify: checkin_handler.go, checkin_service.go",
        "steps": "- [ ] GET list\n- [ ] GET :id\n- [ ] PUT :id\n- [ ] DELETE :id\n- [ ] 提交",
        "acceptance": "| 1 | 列表筛选 | 日期+类型有效 |\n| 2 | 越权访问他人 | 403 |\n| 3 | 编辑后唯一性 | 冲突 409 |",
        "checklist": "- [ ] 分页默认 page_size=20",
    },
    {
        "task_id": "T02-04", "file": "T02-04-checkin-frontend.md",
        "title": "Task T02-04: 前端打卡页面", "short_title": "打卡前端",
        "phase": "Phase 2", "task_type": "frontend", "estimate": "90min",
        "branch": "feat/T02-04-checkin-frontend",
        "worktree": "`.worktrees/T02-04-checkin/`",
        "deps": "T00-02, T02-03, T01-05", "blocks": "T03-03, T06-02", "deps_note": "打卡 API 全部就绪+认证前端",
        "func_design": "打卡表单+列表+编辑删除 Modal。运动类型带色标。补卡显示标签。",
        "impl": "HeroUI Select/DatePicker/Input/Table/Modal；api/checkin.ts。",
        "files": "- Create: pages/checkin/CheckInForm.tsx, CheckInList.tsx, api/checkin.ts",
        "steps": "- [ ] 打卡表单\n- [ ] 列表+筛选\n- [ ] 编辑删除 Modal\n- [ ] 409 错误提示\n- [ ] 提交",
        "acceptance": "| 1 | 提交打卡 | 列表可见 |\n| 2 | 补卡 | 显示补录标签 |\n| 3 | 重复打卡 | 错误提示 |\n| 4 | 运动色标 | 符合 design-system |",
        "checklist": "- [ ] 核心操作≤3步",
    },
    {
        "task_id": "T03-01", "file": "T03-01-goal-api.md",
        "title": "Task T03-01: 目标创建/查询/修改 API", "short_title": "目标 API",
        "phase": "Phase 3", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T03-01-goal",
        "worktree": "`.worktrees/T03-01-goal/`（可与 T02-04 并行）",
        "deps": "T01-03", "blocks": "T03-02, T03-03", "deps_note": "JWT 可用；打卡数据后续用于进度",
        "func_design": "POST/GET/PUT /api/goal。周/月目标，唯一约束 per user+period。",
        "impl": "goal_handler + goal_service。",
        "files": "- Create: handler/goal_handler.go, service/goal_service.go",
        "steps": "- [ ] POST 创建\n- [ ] GET 当前+history\n- [ ] PUT 修改\n- [ ] 提交",
        "acceptance": "| 1 | 创建周目标 | 成功 |\n| 2 | 重复周期 | 409 |\n| 3 | 已结束不可改 | 40001 |",
        "checklist": "- [ ] period_type 1=周 2=月",
    },
    {
        "task_id": "T03-02", "file": "T03-02-goal-progress-api.md",
        "title": "Task T03-02: 目标进度计算 API", "short_title": "目标进度 API",
        "phase": "Phase 3", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T03-02-goal-progress", "worktree": "否",
        "deps": "T03-01, T02-02", "blocks": "T03-03", "deps_note": "目标 API + 打卡数据",
        "func_design": "GET /api/goal/progress：聚合 check_ins 计算完成百分比，自动更新 status。",
        "impl": "goal_progress.go，按 target_type 聚合 COUNT/SUM。",
        "files": "- Create: service/goal_progress.go\n- Modify: goal_handler.go",
        "steps": "- [ ] 进度计算逻辑\n- [ ] GET /api/goal/progress\n- [ ] 周期结束标记 status=2\n- [ ] 提交",
        "acceptance": "| 1 | 进度准确 | 与手动计算一致 |\n| 2 | 达成 | status=1 |\n| 3 | 过期未达成 | status=2 |",
        "checklist": "- [ ] progress_percent 保留一位小数",
    },
    {
        "task_id": "T03-03", "file": "T03-03-goal-frontend.md",
        "title": "Task T03-03: 前端目标管理页", "short_title": "目标前端",
        "phase": "Phase 3", "task_type": "frontend", "estimate": "75min",
        "branch": "feat/T03-03-goal-frontend",
        "worktree": "`.worktrees/T03-03-goal/`",
        "deps": "T03-02, T00-02", "blocks": "T06-02", "deps_note": "目标 API 全部就绪",
        "func_design": "目标设定表单、Progress 进度条、历史目标 Tab。达成时 accent 闪烁。",
        "impl": "HeroUI Tabs/Select/Input/Progress；api/goal.ts。",
        "files": "- Create: pages/goal/GoalManage.tsx, api/goal.ts",
        "steps": "- [ ] 设定表单\n- [ ] 进度展示\n- [ ] 历史 Tab\n- [ ] 提交",
        "acceptance": "| 1 | 设目标后显示进度 |\n| 2 | 打卡后进度更新 |\n| 3 | 历史列表可见 |",
        "checklist": "- [ ] Progress 颜色规则符合 design-system",
    },
    {
        "task_id": "T04-01", "file": "T04-01-stats-personal-api.md",
        "title": "Task T04-01: 个人统计 API", "short_title": "个人统计 API",
        "phase": "Phase 4", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T04-01-stats",
        "worktree": "`.worktrees/T04-01-stats/`（可与 T03 并行）",
        "deps": "T02-02", "blocks": "T04-03", "deps_note": "有打卡数据可聚合",
        "func_design": "GET /api/stats/personal：概览+周期统计+类型分布+趋势。",
        "impl": "stats_handler + stats_service，SQL 聚合 check_ins。",
        "files": "- Create: handler/stats_handler.go, service/stats_service.go",
        "steps": "- [ ] summary 聚合\n- [ ] by_period/by_sport_type/trend\n- [ ] 提交",
        "acceptance": "| 1 | summary 四项正确 |\n| 2 | period 参数有效 |\n| 3 | 仅本人数据 |",
        "checklist": "- [ ] 避免 SELECT *",
    },
    {
        "task_id": "T04-02", "file": "T04-02-ranking-api.md",
        "title": "Task T04-02: 全局排行 API", "short_title": "排行 API",
        "phase": "Phase 4", "task_type": "backend", "estimate": "45min",
        "branch": "feat/T04-02-ranking", "worktree": "否",
        "deps": "T04-01", "blocks": "T04-03", "deps_note": "统计模块已建立",
        "func_design": "GET /api/stats/ranking：Top50 + my_rank，多维度切换。",
        "impl": "扩展 stats_handler，JOIN users 取 nickname。",
        "files": "- Modify: stats_handler.go, stats_service.go",
        "steps": "- [ ] 排行聚合\n- [ ] my_rank 计算\n- [ ] 提交",
        "acceptance": "| 1 | Top50 |\n| 2 | 维度切换 |\n| 3 | 不暴露他人明细 |",
        "checklist": "- [ ] LIMIT 50",
    },
    {
        "task_id": "T04-03", "file": "T04-03-stats-frontend.md",
        "title": "Task T04-03: 前端统计与排行页", "short_title": "统计前端",
        "phase": "Phase 4", "task_type": "frontend", "estimate": "90min",
        "branch": "feat/T04-03-stats-frontend",
        "worktree": "`.worktrees/T04-03-stats/`",
        "deps": "T04-02, T00-02", "blocks": "T06-02", "deps_note": "统计 API 全部就绪",
        "func_design": "概览四卡（JetBrains Mono 数字）、Recharts 饼图/折线图、排行 Table。",
        "impl": "StatsDashboard + RankingPage；遵循图表规范。",
        "files": "- Create: pages/stats/StatsDashboard.tsx, RankingPage.tsx, api/stats.ts",
        "steps": "- [ ] 概览卡片\n- [ ] 饼图\n- [ ] 折线图\n- [ ] 排行榜\n- [ ] 提交",
        "acceptance": "| 1 | 数据与 API 一致 |\n| 2 | Top3 琥珀底 |\n| 3 | 我的排名高亮 |",
        "checklist": "- [ ] 图表色标用类型色",
    },
    {
        "task_id": "T05-01", "file": "T05-01-calendar-api.md",
        "title": "Task T05-01: 日历数据 API（含热力等级）", "short_title": "日历 API",
        "phase": "Phase 5", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T05-01-calendar",
        "worktree": "`.worktrees/T05-01-calendar/`",
        "deps": "T02-02", "blocks": "T05-03", "deps_note": "有打卡数据",
        "func_design": "GET /api/calendar：月历数据 + heat_level 0-4 + streak + max_duration。",
        "impl": "calendar_handler + calendar_service；Streak 从今天/昨天向前遍历。",
        "files": "- Create: handler/calendar_handler.go, service/calendar_service.go",
        "steps": "- [ ] 月历聚合\n- [ ] heat_level 五档\n- [ ] streak 算法\n- [ ] 提交",
        "acceptance": "| 1 | days 数组正确 |\n| 2 | heat_level 0-4 |\n| 3 | streak 准确 |",
        "checklist": "- [ ] max_duration 供前端归一化",
    },
    {
        "task_id": "T05-02", "file": "T05-02-reminder-api.md",
        "title": "Task T05-02: 提醒设置与日志 API", "short_title": "提醒 API",
        "phase": "Phase 5", "task_type": "backend", "estimate": "60min",
        "branch": "feat/T05-02-reminder", "worktree": "否",
        "deps": "T01-01", "blocks": "T05-04, T05-05", "deps_note": "用户+reminder_settings 存在",
        "func_design": "GET/PUT /api/reminder；GET/POST /api/reminder/logs 分页历史。",
        "impl": "reminder_handler + reminder_service。",
        "files": "- Create: handler/reminder_handler.go, service/reminder_service.go",
        "steps": "- [ ] GET/PUT reminder\n- [ ] GET logs 分页\n- [ ] POST log 写入\n- [ ] 提交",
        "acceptance": "| 1 | 读写设置 |\n| 2 | 日志分页 |\n| 3 | status 0/1/2 |",
        "checklist": "- [ ] 仅本人日志",
    },
    {
        "task_id": "T05-03", "file": "T05-03-calendar-frontend.md",
        "title": "Task T05-03: 前端日历页（含热力图）", "short_title": "日历热力图前端",
        "phase": "Phase 5", "task_type": "frontend", "estimate": "90min",
        "branch": "feat/T05-03-calendar-frontend",
        "worktree": "`.worktrees/T05-03-calendar/`",
        "deps": "T05-01, T00-02", "blocks": "T06-02", "deps_note": "日历 API 就绪",
        "func_design": "月历网格+5级热力色阶+日期 Modal+Streak 卡+LaneStripe+图例。",
        "impl": "CalendarView + CalendarHeatmap 组件；使用 --color-heatmap-* tokens。",
        "files": "- Create: pages/calendar/CalendarView.tsx, components/CalendarHeatmap.tsx, api/calendar.ts",
        "steps": "- [ ] 月历 grid\n- [ ] 热力着色\n- [ ] 日期 Modal\n- [ ] Streak+LaneStripe\n- [ ] 图例\n- [ ] 提交",
        "acceptance": "| 1 | 热力 5 色阶正确 |\n| 2 | 点击日期弹详情 |\n| 3 | Streak 显示 |\n| 4 | 图例清晰 |",
        "checklist": "- [ ] reduced-motion 尊重",
    },
    {
        "task_id": "T05-04", "file": "T05-04-reminder-frontend.md",
        "title": "Task T05-04: 前端提醒功能", "short_title": "提醒前端",
        "phase": "Phase 5", "task_type": "frontend", "estimate": "75min",
        "branch": "feat/T05-04-reminder-frontend",
        "worktree": "`.worktrees/T05-04-reminder/`",
        "deps": "T05-02, T02-03", "blocks": "T05-05, T06-02", "deps_note": "提醒 API + 打卡列表 API",
        "func_design": "提醒设置页+useReminder hook+浏览器 Notification+智能跳过+写日志。",
        "impl": "Switch+时间输入；每分钟检查；POST logs。",
        "files": "- Create: hooks/useReminder.ts, pages/settings/ReminderSettings.tsx, api/reminder.ts",
        "steps": "- [ ] 设置页\n- [ ] 请求权限\n- [ ] useReminder\n- [ ] 日志写入\n- [ ] 提交",
        "acceptance": "| 1 | 设置保存 |\n| 2 | 未打卡触发通知 |\n| 3 | 已打卡跳过+日志 status=2 |",
        "checklist": "- [ ] 权限被拒有指引文案",
    },
    {
        "task_id": "T05-05", "file": "T05-05-reminder-history-frontend.md",
        "title": "Task T05-05: 提醒历史日志 UI", "short_title": "提醒历史 UI",
        "phase": "Phase 5", "task_type": "frontend", "estimate": "45min",
        "branch": "feat/T05-05-reminder-history",
        "worktree": "`.worktrees/T05-05-reminder-history/`",
        "deps": "T05-02, T05-04", "blocks": "T06-02", "deps_note": "提醒 API+设置页已完成",
        "func_design": "提醒历史 Table+分页+状态 Badge+导航入口。",
        "impl": "ReminderHistory.tsx；GET /api/reminder/logs。",
        "files": "- Create: pages/settings/ReminderHistory.tsx",
        "steps": "- [ ] 历史 Table\n- [ ] 分页\n- [ ] Badge 三色\n- [ ] 导航入口\n- [ ] 提交",
        "acceptance": "| 1 | 列表展示 |\n| 2 | 分页有效 |\n| 3 | 状态区分清晰 |",
        "checklist": "- [ ] 空状态有引导",
    },
    {
        "task_id": "T06-01", "file": "T06-01-app-layout.md",
        "title": "Task T06-01: 应用布局与导航", "short_title": "布局导航",
        "phase": "Phase 6", "task_type": "frontend", "estimate": "60min",
        "branch": "feat/T06-01-layout",
        "worktree": "`.worktrees/T06-01-layout/`（建议 Wave 2 提前启动）",
        "deps": "T00-02, T01-05", "blocks": "T06-02", "deps_note": "前端脚手架+认证完成；可在页面未全完成时先做壳",
        "func_design": "侧边栏/顶栏导航、路由表、登录态展示、退出。仪表盘跑道布局。",
        "impl": "AppLayout + router/index.tsx；HeroUI Navbar/Card 侧栏。",
        "files": "- Create: components/AppLayout.tsx, router/index.tsx\n- Modify: main.tsx, App.tsx",
        "steps": "- [ ] 路由表\n- [ ] 侧栏导航\n- [ ] 昵称+退出\n- [ ] 响应式折叠\n- [ ] 提交",
        "acceptance": "| 1 | 6 模块可导航 |\n| 2 | 未登录跳登录 |\n| 3 | 移动端可用 |",
        "checklist": "- [ ] 符合 design-system 布局",
    },
    {
        "task_id": "T06-02", "file": "T06-02-e2e-acceptance.md",
        "title": "Task T06-02: 端到端验收测试", "short_title": "E2E 验收",
        "phase": "Phase 6", "task_type": "qa", "estimate": "120min",
        "branch": "main", "worktree": "否（所有分支合并后）",
        "deps": "全部功能 Task", "blocks": "T06-03", "deps_note": "所有模块已合并 main",
        "func_design": "执行 9 条 E2E 流程 + 安全测试，记录 BUG 并修复。",
        "impl": "按验收清单逐项手动测试。",
        "files": "- 可能修改: 各模块 BUG 修复",
        "steps": "- [ ] 流程 A~H\n- [ ] 安全测试\n- [ ] 记录结果\n- [ ] 修复 BLOCKER",
        "acceptance": "| 1 | 9 流程全通过 |\n| 2 | 越权 403 |\n| 3 | 无 BLOCKER BUG |",
        "checklist": "- [ ] 验收报告写入 docs/qa-acceptance.md",
    },
    {
        "task_id": "T06-03", "file": "T06-03-readme.md",
        "title": "Task T06-03: README 与启动文档", "short_title": "README",
        "phase": "Phase 6", "task_type": "docs", "estimate": "30min",
        "branch": "feat/T06-03-readme", "worktree": "否",
        "deps": "T06-02", "blocks": "无", "deps_note": "E2E 验收通过",
        "func_design": "README：环境要求、本地 MySQL 配置、前后端启动、测试账号。",
        "impl": "根目录 README.md。",
        "files": "- Create: README.md",
        "steps": "- [ ] 环境说明\n- [ ] 启动步骤\n- [ ] 测试账号\n- [ ] 提交",
        "acceptance": "| 1 | 新人可按 README 启动 |\n| 2 | 端口说明清晰 |",
        "checklist": "- [ ] 引用 AGENTS.md",
    },
]


def main():
    os.makedirs(BASE, exist_ok=True)
    for t in TASKS:
        path = os.path.join(BASE, t["file"])
        with open(path, "w", encoding="utf-8") as f:
            f.write(TEMPLATE.format(**t))
        print("Wrote", t["file"])
    print(f"Total: {len(TASKS)} tasks")


if __name__ == "__main__":
    main()
