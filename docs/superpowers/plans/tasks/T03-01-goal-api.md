# Task T03-01: 目标创建/查询/修改 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T03-01` |
| **Phase** | Phase 3 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T03-01-goal` |
| **Worktree** | `.worktrees/T03-01-goal/`（可与 T02-04 并行） |
| **依赖任务** | T01-03 |
| **阻塞任务** | T03-02, T03-03 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T03-01 — 目标 API
前置条件：JWT 可用；打卡数据后续用于进度

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

POST/GET/PUT /api/goal。周/月目标，唯一约束 per user+period。

---

## 实现方式

goal_handler + goal_service。

---

## 涉及文件

- Create: handler/goal_handler.go, service/goal_service.go

---

## 实现步骤

- [ ] POST 创建
- [ ] GET 当前+history
- [ ] PUT 修改
- [ ] 提交

---

## 测试与验收标准

| 1 | 创建周目标 | 成功 |
| 2 | 重复周期 | 409 |
| 3 | 已结束不可改 | 40001 |

---

## 完成检查清单

- [ ] period_type 1=周 2=月

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
