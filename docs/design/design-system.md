# 运动打卡系统 — 设计规范（Design System）

> **设计方向：**「晨曦跑道 · Dawn Track」— 以清晨运动的第一口呼吸为灵感，传递**节奏感、行动力、可持续的活力**，而非模板化的健身 App 观感。

**受众：** 自主运动的个人用户，需要记录、复盘、坚持习惯。  
**页面首要任务：** 让用户在 3 步内完成「今天练了吗」的判断与打卡。

---

## 一、设计立场（Design Thesis）

运动打卡不是冷冰冰的数据录入，而是**日复一日的节奏累积**。视觉语言应像跑道上的里程标记——清晰、有方向、有温度。

**刻意回避的 AI 默认审美：**
- 暖奶油底 + 赤陶色衬线标题
- 纯黑底 + 荧光绿点缀
- 报纸式密集分栏 + 零圆角

**本项目的审美风险（值得承担）：** 在浅色清爽基调上，使用**珊瑚橙 × 跑道青**的双主色撞色，配合**倾斜的动态条纹**作为品牌签名元素——像运动场地的分道线，暗示「今天也要向前一步」。

---

## 二、色彩系统（Color Tokens）

| Token | 色值 | 语义 | 使用场景 |
|-------|------|------|----------|
| `--color-bg` | `#F4F7FB` | 晨曦雾蓝底 | 页面背景，偏冷调活力感 |
| `--color-surface` | `#FFFFFF` | 纯白卡片 | Card、Modal、表单区 |
| `--color-surface-elevated` | `#EEF2F7` | 浮起层 | 侧边栏、次要面板 |
| `--color-primary` | `#FF5C35` | 动能珊瑚 | 主 CTA、选中态、Streak 高亮 |
| `--color-secondary` | `#0D9488` | 跑道青 | 进度完成、热力图中档、成功态 |
| `--color-accent` | `#F59E0B` | 冲刺琥珀 | 目标临近达成、排行榜 Top3 |
| `--color-text` | `#1E293B` | 深岩灰 | 正文 |
| `--color-text-muted` | `#64748B` | 雾灰 | 辅助说明、图例 |
| `--color-border` | `#E2E8F0` | 浅边界 | 分割线、输入框边框 |
| `--color-danger` | `#EF4444` | 警示红 | 错误、删除确认 |
| `--color-heatmap-0` | `#E2E8F0` | 无运动 | 日历空档 |
| `--color-heatmap-1` | `#CCFBF1` | 轻度 | 日历热力 L1 |
| `--color-heatmap-2` | `#5EEAD4` | 适中 | L2 |
| `--color-heatmap-3` | `#14B8A6` | 活跃 | L3 |
| `--color-heatmap-4` | `#FF5C35` | 高强度 | L4 峰值 |

**渐变（仅用于 Hero / 空状态插画区）：**
```css
--gradient-dawn: linear-gradient(135deg, #FFF7ED 0%, #F4F7FB 40%, #ECFEFF 100%);
--gradient-streak: linear-gradient(90deg, #FF5C35, #F59E0B);
```

**对比度要求：** 正文与背景 ≥ 4.5:1；主按钮白字 on `#FF5C35` ≥ 4.5:1。

---

## 三、字体系统（Typography）

| 角色 | 字体 | 来源 | 用途 |
|------|------|------|------|
| Display | **Syne** | Google Fonts | 页面标题、Streak 数字、排行榜名次 |
| Body | **DM Sans** | Google Fonts | 正文、表单标签、导航 |
| Data | **JetBrains Mono** | Google Fonts | 统计数字、日期、API 无关的纯展示数据 |

**字阶（Type Scale）：**

| 级别 | 字体 | 大小/行高 | 字重 |
|------|------|-----------|------|
| `display-xl` | Syne | 40px / 1.1 | 700 |
| `display-lg` | Syne | 28px / 1.2 | 700 |
| `heading` | Syne | 20px / 1.3 | 600 |
| `body` | DM Sans | 16px / 1.5 | 400 |
| `body-sm` | DM Sans | 14px / 1.5 | 400 |
| `caption` | DM Sans | 12px / 1.4 | 500 |
| `data-lg` | JetBrains Mono | 32px / 1 | 600 |
| `data-md` | JetBrains Mono | 18px / 1.2 | 500 |

**规则：**
- 中文界面仍使用上述拉丁字体族作为 UI 骨架；中文回退：`"PingFang SC", "Microsoft YaHei", sans-serif`
- 数字统计优先 `JetBrains Mono`，增强「可信赖的数据感」
- 标题不用全大写；用字重和颜色建立层级，而非过多装饰

---

## 四、布局与空间（Layout）

**布局概念：**「仪表盘跑道」— 左侧固定导航轨道（窄轨），右侧主内容区为宽跑道，首屏露出「今日状态 + 快捷打卡」。

```
┌──────────────────────────────────────────────────────┐
│ [Logo] 运动打卡                        [昵称] [退出] │  ← 顶栏（移动端收为汉堡）
├────────┬─────────────────────────────────────────────┤
│        │  ┌─────────────────────────────────────┐   │
│ 打卡   │  │ 今日状态 Hero：连续 N 天 · 快捷打卡  │   │
│ 目标   │  └─────────────────────────────────────┘   │
│ 统计   │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ 排行   │  │ 统计卡片 │ │ 统计卡片 │ │ 统计卡片 │   │
│ 日历   │  └──────────┘ └──────────┘ └──────────┘   │
│ 设置   │  [主内容区：列表 / 图表 / 日历]            │
│        │                                             │
└────────┴─────────────────────────────────────────────┘
```

**间距基准：** 4px 网格。常用：`4, 8, 12, 16, 24, 32, 48`。

