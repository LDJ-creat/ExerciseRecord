# AI 开发上下文总结 — 丰坤华

> **项目：** 运动打卡系统（ExerciseRecord）  
> **角色：** 日历/提醒模块负责人 · M05 日历视图 · M06 打卡提醒 · 项目文档  
> **开发周期：** 2026-07-09 ~ 2026-07-10  
> **任务来源：** [飞书多维表格](https://qcndmg3uorlg.feishu.cn/base/I6rKbjA7wacoNbsdArHcE3bUnqf?table=tblOhzC9mW5ygMnb&view=vewhP7JKEa)

---

## 一、负责任务清单

| Task ID | 任务描述 | Wave | Worktree / 分支 |
|---------|----------|------|-----------------|
| T05-01 | 日历数据 API（含热力等级） | Wave 3-C | `main` / `.worktrees/T05-03-calendar/` |
| T05-02 | 提醒设置与日志 API | Wave 3-D | `.worktrees/T05-04-reminder/` |
| T05-03 | 前端日历页（含热力图） | Wave 3-C | `.worktrees/T05-03-calendar/` |
| T05-04 | 前端提醒功能 | Wave 3-D | `.worktrees/T05-04-reminder/` |
| T05-05 | 提醒历史日志 UI | Wave 3-D | `.worktrees/T05-04-reminder/` |
| T06-03 | README 与启动文档 | Wave 4 | `main` |
| T06-02 | 端到端验收测试 | Wave 4 | `main`（全员） |

---

## 二、提供给 AI 的核心上下文

### 2.1 必读文档

| 优先级 | 文件 | 用途 |
|--------|------|------|
| 1 | `AGENTS.md` | 全局上下文 |
| 2 | `docs/design/design-system.md` | 热力图色阶、Streak、LaneStripe 规范 |
| 3 | `docs/design/design-tokens.css` | `--color-heatmap-0` ~ `--color-heatmap-4` |
| 4 | 当前任务 `docs/superpowers/plans/tasks/T05-xx-*.md` | 日历/提醒实现细节 |
| 5 | `docs/superpowers/plans/execution-order.md` | Wave 3 组 C/D 并行策略 |

### 2.2 模块专属 Agent 提示词

**日历模块（组 C）：**
```
请执行 T05-01 或 T05-03。阅读 design-system.md 和对应任务文件。

【后端 T05-01】
- GET /api/calendar?year=&month=
- heat_level 0~4 按当月 total_duration 分位数
- streak 从今天/昨天向前连续自然日
- TDD 测试覆盖 heat_level、streak、max_duration

【前端 T05-03】
- 5 级热力图 + Streak 卡片 + LaneStripe + 图例
- 点击日期 Modal 展示当日打卡详情
- Worktree: .worktrees/T05-03-calendar/
```

**提醒模块（组 D）：**
```
请执行 T05-02/04/05。阅读对应任务文件。

【后端 T05-02】
- GET/PUT /api/reminder（设置）
- GET/POST /api/reminder/logs（历史日志）
- status: 0=失败, 1=成功, 2=已跳过
- 同日日志 upsert 避免重复

【前端 T05-04/05】
- 提醒设置页 + 浏览器 Notification 权限
- useReminder 每分钟轮询 + 智能跳过
- 提醒历史 Table + 分页 + 三色 Badge
- Worktree: .worktrees/T05-04-reminder/
```

---

## 三、AI 辅助开发工作流

### 3.1 Wave 3 组 C — 日历（T05-01 + T05-03）

**依赖：** T02-02（有打卡数据）

#### 后端 T05-01

```
GET /api/calendar?year=2026&month=7
```

响应结构：
```json
{
  "year": 2026, "month": 7,
  "days": [{ "date": "2026-07-08", "checked": true, "heat_level": 3, ... }],
  "streak": 5,
  "max_duration": 120
}
```

核心逻辑：
- `days`：当月每一天（1→月末），未打卡 `heat_level=0`
- `heat_level`：1~4 按当月已打卡日 `total_duration` 秩分位（≤25/50/75%）
- `streak`：从今天或昨天起向前遍历连续自然日
- Code review 后优化：`computeStreak` 改为逐日 `EXISTS` 查询

#### 前端 T05-03

在 `.worktrees/T05-03-calendar/` 实现：

| 组件 | 说明 |
|------|------|
| `CalendarHeatmap.tsx` | 7 列月历网格、5 级着色 |
| `CalendarView.tsx` | Streak 卡片 + 月份切换 + 日期 Modal |
| `CalendarPage.tsx` | 替换占位页 |

设计规范：
- Streak 区域使用 `--gradient-dawn` + `LaneStripe`
- 热力格 hover 动效 + `reduced-motion` 降级
- 图例：无运动 / 轻度 / 适中 / 活跃 / 高强度

### 3.2 Wave 3 组 D — 提醒（T05-02 + T05-04 + T05-05）

**依赖：** T05-02 仅依赖 T01-01，可与 Wave 2 更早启动；T05-04 依赖 T05-02 + T02-03

#### 后端 T05-02

| 端点 | 说明 |
|------|------|
| `GET /api/reminder` | `{ is_enabled, remind_time }` |
| `PUT /api/reminder` | 更新开关与时间 |
| `GET /api/reminder/logs` | 分页历史 |
| `POST /api/reminder/logs` | 写入日志（同日 upsert） |

#### 前端 T05-04

- `useReminder` Hook：每分钟轮询
- 逻辑：`is_enabled=1` 且 `HH:mm === remind_time` 时触发
- 今日有打卡 → `status=2`（已跳过）；无打卡 → 发 `Notification` + `status=1`
- 无权限 → `status=0`；`localStorage` 跨标签页去重
- 在 `AppLayout` 全局挂载

#### 前端 T05-05

- `ReminderHistoryPage`：Table + 分页（每页 10 条）
- Badge 三色：失败（红）/ 成功（青）/ 已跳过（琥珀）
- 空状态引导跳转提醒设置页

### 3.3 Wave 4 — 文档（T06-03）

验收通过后编写根目录 `README.md`：
- 环境要求（Go / Node / MySQL）
- 数据库初始化（`go run ./cmd/bootstrap`）
- 前后端启动步骤与端口说明
- 测试账号说明
- 引用 `AGENTS.md`

---

## 四、关键产出文件

```
backend/internal/
├── service/
│   ├── calendar_service.go         # 月历聚合、heat_level、streak
│   ├── calendar_service_test.go    # 6 项测试
│   ├── reminder_service.go         # 设置读写、日志分页
│   └── reminder_service_test.go    # 12 项测试
├── handler/
│   ├── calendar_handler.go
│   └── reminder_handler.go

frontend/src/
├── api/
│   ├── calendar.ts
│   └── reminder.ts
├── components/
│   └── CalendarHeatmap.tsx
├── hooks/
│   └── useReminder.ts              # 浏览器通知轮询
├── pages/
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   └── CalendarPage.tsx
│   └── settings/
│       ├── ReminderSettingsPage.tsx
│       └── ReminderHistoryPage.tsx

docs/
├── qa-acceptance.md                # E2E 验收报告
└── (本文档所在 ai-context-*.md 系列)

README.md                           # 项目启动文档
```

---

## 五、遇到的问题与 AI 协作经验

| 问题 | 处理方式 |
|------|----------|
| `computeStreak` 全量 Pluck 性能 | 改为逐日 `EXISTS` 查询（code review 建议） |
| 提醒轮询失败当日静默丢失 | 失败时不提前锁定 slot，允许重试 |
| Modal 日期连点竞态 | `useRef` 请求序号丢弃过期响应 |
| `RemindTime` GORM 扫描兼容 | 模型字段改为 `string`，SQLite/MySQL 通用 |
| 浏览器通知需手动验证 | E2E 仅验证 API 层，UI 通知列入手动走查项 |

### 设计规范落地要点

1. **热力图：** 严格使用 `--color-heatmap-0` ~ `4`，L4 才用白字（对比度）
2. **Streak：** 仅 Hero / Streak 区域使用 `LaneStripe`，不过度使用
3. **提醒 Badge：** 三色语义与 `design-system.md` 一致
4. **日历 Modal：** 区分 loading / empty / error 三态

### 协作建议

1. T05-02 可与其他 Wave **更早并行**（仅依赖注册 API）
2. 日历与提醒分属组 C/D，使用独立 Worktree 避免冲突
3. 前端任务必须附带 `design-system.md`，热力图/Streak 有明确 Token 约束
4. 提醒功能需用户授权 `Notification` 权限，文档中说明手动验证步骤
5. 作为文档负责人，Wave 4 汇总 `qa-acceptance.md` + `README.md`

---

## 六、E2E 验收相关（T06-02 全员）

9 条验收流程中与本人模块相关：

| 流程 | 内容 | 结果 |
|------|------|------|
| F | 日历标记 + 热力图色阶 + Streak | ✅ |
| G | 提醒设置保存 + 日志写入 | ✅ |
| H | 提醒历史三种状态展示 | ✅ |

完整报告：`docs/qa-acceptance.md`

---

## 七、参考链接

- 设计规范：`docs/design/design-system.md`
- 开发计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 执行顺序：`docs/superpowers/plans/execution-order.md`
- 启动文档：`README.md`
