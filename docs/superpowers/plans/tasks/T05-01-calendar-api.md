# Task T05-01: 日历数据 API（含热力等级）

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T05-01` |
| **Phase** | Phase 5 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T05-01-calendar` |
| **Worktree** | `.worktrees/T05-01-calendar/` |
| **依赖任务** | T02-02 |
| **阻塞任务** | T05-03 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T05-01 — 日历 API
前置条件：有打卡数据

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET /api/calendar：月历数据 + heat_level 0-4 + streak + max_duration。

---

## 实现方式

calendar_handler + calendar_service；Streak 从今天/昨天向前遍历。

---

## 涉及文件

- Create: handler/calendar_handler.go, service/calendar_service.go

---

## 实现步骤

- [ ] 月历聚合
- [ ] heat_level 五档
- [ ] streak 算法
- [ ] 提交

---

## 测试与验收标准

| 1 | days 数组正确 |
| 2 | heat_level 0-4 |
| 3 | streak 准确 |

---

## 完成检查清单

- [ ] max_duration 供前端归一化

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
