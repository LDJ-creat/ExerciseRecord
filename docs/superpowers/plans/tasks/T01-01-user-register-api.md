# Task T01-01: 用户注册 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T01-01` |
| **Phase** | Phase 1 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T01-01-register` |
| **Worktree** | 否（顺序开发） |
| **依赖任务** | T00-04 |
| **阻塞任务** | T01-02, T01-05 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T01-01 — 注册 API
前置条件：GORM 已连接

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

POST /api/auth/register：username 唯一、密码≥6、bcrypt、创建默认 reminder_settings。仅 username，无 email。

---

## 实现方式

TDD：先写密码过短测试 → auth_service.Register → auth_handler → 路由。

---

## 涉及文件

- Create: handler/auth_handler.go, service/auth_service.go, service/auth_service_test.go
- Create: pkg/response/response.go

---

## 实现步骤

- [ ] 写失败测试
- [ ] 实现 Register
- [ ] 注册路由
- [ ] 测试 PASS
- [ ] 提交

---

## 测试与验收标准

| 1 | 正常注册 | code 0 |
| 2 | 密码<6 | 40001 |
| 3 | 重复用户名 | 40901 |
| 4 | 默认提醒 | reminder_settings 自动创建 |

---

## 完成检查清单

- [ ] bcrypt 哈希
- [ ] 不处理 email

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