**圆角：**
- `--radius-sm: 8px` — 按钮、输入框
- `--radius-md: 12px` — 卡片
- `--radius-lg: 16px` — Modal、大面板
- `--radius-full: 9999px` — Badge、头像

**断点：**
- `sm: 640px` — 手机
- `md: 768px` — 平板，侧边栏可折叠
- `lg: 1024px` — 桌面完整布局

**核心操作 ≤ 3 步：** 例：打卡 = 选类型 → 填时长 → 提交。

---

## 五、签名元素（Signature）

**「分道线动效带」（Lane Stripe）**

- 位置：登录后首页 Hero 卡片底部、Streak 展示区域
- 形态：3 条平行细线，`-2deg` 微倾斜，品牌主色渐变，页面加载时自左向右 `stroke-dashoffset` 描边动画（600ms，`ease-out`）
- 语义：跑道分道线 = 每个人都有自己的运动节奏
- 克制原则：全站仅 Hero + 日历页 Streak 卡片使用，其他页面不用

---

## 六、组件规范（HeroUI 映射）

实现时基于 HeroUI v3，通过 Tailwind 变量覆盖主题色。所有页面实现前阅读 `docs/design/design-tokens.css`。

| 场景 | 组件 | 样式要点 |
|------|------|----------|
| 主按钮 | `Button variant="primary"` | 背景 `--color-primary`，hover 加深 8% |
| 次按钮 | `Button variant="secondary"` | 描边 `--color-secondary` |
| 表单 | `Input`, `Select`, `DatePicker` | 圆角 `radius-sm`，focus ring 用 primary |
| 数据卡 | `Card` | 白底 + 轻阴影 `0 1px 3px rgba(30,41,59,0.08)` |
| 进度 | `Progress` | 轨道 `#E2E8F0`，填充 `secondary`；≥100% 切 `accent` |
| 表格 | `Table` | 斑马纹不用；hover 行 `#F8FAFC`；我的排名行左侧 3px primary 边条 |
| 弹窗 | `Modal` | 标题用 `heading` 字阶 |
| 开关 | `Switch` | 开启态 `secondary` |
| 空状态 | 自定义 `EmptyState` | 插画区用 `--gradient-dawn`，文案给明确下一步 |

**运动类型色标（图标/标签底色，非主色）：**

| 类型 | 色标 |
|------|------|
| 跑步 | `#FF5C35` |
| 步行 | `#8B5CF6` |
| 骑行 | `#3B82F6` |
| 游泳 | `#06B6D4` |
| 健身 | `#F59E0B` |
| 其他 | `#94A3B8` |

---

## 七、图表规范（Recharts）

- 饼图：运动类型分布，使用类型色标，无 3D 效果
- 折线图：趋势，线色 `secondary`，点 hover `primary`，面积渐变透明度 0.15
- 坐标轴：字色 `--color-text-muted`，字号 12px
- 图例：置于图表下方，水平排列

---

## 八、动效规范（Motion）

| 场景 | 参数 | 备注 |
|------|------|------|
| 页面进入 | opacity 0→1, 200ms | 仅主内容区 |
| Lane Stripe | 600ms ease-out | 签名元素 |
| 卡片 hover | translateY -2px, 150ms | 统计卡 |
| Progress 变化 | width 400ms ease | 目标进度更新 |
| 热力图 cell hover | scale 1.05, 100ms | 日历格 |

**`prefers-reduced-motion: reduce`：** 禁用 Lane Stripe 动画与卡片 hover 位移，保留颜色变化。

---

## 九、文案调性（Voice & Tone）

- 语气：轻快、直接、像一起跑步的朋友——不煽情，不鸡汤
- 按钮：`保存修改`、`提交打卡`、`设定目标`（动词开头，句子式）
- 空状态：`今天还没有记录`，副文案 `选一种运动，把今天算进节奏里`
- 错误：`密码至少需要 6 位`，说明原因 + 如何修正
- Streak：`连续 5 天`，数字用 `data-lg`，后缀用 `body-sm`

---

## 十、页面级要点

### 登录 / 注册
- 左/上：品牌区 + Lane Stripe 装饰 + 一句话价值主张
- 右/下：白卡片表单，无多余字段
- 注册仅：用户名、昵称、密码、确认密码

### 打卡页
- 顶部：今日是否已打卡状态徽章
- 表单：运动类型用带色标的 Select；补卡日期选过去日期时显示「补录」小标签

### 目标页
- 周/月 Tab；Progress 大号展示；达成时卡片边框闪烁一次 `accent`（300ms）

### 统计 / 排行
- 概览四卡：次数、时长、距离、卡路里——数字 `JetBrains Mono`
- 排行榜：Top3 行背景淡琥珀；我的排名固定吸底或高亮

### 日历
- 热力图 5 级色阶见色彩系统；图例右下角
- Streak 卡片配 Lane Stripe

### 提醒设置
- 开关 + 时间选择；权限被拒时给「如何在浏览器中开启通知」指引

---

## 十一、无障碍基线

- 所有交互元素可见 focus ring
- 图标按钮带 `aria-label`
- 图表提供表格兜底或 `aria-description`
- 色觉友好：热力图不仅靠色相，还用透明度/边框区分

---

## 十二、实现落点

| 文件 | 职责 |
|------|------|
| `docs/design/design-tokens.css` | CSS 变量，供 `index.css` 引入 |
| `frontend/src/styles/typography.css` | Google Fonts 引入 |
| `frontend/src/components/brand/LaneStripe.tsx` | 签名动效组件 |
| `frontend/src/components/brand/EmptyState.tsx` | 统一空状态 |

**任务关联：** T00-02（前端脚手架）引入 tokens；T06-01（布局）落地导航与 Hero；各前端 Task 遵循本规范。
