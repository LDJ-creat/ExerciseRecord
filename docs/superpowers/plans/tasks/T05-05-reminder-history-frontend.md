# Task T05-05: 提醒历史日志 UI

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T05-05` |
| **Phase** | Phase 5 |
| **类型** | frontend |
| **预估工时** | 45min |
| **推荐分支** | `feat/T05-05-reminder-history` |
| **Worktree** | `.worktrees/T05-05-reminder-history/` |
| **依赖任务** | T05-02, T05-04 |
| **阻塞任务** | T06-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T05-05 — 提醒历史 UI
前置条件：提醒 API+设置页已完成

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

提醒历史 Table+分页+状态 Badge+导航入口。

---

## 实现方式

ReminderHistory.tsx；GET /api/reminder/logs。

---

## 涉及文件

- Create: pages/settings/ReminderHistory.tsx

---

## 实现步骤

- [ ] 历史 Table
- [ ] 分页
- [ ] Badge 三色
- [ ] 导航入口
- [ ] 提交

---

## 测试与验收标准

| 1 | 列表展示 |
| 2 | 分页有效 |
| 3 | 状态区分清晰 |

---

## 完成检查清单

- [ ] 空状态有引导

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
