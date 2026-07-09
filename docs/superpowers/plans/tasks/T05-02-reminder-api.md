# Task T05-02: 提醒设置与日志 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T05-02` |
| **Phase** | Phase 5 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T05-02-reminder` |
| **Worktree** | 否 |
| **依赖任务** | T01-01 |
| **阻塞任务** | T05-04, T05-05 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T05-02 — 提醒 API
前置条件：用户+reminder_settings 存在

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET/PUT /api/reminder；GET/POST /api/reminder/logs 分页历史。

---

## 实现方式

reminder_handler + reminder_service。

---

## 涉及文件

- Create: handler/reminder_handler.go, service/reminder_service.go

---

## 实现步骤

- [ ] GET/PUT reminder
- [ ] GET logs 分页
- [ ] POST log 写入
- [ ] 提交

---

## 测试与验收标准

| 1 | 读写设置 |
| 2 | 日志分页 |
| 3 | status 0/1/2 |

---

## 完成检查清单

- [ ] 仅本人日志

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
