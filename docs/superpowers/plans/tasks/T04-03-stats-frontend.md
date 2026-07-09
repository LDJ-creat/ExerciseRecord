# Task T04-03: 前端统计与排行页

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T04-03` |
| **Phase** | Phase 4 |
| **类型** | frontend |
| **预估工时** | 90min |
| **推荐分支** | `feat/T04-03-stats-frontend` |
| **Worktree** | `.worktrees/T04-03-stats/` |
| **依赖任务** | T04-02, T00-02 |
| **阻塞任务** | T06-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T04-03 — 统计前端
前置条件：统计 API 全部就绪

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

概览四卡（JetBrains Mono 数字）、Recharts 饼图/折线图、排行 Table。

---

## 实现方式

StatsDashboard + RankingPage；遵循图表规范。

---

## 涉及文件

- Create: pages/stats/StatsDashboard.tsx, RankingPage.tsx, api/stats.ts

---

## 实现步骤

- [ ] 概览卡片
- [ ] 饼图
- [ ] 折线图
- [ ] 排行榜
- [ ] 提交

---

## 测试与验收标准

| 1 | 数据与 API 一致 |
| 2 | Top3 琥珀底 |
| 3 | 我的排名高亮 |

---

## 完成检查清单

- [ ] 图表色标用类型色

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
