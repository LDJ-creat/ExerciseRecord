# Task T05-04: 前端提醒功能

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T05-04` |
| **Phase** | Phase 5 |
| **类型** | frontend |
| **预估工时** | 75min |
| **推荐分支** | `feat/T05-04-reminder-frontend` |
| **Worktree** | `.worktrees/T05-04-reminder/` |
| **依赖任务** | T05-02, T02-03 |
| **阻塞任务** | T05-05, T06-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T05-04 — 提醒前端
前置条件：提醒 API + 打卡列表 API

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

提醒设置页+useReminder hook+浏览器 Notification+智能跳过+写日志。

---

## 实现方式

Switch+时间输入；每分钟检查；POST logs。

---

## 涉及文件

- Create: hooks/useReminder.ts, pages/settings/ReminderSettings.tsx, api/reminder.ts

---

## 实现步骤

- [ ] 设置页
- [ ] 请求权限
- [ ] useReminder
- [ ] 日志写入
- [ ] 提交

---

## 测试与验收标准

| 1 | 设置保存 |
| 2 | 未打卡触发通知 |
| 3 | 已打卡跳过+日志 status=2 |

---

## 完成检查清单

- [ ] 权限被拒有指引文案

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
