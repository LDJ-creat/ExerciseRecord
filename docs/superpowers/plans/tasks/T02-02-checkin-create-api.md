# Task T02-02: 提交打卡 API

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T02-02` |
| **Phase** | Phase 2 |
| **类型** | backend |
| **预估工时** | 60min |
| **推荐分支** | `feat/T02-02-checkin-create` |
| **Worktree** | 否 |
| **依赖任务** | T02-01 |
| **阻塞任务** | T02-03, T02-04, T03-02 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T02-02 — 打卡创建 API
前置条件：运动类型 API 可用

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

POST /api/checkin：记录运动数据；补卡逻辑；唯一性校验；非负校验；不可未来日期。

---

## 实现方式

TDD 重复打卡测试 → checkin_service.Create → handler。

---

## 涉及文件

- Create: handler/checkin_handler.go, service/checkin_service.go, checkin_service_test.go

---

## 实现步骤

- [ ] 写重复打卡失败测试
- [ ] 实现 Create
- [ ] 路由 POST /api/checkin
- [ ] 测试 PASS
- [ ] 提交

---

## 测试与验收标准

| 1 | 正常打卡 | code 0 |
| 2 | 重复打卡 | 40901 |
| 3 | 未来日期 | 40001 |
| 4 | 补卡 | is_makeup=1 |

---

## 完成检查清单

- [ ] user_id 来自 JWT

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
