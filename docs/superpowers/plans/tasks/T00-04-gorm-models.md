# Task T00-04: GORM 模型与数据库连接

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T00-04` |
| **Phase** | Phase 0 |
| **类型** | backend |
| **预估工时** | 45min |
| **推荐分支** | `main` |
| **Worktree** | 否 |
| **依赖任务** | T00-01, T00-03 |
| **阻塞任务** | T01-01 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T00-04 — GORM 模型
前置条件：T00-01+T00-03 完成

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

6 个 GORM 模型 + MySQL 连接初始化。

---

## 实现方式

model/*.go + config DSN + main 连接 DB。

---

## 涉及文件

- Create: backend/internal/model/*.go
- Modify: config.go, main.go

---

## 实现步骤

- [ ] User 模型
- [ ] 其余 5 模型
- [ ] DB 连接
- [ ] 验证
- [ ] 提交

---

## 测试与验收标准

| 1 | DB connected 日志 |
| 2 | 6 模型文件 |

---

## 完成检查清单

- [ ] /health 仍可用

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
