# Task T02-03: 打卡列表/详情/编辑/删除 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T02-03` |
| **Phase** | Phase 2 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T02-03-checkin-crud` |
| **Worktree** | 否 |
| **依赖任务** | T02-02 |
| **阻塞任务** | T02-04, T05-04 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T02-03 — 打卡 CRUD API
前置条件：打卡创建 API 已完成

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

GET list（筛选+分页）、GET :id、PUT :id、DELETE :id。校验 user_id 归属。

---

## 实现方式

扩展 checkin_handler + service。

---

## 涉及文件

- Modify: checkin_handler.go, checkin_service.go

---

## 实现步骤

- [ ] GET list
- [ ] GET :id
- [ ] PUT :id
- [ ] DELETE :id
- [ ] 提交

---

## 测试与验收标准

| 1 | 列表筛选 | 日期+类型有效 |
| 2 | 越权访问他人 | 403 |
| 3 | 编辑后唯一性 | 冲突 409 |

---

## 完成检查清单

- [ ] 分页默认 page_size=20

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
