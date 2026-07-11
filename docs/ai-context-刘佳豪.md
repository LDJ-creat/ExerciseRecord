# AI 开发上下文总结 — 刘佳豪

> **项目：** 运动打卡系统（ExerciseRecord）  
> **角色：** 前端核心开发 · M01 认证页 · M02 打卡前端 · M03 目标前端 · M04 统计前端 · M06 布局  
> **开发周期：** 2026-07-09 ~ 2026-07-10  
> **任务来源：** [飞书多维表格](https://qcndmg3uorlg.feishu.cn/base/I6rKbjA7wacoNbsdArHcE3bUnqf?table=tblOhzC9mW5ygMnb&view=vewhP7JKEa)

---

## 一、负责任务清单

| Task ID | 任务描述 | Wave | Worktree / 分支 |
|---------|----------|------|-----------------|
| T00-02 | 初始化 React + HeroUI 前端脚手架 | Wave 0 | `.worktrees/T00-02-frontend/` |
| T01-05 | 前端登录注册与资料页 | Wave 1 | `.worktrees/T01-05-auth/` |
| T06-01 | 应用布局与导航 | Wave 1.5 | `.worktrees/T06-01-layout/` |
| T02-04 | 前端打卡页面 | Wave 2 | `.worktrees/T02-04-checkin/` |
| T03-03 | 前端目标管理页 | Wave 3-A | `.worktrees/T03-goal/` |
| T04-03 | 前端统计与排行页 | Wave 3-B | `.worktrees/T04-stats/` |
| T06-02 | 端到端验收测试 | Wave 4 | `main`（全员） |

---

## 二、提供给 AI 的核心上下文

### 2.1 必读文档

| 优先级 | 文件 | 用途 |
|--------|------|------|
| 1 | `AGENTS.md` | 项目全局上下文 |
| 2 | `docs/design/design-system.md` | **「晨曦跑道 · Dawn Track」** 设计规范（所有前端任务必读） |
| 3 | `docs/design/design-tokens.css` | 颜色、字体、阴影 Token |
| 4 | 当前任务 `docs/superpowers/plans/tasks/Txx-xx-*.md` | 实现步骤与验收标准 |
| 5 | `docs/superpowers/plans/execution-order.md` | Worktree 操作与合并顺序 |

### 2.2 前端专属 Agent 提示词

```
请执行运动打卡系统前端任务 Txx-xx。

【必读】
1. AGENTS.md
2. docs/design/design-system.md
3. docs/superpowers/plans/tasks/<TASK_FILE>.md

【Worktree】
在 .worktrees/<ID>/ 开发，分支 feat/<BRANCH>

【执行要求】
- 遵循 Dawn Track 设计规范（珊瑚橙 #FF5C35 + 跑道青 #0D9488）
- 字体：Syne（标题）/ DM Sans（正文）/ JetBrains Mono（数据）
- HeroUI v3 组件，无需 Provider
- 样式顺序：tailwindcss → @heroui/styles → design tokens
- npm run build 验证
- 不要 git commit

开始执行。
```

### 2.3 设计规范要点（提供给 AI）

- **主色：** `--color-primary: #FF5C35`（珊瑚橙）
- **辅色：** `--color-secondary: #0D9488`（跑道青）
- **签名元素：** `LaneStripe` 分道线动效（仅 Hero / Streak 区域）
- **进度条：** 轨道 `#E2E8F0`，填充 `secondary`，≥100% 切 `accent`
- **热力图：** 5 级 `--color-heatmap-0` ~ `--color-heatmap-4`

---

## 三、AI 辅助开发工作流

### 3.1 Wave 0 — 前端脚手架（T00-02）

在独立 Worktree 并行开发：

```bash
git worktree add .worktrees/T00-02-frontend -b feat/T00-02-frontend-scaffold
```

Agent 任务：
- Vite + React 19 + TypeScript 初始化
- 集成 HeroUI v3 + Tailwind CSS v4
- 引入 `design-tokens.css` 与 Google Fonts
- 配置 Vite `server.proxy['/api']` → `http://localhost:8080`
- 验证 HeroUI Button 与设计背景色 `#F4F7FB`

完成后 merge 到 `main`。

### 3.2 Wave 1 — 认证前端（T01-05）

依赖：T00-02 + T01-04（后端资料 API 就绪）

实现内容：
- 登录页 / 注册页（**无 email 字段**）
- 登录页使用 `LaneStripe` 签名动效
- 资料页：昵称、头像、性别、身高、体重编辑
- `ProtectedRoute` + JWT Token 存储（`store/auth.ts`）
- Axios 拦截器自动附加 `Authorization: Bearer <token>`

### 3.3 Wave 1.5 — 布局壳（T06-01）

与 Wave 2 后端**并行**开发：

- `AppLayout`：顶栏 + 侧栏 + 移动端抽屉
- 路由表：打卡 / 目标 / 统计 / 排行 / 日历 / 设置
- `DashboardHero`：仪表盘跑道布局
- 各模块占位页（后续 Wave 3 填充）

**关键：** T06-01 应尽早启动，避免并行前端缺布局。

### 3.4 Wave 2 — 打卡前端（T02-04）

依赖：T02-03 + T01-05 + T06-01

在 `.worktrees/T02-04-checkin/` 实现：
- `CheckInForm`：HeroUI Select / DatePicker / Input
- `CheckInList`：Table + Modal 编辑删除
- 运动类型色标、补录标签、409 重复打卡错误提示
- 集成到 `CheckInPage`（保留 `DashboardHero`）

### 3.5 Wave 3 — 目标与统计前端

| 任务 | 页面 | 技术要点 |
|------|------|----------|
| T03-03 | `/goals` | HeroUI ProgressBar、周/月 Tab、历史列表 |
| T04-03 | `/stats` `/ranking` | Recharts 饼图/折线图、JetBrains Mono 数字、Top50 Table |

---

## 四、关键产出文件

```
frontend/src/
├── api/
│   ├── client.ts          # Axios 实例 + JWT 拦截器
│   ├── auth.ts            # 认证 API
│   ├── checkin.ts         # 打卡 API
│   ├── goal.ts            # 目标 API
│   └── stats.ts           # 统计/排行 API
├── components/
│   ├── AppLayout.tsx      # 全局布局
│   ├── DashboardHero.tsx  # 仪表盘 Hero
│   ├── LaneStripe.tsx     # 签名分道线
│   └── ProtectedRoute.tsx
├── pages/
│   ├── auth/              # Login, Register
│   ├── checkin/           # CheckInForm, CheckInList, CheckInPage
│   ├── goals/             # GoalsPage, goalUtils
│   ├── stats/             # StatsDashboard, StatsPage
│   ├── ranking/           # RankingPage
│   └── profile/           # Profile
├── router/index.tsx       # 完整路由表
└── store/auth.ts          # Token/用户状态
```

---

## 五、遇到的问题与 AI 协作经验

| 问题 | 处理方式 |
|------|----------|
| `/goals` 页面白屏 | `Tabs.Indicator` 须放在每个 `Tabs.Tab` 内部，不能作为 `Tabs.List` 兄弟节点 |
| `/ranking` 页面白屏 | `Table` 须用 `Table.Content` 包裹 `Header` 和 `Body` |
| T02-04 与 T06-01 路由冲突 | 先 merge 布局壳，再在 `CheckInPage` 替换占位内容 |
| 资料页无法清空身高/体重 | 前端传 `null`，后端用 `optional.Float64` 区分 absent/null |
| Worktree 合并冲突 | 按 `pages/` 子目录分工，减少同一文件并行修改 |

### HeroUI v3 使用注意

1. `Tabs.Indicator` 放在 `Tabs.Tab` **内部**（参考 `Profile.tsx`）
2. `Table` 结构：`Table` → `Table.Content` → `Header` + `Body`
3. `Select` 使用 `selectedKey` + `onSelectionChange`
4. 嵌套 `Tabs` 易触发 `SharedElement` 错误，复杂切换改用 `Button` 组

### 协作建议

1. 前端任务**必须**附带 `design-system.md`，否则 AI 产出样式不一致
2. 使用 Worktree 隔离并行前端，按 `execution-order.md` 合并
3. 每个页面完成后 `npm run build` + 浏览器手动走查
4. API 未就绪时可用 mock 数据先行开发 UI 骨架

---

## 六、参考链接

- 设计规范：`docs/design/design-system.md`
- 执行顺序：`docs/superpowers/plans/execution-order.md`
- 启动文档：`README.md`
