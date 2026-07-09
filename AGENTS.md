# AGENTS.md — 运动打卡系统 Agent 上下文

> 本文件为**每个独立开发会话**提供项目全局上下文。执行具体任务前，请先阅读任务文件 `docs/superpowers/plans/tasks/T*.md`，再参考本文档。

---

## 项目是什么

**运动打卡系统（ExerciseRecord）** — 课程团队大作业。面向个人用户的运动自我管理 Web 应用：注册登录、多类型运动打卡、周/月目标、数据统计排行、日历热力图、打卡提醒。

**开发周期：** 2026-07-08（设计）→ 2026-07-09~10（开发验收）  
**当前状态：** 仅有 `docs/` 文档，**代码尚未开始**。按任务计划从零搭建。

---

## 技术栈（已锁定，勿擅自更改）

| 层次 | 技术 |
|------|------|
| 前端 | React 19+、Vite、TypeScript、HeroUI v3、Tailwind CSS v4、Recharts、Axios、React Router |
| 后端 | Go 1.22+、Gin、GORM、JWT、golang-jwt、bcrypt、viper |
| 数据库 | **本地 MySQL 8.0+**（非 Docker），库名 `sport_checkin` |
| 认证 | JWT Bearer，`Authorization: Bearer <token>` |

**不做：** 邮箱注册（首周期仅 username）、Docker Compose、Ant Design/Vue。

---

## 仓库结构（目标）

```
ExerciseRecord/
├── AGENTS.md                 ← 本文件
├── README.md                 ← T06-03 产出
├── backend/                  ← Go API
├── frontend/                 ← React SPA
├── database/                 ← schema.sql, seed.sql
└── docs/
    ├── design/               ← 设计规范（必读）
    │   ├── design-system.md
    │   └── design-tokens.css
    └── superpowers/plans/
        ├── 2026-07-08-exercise-checkin-system-master-plan.md
        ├── execution-order.md
        └── tasks/T*.md       ← 细粒度任务（每次会话执行一个）
```

---

## 必读文档（按优先级）

1. **当前任务文件** — `docs/superpowers/plans/tasks/Txx-xx-*.md`
2. **设计规范** — `docs/design/design-system.md`（所有前端任务）
3. **总体计划** — `docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
4. **开发顺序** — `docs/superpowers/plans/execution-order.md`
5. **需求/数据库原文** — `docs/*.docx`（需要业务细节时）

---

## API 统一规范

**响应格式：**
```json
{ "code": 0, "message": "ok", "data": {} }
```

**错误码：** `0` 成功 | `40001` 参数错误 | `40101` 未登录 | `40301` 越权 | `40401` 不存在 | `40901` 冲突 | `50001` 服务器错误

**JWT Payload：** `{ "user_id": 1, "username": "alice", "exp": ... }`

**完整接口表：** 见总体计划 §四 或 `execution-order.md`。

---

## 设计规范要点（前端任务）

- 设计方向：**「晨曦跑道 · Dawn Track」** — 活力、节奏感，珊瑚橙 `#FF5C35` + 跑道青 `#0D9488`
- Token 文件：`docs/design/design-tokens.css`
- 字体：Syne（标题）/ DM Sans（正文）/ JetBrains Mono（数据）
- 签名元素：`LaneStripe` 分道线动效（仅 Hero / Streak 区域）
- HeroUI v3 无需 Provider；样式顺序：`tailwindcss` → `@heroui/styles` → design tokens

---

## 开发流程约定

### 分支策略

| 分支 | 用途 |
|------|------|
| `main` | 集成分支；Wave 0~1 顺序任务直接提交 |
| `feat/<task-id>` | 单个任务功能分支，完成后 merge 回 main |
| worktree | 并行任务在 `.worktrees/<task-id>/` 隔离开发 |

### Worktree 目录

并行任务使用 **`.worktrees/`**（已加入 `.gitignore`）。创建方式见 `execution-order.md`。

### 提交规范

```
feat: add user register API          # 新功能
fix: reject duplicate check-in       # 修复
chore: init frontend scaffold        # 脚手架
docs: add README                     # 文档
```

**注意：** 仅当用户或任务明确要求时才 `git commit`；完成任务后汇报变更，由负责人决定是否提交。

### 测试要求

- 后端：关键业务逻辑写 Go unit test（注册密码校验、重复打卡等）
- 前端：任务文件中的验收标准为准，关键流程手动验证
- 联调：T06-02 端到端验收清单

---

## 六大模块速查

| 模块 | 职责 | 主要表 |
|------|------|--------|
| M01 用户管理 | 注册/登录/JWT/资料/改密 | users, reminder_settings |
| M02 运动打卡 | 打卡 CRUD、补卡、6 种运动类型 | check_ins, sport_types |
| M03 目标管理 | 周/月目标、进度、历史 | goals, check_ins(聚合) |
| M04 统计排行 | 个人统计、图表、Top50 | check_ins(聚合), users |
| M05 日历视图 | 月历、热力图、Streak | check_ins(聚合) |
| M06 打卡提醒 | 设置、浏览器通知、历史日志 | reminder_settings, reminder_logs |

---

## Agent 执行单任务时的标准流程

1. 阅读任务文件全文（上下文、依赖、验收标准）
2. 确认依赖任务已完成（检查 main 分支或文件是否存在）
3. 若在 worktree：按 `execution-order.md` 创建并切换到正确分支
4. 实现任务，遵循设计规范与 API 契约
5. 运行任务规定的测试/验证命令
6. 对照验收标准自检
7. 汇报：变更文件列表、如何验证、是否阻塞下游任务

---

## 环境变量（后端）

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<本地密码>
DB_NAME=sport_checkin
JWT_SECRET=<随机密钥>
PORT=8080
```

复制 `backend/.env.example` → `backend/.env`（`.env` 不入库）。

---

## 常见问题

**Q: 前端代理后端？**  
A: Vite `server.proxy['/api']` → `http://localhost:8080`

**Q: 注册需要 email 吗？**  
A: 不需要。DB 有 email 字段但 API 不处理。

**Q: 同用户同日期同运动类型能打两次卡吗？**  
A: 不能，返回 `40901`。

**Q: 补卡规则？**  
A: 仅过去日期，`is_makeup=1`；不可未来日期。

**Q: 热力图 heat_level？**  
A: 0~4 五档，按当月 total_duration 分位数。

---

## 联系人 / 分工（供参考）

| 成员 | 侧重 |
|------|------|
| 黎达均 | 后端架构、M01、M02 后端 |
| 刘佳豪 | M02 前端 |
| 李佳龙 | M03、M04 后端 |
| 丰坤华 | M05、M06 前端、文档 |

Agent 执行任务时无需严格按人分工，按任务依赖顺序执行即可。
