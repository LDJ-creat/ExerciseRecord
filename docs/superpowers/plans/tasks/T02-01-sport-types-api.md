# Task T02-01: 运动类型列表 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T02-01` |
| **Phase** | Phase 2 |
| **类型** | backend |
| **预估工时** | 20min |
| **推荐分支** | `feat/T02-01-sport-types` |
| **Worktree** | 否 |
| **依赖任务** | T01-03 |
| **阻塞任务** | T02-02, T02-04 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T02-01 — 运动类型 API
前置条件：JWT 中间件可用

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET /api/sport-types：返回启用中的运动类型字典。

---

## 实现方式

sport_handler.go，查询 is_active=1，按 sort_order。

---

## 涉及文件

- Create: backend/internal/handler/sport_handler.go

---

## 实现步骤

- [ ] 实现 handler
- [ ] 挂 AuthMiddleware
- [ ] 提交

---

## 测试与验收标准

| 1 | 返回 6 种类型 |
| 2 | 含 need_distance 字段 |

---

## 完成检查清单

- [ ] 需登录访问

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
