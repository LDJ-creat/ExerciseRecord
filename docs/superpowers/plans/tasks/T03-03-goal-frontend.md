# Task T03-03: 前端目标管理页

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T03-03` |
| **Phase** | Phase 3 |
| **类型** | frontend |
| **预估工时** | 75min |
| **推荐分支** | `feat/T03-03-goal-frontend` |
| **Worktree** | `.worktrees/T03-03-goal/` |
| **依赖任务** | T03-02, T00-02 |
| **阻塞任务** | T06-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T03-03 — 目标前端
前置条件：目标 API 全部就绪

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

目标设定表单、Progress 进度条、历史目标 Tab。达成时 accent 闪烁。

---

## 实现方式

HeroUI Tabs/Select/Input/Progress；api/goal.ts。

---

## 涉及文件

- Create: pages/goal/GoalManage.tsx, api/goal.ts

---

## 实现步骤

- [ ] 设定表单
- [ ] 进度展示
- [ ] 历史 Tab
- [ ] 提交

---

## 测试与验收标准

| 1 | 设目标后显示进度 |
| 2 | 打卡后进度更新 |
| 3 | 历史列表可见 |

---

## 完成检查清单

- [ ] Progress 颜色规则符合 design-system

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
