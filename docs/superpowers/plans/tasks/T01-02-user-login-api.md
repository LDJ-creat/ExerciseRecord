# Task T01-02: 用户登录 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T01-02` |
| **Phase** | Phase 1 |
| **类型** | backend |
| **预估工时** | 45min |
| **推荐分支** | `feat/T01-02-login` |
| **Worktree** | 否 |
| **依赖任务** | T01-01 |
| **阻塞任务** | T01-03, T01-05 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T01-02 — 登录 API
前置条件：注册 API 已完成

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

POST /api/auth/login：校验密码，签发 JWT（7天），返回 token + user。

---

## 实现方式

auth_service.Login + JWT 签发（golang-jwt）。

---

## 涉及文件

- Modify: auth_handler.go, auth_service.go
- Create: pkg/jwt/jwt.go

---

## 实现步骤

- [ ] 实现 Login
- [ ] JWT 签发
- [ ] 错误密码 401
- [ ] 提交

---

## 测试与验收标准

| 1 | 正确登录 | 返回 token |
| 2 | 错误密码 | 40101 |
| 3 | JWT 可解析 | payload 含 user_id |

---

## 完成检查清单

- [ ] exp 7天

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
