# Task T04-01: 个人统计 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T04-01` |
| **Phase** | Phase 4 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T04-01-stats` |
| **Worktree** | `.worktrees/T04-01-stats/`（可与 T03 并行） |
| **依赖任务** | T02-02 |
| **阻塞任务** | T04-03 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T04-01 — 个人统计 API
前置条件：有打卡数据可聚合

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET /api/stats/personal：概览+周期统计+类型分布+趋势。

---

## 实现方式

stats_handler + stats_service，SQL 聚合 check_ins。

---

## 涉及文件

- Create: handler/stats_handler.go, service/stats_service.go

---

## 实现步骤

- [ ] summary 聚合
- [ ] by_period/by_sport_type/trend
- [ ] 提交

---

## 测试与验收标准

| 1 | summary 四项正确 |
| 2 | period 参数有效 |
| 3 | 仅本人数据 |

---

## 完成检查清单

- [ ] 避免 SELECT *

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
