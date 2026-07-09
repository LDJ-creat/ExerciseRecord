# Task T06-02: 端到端验收测试

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T06-02` |
| **Phase** | Phase 6 |
| **类型** | qa |
| **预估工时** | 120min |
| **推荐分支** | `main` |
| **Worktree** | 否（所有分支合并后） |
| **依赖任务** | 全部功能 Task |
| **阻塞任务** | T06-03 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T06-02 — E2E 验收
前置条件：所有模块已合并 main

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

执行 9 条 E2E 流程 + 安全测试，记录 BUG 并修复。

---

## 实现方式

按验收清单逐项手动测试。

---

## 涉及文件

- 可能修改: 各模块 BUG 修复

---

## 实现步骤

- [ ] 流程 A~H
- [ ] 安全测试
- [ ] 记录结果
- [ ] 修复 BLOCKER

---

## 测试与验收标准

| 1 | 9 流程全通过 |
| 2 | 越权 403 |
| 3 | 无 BLOCKER BUG |

---

## 完成检查清单

- [ ] 验收报告写入 docs/qa-acceptance.md

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
