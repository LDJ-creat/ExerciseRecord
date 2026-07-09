# Task T06-01: 应用布局与导航

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T06-01` |
| **Phase** | Phase 6 |
| **类型** | frontend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T06-01-layout` |
| **Worktree** | `.worktrees/T06-01-layout/`（建议 Wave 2 提前启动） |
| **依赖任务** | T00-02, T01-05 |
| **阻塞任务** | T06-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T06-01 — 布局导航
前置条件：前端脚手架+认证完成；可在页面未全完成时先做壳

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

侧边栏/顶栏导航、路由表、登录态展示、退出。仪表盘跑道布局。

---

## 实现方式

AppLayout + router/index.tsx；HeroUI Navbar/Card 侧栏。

---

## 涉及文件

- Create: components/AppLayout.tsx, router/index.tsx
- Modify: main.tsx, App.tsx

---

## 实现步骤

- [ ] 路由表
- [ ] 侧栏导航
- [ ] 昵称+退出
- [ ] 响应式折叠
- [ ] 提交

---

## 测试与验收标准

| 1 | 6 模块可导航 |
| 2 | 未登录跳登录 |
| 3 | 移动端可用 |

---

## 完成检查清单

- [ ] 符合 design-system 布局

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
