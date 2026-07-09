# Task T01-04: 个人资料与密码修改 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T01-04` |
| **Phase** | Phase 1 |
| **类型** | backend |
| **预估工时** | 45min |
| **推荐分支** | `feat/T01-04-profile` |
| **Worktree** | 否 |
| **依赖任务** | T01-03 |
| **阻塞任务** | T01-05 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T01-04 — 资料/改密 API
前置条件：JWT 中间件可用

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET/PUT /api/user/profile；PUT /api/user/password（校验旧密码）。

---

## 实现方式

user_handler.go，所有路由挂 AuthMiddleware。

---

## 涉及文件

- Create: backend/internal/handler/user_handler.go

---

## 实现步骤

- [ ] GET profile
- [ ] PUT profile
- [ ] PUT password
- [ ] 挂载中间件
- [ ] 提交

---

## 测试与验收标准

| 1 | GET 返回本人资料 |
| 2 | PUT 更新成功 |
| 3 | 旧密码错误 | 40001 |
| 4 | 未登录 | 401 |

---

## 完成检查清单

- [ ] 仅操作本人数据

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
