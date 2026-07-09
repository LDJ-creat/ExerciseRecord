# Task T02-04: 前端打卡页面

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T02-04` |
| **Phase** | Phase 2 |
| **类型** | frontend |
| **预估工时** | 90min |
| **推荐分支** | `feat/T02-04-checkin-frontend` |
| **Worktree** | `.worktrees/T02-04-checkin/` |
| **依赖任务** | T00-02, T02-03, T01-05 |
| **阻塞任务** | T03-03, T06-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T02-04 — 打卡前端
前置条件：打卡 API 全部就绪+认证前端

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

打卡表单+列表+编辑删除 Modal。运动类型带色标。补卡显示标签。

---

## 实现方式

HeroUI Select/DatePicker/Input/Table/Modal；api/checkin.ts。

---

## 涉及文件

- Create: pages/checkin/CheckInForm.tsx, CheckInList.tsx, api/checkin.ts

---

## 实现步骤

- [ ] 打卡表单
- [ ] 列表+筛选
- [ ] 编辑删除 Modal
- [ ] 409 错误提示
- [ ] 提交

---

## 测试与验收标准

| 1 | 提交打卡 | 列表可见 |
| 2 | 补卡 | 显示补录标签 |
| 3 | 重复打卡 | 错误提示 |
| 4 | 运动色标 | 符合 design-system |

---

## 完成检查清单

- [ ] 核心操作≤3步

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
