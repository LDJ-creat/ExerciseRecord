# Task T00-03: 数据库 DDL 与种子数据

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T00-03` |
| **Phase** | Phase 0 |
| **类型** | database |
| **预估工时** | 45min |
| **推荐分支** | `main` |
| **Worktree** | 否 |
| **依赖任务** | 无 |
| **阻塞任务** | T00-04, 全部后端 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T00-03 — MySQL 建表
前置条件：无，可与 T00-01/T00-02 并行

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

6 张表 DDL + 运动类型种子 + .env.example。

---

## 实现方式

schema.sql + seed.sql，本地 mysql 执行。

---

## 涉及文件

- Create: database/schema.sql, seed.sql, backend/.env.example

---

## 实现步骤

- [ ] 编写 schema
- [ ] 编写 seed
- [ ] 本地执行
- [ ] 验证
- [ ] 提交

---

## 测试与验收标准

| 1 | 6 张表 | SHOW TABLES |
| 2 | 6 行类型 | sport_types |

---

## 完成检查清单

- [ ] 无真实密码入库

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
