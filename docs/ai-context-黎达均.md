# AI 开发上下文总结 — 黎达均

> **项目：** 运动打卡系统（ExerciseRecord）  
> **角色：** 后端架构负责人 · M01 用户管理 · M02 打卡后端 · M04 排行 API  
> **开发周期：** 2026-07-09 ~ 2026-07-10  
> **任务来源：** [飞书多维表格](https://qcndmg3uorlg.feishu.cn/base/I6rKbjA7wacoNbsdArHcE3bUnqf?table=tblOhzC9mW5ygMnb&view=vewhP7JKEa)

---

## 一、负责任务清单


| Task ID | 任务描述          | Wave     | 分支/位置                            |
| ------- | ------------- | -------- | -------------------------------- |
| T00-01  | 初始化 Go 后端脚手架  | Wave 0   | `main`                           |
| T00-03  | 数据库 DDL 与种子数据 | Wave 0   | `main`                           |
| T01-01  | 用户注册 API      | Wave 1   | `feat/T01-01-register`           |
| T01-03  | JWT 鉴权中间件     | Wave 1   | `feat/T01-03-jwt-middleware`     |
| T02-01  | 运动类型列表 API    | Wave 2   | `feat/T02-01-sport-types`        |
| T02-02  | 提交打卡 API      | Wave 2   | `feat/T02-02-checkin-create`     |
| T04-02  | 全局排行 API      | Wave 3-B | `main` / `.worktrees/T04-stats/` |
| T06-02  | 端到端验收测试       | Wave 4   | `main`（全员）                       |


---



## 二、提供给 AI 的核心上下文



### 2.1 必读文档


| 优先级 | 文件                                                                         | 用途                       |
| --- | -------------------------------------------------------------------------- | ------------------------ |
| 1   | `AGENTS.md`                                                                | 项目全局上下文、技术栈、API 规范、环境变量  |
| 2   | `docs/superpowers/plans/tasks/Txx-xx-*.md`                                 | 当前任务的实现步骤与验收标准           |
| 3   | `docs/superpowers/plans/execution-order.md`                                | 任务依赖、Wave 顺序、Worktree 策略 |
| 4   | `docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md` | 总体架构与接口契约                |




### 2.2 典型 Agent 提示词模板

```
请执行运动打卡系统开发任务 Txx-xx。

【必读】
1. 打开并完整阅读 AGENTS.md
2. 打开并完整阅读任务文件：docs/superpowers/plans/tasks/<TASK_FILE>.md

【执行要求】
- 严格按任务文件的实现步骤执行
- TDD：先写 Go unit test 再实现
- 遵循统一响应格式 { code, message, data } 与错误码规范
- 运行 go test ./... 验证
- 完成后对照「测试与验收标准」自检
- 不要 git commit，除非我明确要求

开始执行。
```



### 2.3 后端专属约束（写入上下文）

- **技术栈锁定：** Go 1.22+、Gin、GORM、JWT、bcrypt、viper、本地 MySQL 8.0+
- **响应格式：** `code: 0` 成功；`40001` 参数错误；`40101` 未登录；`40301` 越权；`40901` 冲突
- **JWT Payload：** `{ user_id, username, exp }`
- **测试策略：** SQLite 内存库 + `testutil_test.go` 公共测试夹具
- **分支策略：** Wave 0~1 后端顺序任务在 `main` 或 `feat/Txx` 分支；合并后作为其他模块依赖

---



## 三、AI 辅助开发工作流



### 3.1 Wave 0 — 地基搭建

1. **T00-01：** 让 Agent 初始化 `backend/` 目录结构、`cmd/server/main.go`、Gin + viper、`/health` 端点
2. **T00-03：** 提供 `database/schema.sql`（6 表）与 `seed.sql`（6 运动类型），编写 `backend/.env.example`
3. 本地 MySQL 建库验证后，提交到 `main`

**关键决策：** 移除 GORM AutoMigrate，改用手动 `schema.sql` 建表，避免外键冲突。

### 3.2 Wave 1 — 认证链

按 `execution-order.md` **严格顺序**执行：

```
T01-01 注册 → T01-02 登录 → T01-03 JWT → T01-04 资料
```

本人负责 T01-01（bcrypt 密码、默认 `reminder_settings`）和 T01-03（`AuthMiddleware`、Bearer Token 解析、`user_id` 注入 Context）。

**契约冻结点：** T01-04 完成后，M01 API 全部可用，前端可开始对接。

### 3.3 Wave 2 — 打卡后端

顺序实现 T02-01 → T02-02：

- **T02-01：** `GET /api/sport-types`，JWT 鉴权，返回 6 种运动类型
- **T02-02：** `POST /api/checkin`，核心业务规则：
  - 同用户同日期同运动类型不可重复（`40901`）
  - 未来日期拒绝（`40001`）
  - 过去日期自动 `is_makeup=1`

TDD 测试覆盖：重复打卡、未来日期、补卡标记。

### 3.4 Wave 3 — 排行 API

负责 T04-02 `GET /api/stats/ranking`：

- 维度：`count | duration | distance`
- 周期：`week | month | all`
- Top50 + `my_rank` 响应
- 仅聚合统计值，不暴露他人打卡明细

---



## 四、关键产出文件

```
backend/
├── cmd/server/main.go              # 路由注册（随模块扩展）
├── cmd/bootstrap/main.go           # 一键建库脚本
├── internal/
│   ├── config/config.go            # .env 加载（含向上查找修复）
│   ├── middleware/auth.go          # JWT 中间件
│   ├── handler/
│   │   ├── auth_handler.go         # 注册/登录
│   │   ├── sport_handler.go        # 运动类型
│   │   ├── checkin_handler.go      # 打卡 CRUD
│   │   └── stats_handler.go        # 统计/排行
│   ├── service/
│   │   ├── auth_service.go
│   │   ├── checkin_service.go
│   │   ├── stats_service.go
│   │   └── *_test.go               # TDD 单元测试
│   └── model/                      # 6 个 GORM 模型
database/
├── schema.sql
└── seed.sql
```

---



## 五、遇到的问题与 AI 协作经验


| 问题                     | 处理方式                                    |
| ---------------------- | --------------------------------------- |
| MySQL 库不存在             | 新增 `cmd/bootstrap` 建库脚本；在 `.env` 配置本地密码 |
| GORM AutoMigrate 与外键冲突 | 移除 AutoMigrate，仅用 `schema.sql`          |
| SQLite 测试 TIME 类型扫描失败  | 注册时用 SQL 插入 `reminder_settings`         |
| `.env` 在子目录启动读不到       | 修复 `config.go` 向上查找 `backend/.env`      |
| 并行开发 `main.go` 冲突      | 合并时手动整合各模块路由注册                          |




### 协作建议

1. **接口契约先行：** Wave 1 结束后冻结 M01 API，供前端/其他后端并行
2. **TDD 驱动：** 每个 service 先写测试，Agent 产出质量更稳定
3. **顺序不能跳：** T01-03 完成前不可启动 T02-01（依赖 JWT）
4. **Code Review：** 每个任务完成后触发 code-reviewer 子 Agent，修复 BLOCKER 后再合并

---



## 六、参考链接

- 开发计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 执行顺序：`docs/superpowers/plans/execution-order.md`
- E2E 验收：`docs/qa-acceptance.md`
- 启动文档：`README.md`

