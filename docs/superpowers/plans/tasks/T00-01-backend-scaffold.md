# Task T00-01: 初始化 Go 后端脚手架

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T00-01` |
| **Phase** | Phase 0 |
| **类型** | backend |
| **预估工时** | 30min |
| **推荐分支** | `main` |
| **Worktree** | 否（main 直接开发） |
| **依赖任务** | 无 |
| **阻塞任务** | T00-04, T01-01 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T00-01 — Go 后端脚手架
前置条件：无，项目首个后端任务

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

建立 Go 后端最小可运行骨架：Gin HTTP 服务、配置加载、`/health` 健康检查。

---

## 实现方式

go mod init → 安装 gin/viper → config.Load() 读 PORT → main 注册 /health。

---

## 涉及文件

- Create: `backend/go.mod`, `backend/cmd/server/main.go`, `backend/internal/config/config.go`

---

## 实现步骤

- [ ] Step 1: 初始化 Go 模块
- [ ] Step 2: 实现 config.go
- [ ] Step 3: 实现 main.go
- [ ] Step 4: go run 验证
- [ ] Step 5: 提交

---

## 测试与验收标准

| 1 | 服务启动 | go run 无 panic |
| 2 | /health | 返回 status ok |

---

## 完成检查清单

- [ ] 验收通过
- [ ] 保持脚手架纯净

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
