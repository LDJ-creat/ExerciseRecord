# Task T01-03: JWT 鉴权中间件

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T01-03` |
| **Phase** | Phase 1 |
| **类型** | backend |
| **预估工时** | 30min |
| **推荐分支** | `feat/T01-03-jwt-middleware` |
| **Worktree** | 否 |
| **依赖任务** | T01-02 |
| **阻塞任务** | T01-04, T02-01 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T01-03 — JWT 中间件
前置条件：JWT 签发已实现

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

AuthMiddleware：解析 Bearer Token，校验签名/过期，注入 user_id 到 Context。

---

## 实现方式

middleware/auth.go，未登录返回 40101。

---

## 涉及文件

- Create: backend/internal/middleware/auth.go

---

## 实现步骤

- [ ] 实现中间件
- [ ] 测试受保护路由
- [ ] 提交

---

## 测试与验收标准

| 1 | 无 Token | 401 |
| 2 | 有效 Token | 通过 |
| 3 | 过期 Token | 401 |

---

## 完成检查清单

- [ ] user_id 写入 Context

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
