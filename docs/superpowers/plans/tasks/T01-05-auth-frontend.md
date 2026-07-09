# Task T01-05: 前端登录注册与资料页

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T01-05` |
| **Phase** | Phase 1 |
| **类型** | frontend |
| **预估工时** | 90min |
| **推荐分支** | `feat/T01-05-auth-frontend` |
| **Worktree** | `.worktrees/T01-05-auth/` |
| **依赖任务** | T00-02, T01-04 |
| **阻塞任务** | T02-04, T06-01 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T01-05 — 认证前端
前置条件：前端脚手架+M01 API 全部就绪

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

登录/注册页、Axios 拦截器、ProtectedRoute、个人资料页。遵循 Dawn Track 设计规范。

---

## 实现方式

HeroUI Card+Input+Button+Tabs；localStorage 存 token；401 跳登录。

---

## 涉及文件

- Create: pages/auth/Login.tsx, Register.tsx, pages/profile/Profile.tsx
- Create: api/client.ts, api/auth.ts, store/auth.ts, components/ProtectedRoute.tsx

---

## 实现步骤

- [ ] Axios 拦截器
- [ ] 登录注册页（设计规范）
- [ ] ProtectedRoute
- [ ] 资料页 Tabs
- [ ] 手动流程验证
- [ ] 提交

---

## 测试与验收标准

| 1 | 注册→登录 | 成功获取 token |
| 2 | 改资料 | 刷新后保持 |
| 3 | 改密码 | 新密码可登录 |
| 4 | 未登录访问 | 跳 /login |
| 5 | 视觉 | 符合 design-system |

---

## 完成检查清单

- [ ] 注册无 email 字段
- [ ] LaneStripe 用于登录页 Hero

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
