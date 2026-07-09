# Task T05-03: 前端日历页（含热力图）

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T05-03` |
| **Phase** | Phase 5 |
| **类型** | frontend |
| **预估工时** | 90min |
| **推荐分支** | `feat/T05-03-calendar-frontend` |
| **Worktree** | `.worktrees/T05-03-calendar/` |
| **依赖任务** | T05-01, T00-02 |
| **阻塞任务** | T06-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T05-03 — 日历热力图前端
前置条件：日历 API 就绪

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

月历网格+5级热力色阶+日期 Modal+Streak 卡+LaneStripe+图例。

---

## 实现方式

CalendarView + CalendarHeatmap 组件；使用 --color-heatmap-* tokens。

---

## 涉及文件

- Create: pages/calendar/CalendarView.tsx, components/CalendarHeatmap.tsx, api/calendar.ts

---

## 实现步骤

- [ ] 月历 grid
- [ ] 热力着色
- [ ] 日期 Modal
- [ ] Streak+LaneStripe
- [ ] 图例
- [ ] 提交

---

## 测试与验收标准

| 1 | 热力 5 色阶正确 |
| 2 | 点击日期弹详情 |
| 3 | Streak 显示 |
| 4 | 图例清晰 |

---

## 完成检查清单

- [ ] reduced-motion 尊重

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
