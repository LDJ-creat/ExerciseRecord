# Task T03-02: 目标进度计算 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T03-02` |
| **Phase** | Phase 3 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T03-02-goal-progress` |
| **Worktree** | 否 |
| **依赖任务** | T03-01, T02-02 |
| **阻塞任务** | T03-03 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T03-02 — 目标进度 API
前置条件：目标 API + 打卡数据

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET /api/goal/progress：聚合 check_ins 计算完成百分比，自动更新 status。

---

## 实现方式

goal_progress.go，按 target_type 聚合 COUNT/SUM。

---

## 涉及文件

- Create: service/goal_progress.go
- Modify: goal_handler.go

---

## 实现步骤

- [ ] 进度计算逻辑
- [ ] GET /api/goal/progress
- [ ] 周期结束标记 status=2
- [ ] 提交

---

## 测试与验收标准

| 1 | 进度准确 | 与手动计算一致 |
| 2 | 达成 | status=1 |
| 3 | 过期未达成 | status=2 |

---

## 完成检查清单

- [ ] progress_percent 保留一位小数

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
