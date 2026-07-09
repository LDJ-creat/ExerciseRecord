# Task T00-02: 初始化 React + HeroUI 前端脚手架

## 元信息

| 字段 | 值 |
|------|-----|
| **Task ID** | `T00-02` |
| **Phase** | Phase 0 |
| **类型** | frontend |
| **预估工时** | 45min |
| **推荐分支** | `feat/T00-02-frontend-scaffold` |
| **Worktree** | `.worktrees/T00-02-frontend/`（与 T00-01 并行） |
| **依赖任务** | 无 |
| **阻塞任务** | T01-05, T06-01 |

---

## 会话上下文（复制到新会话）

```
项目：运动打卡系统（ExerciseRecord），课程大作业，前后端分离。
技术栈：React + HeroUI v3 + Go + Gin + 本地 MySQL。
必读：AGENTS.md、docs/design/design-system.md（前端任务）、本任务文件。

当前任务：T00-02 — React+HeroUI 脚手架
前置条件：无，可与 T00-01/T00-03 并行

完成后汇报：变更文件、验证命令、验收结果、是否可合并。
```

---

## 功能设计

### 目标
搭建前端工程底座：Vite + React 19 + TypeScript + HeroUI v3 + Tailwind v4，并落地「晨曦跑道」设计 Token，使后续所有前端 Task 有统一的视觉与工程基础。

### 页面/组件范围
本任务仅验证脚手架，产出：
- 全局样式链（Tailwind → HeroUI → Design Tokens）
- Google Fonts 加载
- `/api` 开发代理
- 临时 `App.tsx` 验证页（可含 HeroUI Button + 背景色检查）

### 设计规范要点
- 背景色：`--color-bg: #F4F7FB`
- 主色：`--color-primary: #FF5C35`
- 字体：Syne / DM Sans / JetBrains Mono
- 详见 `docs/design/design-system.md` §二~§四

---

## 实现方式

### 1. 项目初始化
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
npm install @heroui/react @heroui/styles tailwindcss @tailwindcss/vite
npm install axios react-router-dom recharts dayjs
```

### 2. 样式链
`frontend/src/index.css`：
```css
@import "tailwindcss";
@import "@heroui/styles";
@import "./styles/design-tokens.css";
```
`design-tokens.css` 从 `docs/design/design-tokens.css` 复制到 `frontend/src/styles/`。

### 3. 字体
`frontend/src/styles/typography.css` 通过 Google Fonts 引入 Syne、DM Sans、JetBrains Mono，在 `main.tsx` 引入。

### 4. Vite 配置
- 插件：`react()` + `tailwindcss()`
- 代理：`/api` → `http://localhost:8080`

### 5. 验证页面临时内容
```tsx
import { Button } from "@heroui/react";
// 背景使用 bg-[var(--color-bg)]，按钮 primary
```

---

## 涉及文件

- Create: `frontend/`（Vite 模板完整结构）
- Create: `frontend/src/styles/design-tokens.css`（从 docs/design 复制）
- Create: `frontend/src/styles/typography.css`
- Modify: `frontend/vite.config.ts`, `frontend/src/index.css`, `frontend/src/main.tsx`

---

## 实现步骤

- [ ] Step 1: 创建 Vite React TS 项目
- [ ] Step 2: 安装 HeroUI、Tailwind、路由、图表依赖
- [ ] Step 3: 配置 index.css 样式链（顺序不可颠倒）
- [ ] Step 4: 复制 design-tokens.css 并引入 typography.css
- [ ] Step 5: 配置 vite.config.ts（tailwind 插件 + api 代理）
- [ ] Step 6: App.tsx 放置 HeroUI Button 验证渲染
- [ ] Step 7: `npm run dev` 启动并目视检查背景色与按钮
- [ ] Step 8: 删除或保留临时验证代码（不影响后续 Task）

---

## 测试与验收标准

| # | 验收项 | 通过标准 |
|---|--------|----------|
| 1 | 开发服务器 | `npm run dev` 访问 localhost:5173 无报错 |
| 2 | HeroUI 组件 | Button 显示 HeroUI 主题样式 |
| 3 | 设计 Token | 页面背景为 #F4F7FB |
| 4 | 字体 | DevTools 可见 Syne/DM Sans 已加载 |
| 5 | API 代理 | vite.config 含 `/api` → `:8080` 配置 |
| 6 | 构建 | `npm run build` 无 TypeScript 错误 |

---

## 完成检查清单

- [ ] tokens 已引入
- [ ] 可并行合并

---

## 参考

- 总体计划：`docs/superpowers/plans/2026-07-08-exercise-checkin-system-master-plan.md`
- 设计规范：`docs/design/design-system.md`（前端适用）
- 开发顺序：`docs/superpowers/plans/execution-order.md`
