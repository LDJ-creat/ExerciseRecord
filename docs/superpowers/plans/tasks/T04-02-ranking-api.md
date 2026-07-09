# Task T04-02: 全局排行 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T04-02` |
| **Phase** | Phase 4 |
| **类型** | backend |
| **预估工时** | 45min |
| **推荐分支** | `feat/T04-02-ranking` |
| **Worktree** | 否 |
| **依赖任务** | T04-01 |
| **阻塞任务** | T04-03 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T04-02 — 排行 API
前置条件：统计模块已建立

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET /api/stats/ranking：Top50 + my_rank，多维度切换。

---

## 实现方式

扩展 stats_handler，JOIN users 取 nickname。

---

## 涉及文件

- Modify: stats_handler.go, stats_service.go

---

## 实现步骤

- [ ] 排行聚合
- [ ] my_rank 计算
- [ ] 提交

---

## 测试与验收标准

| 1 | Top50 |
| 2 | 维度切换 |
| 3 | 不暴露他人明细 |

---

## 完成检查清单

- [ ] LIMIT 50

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
