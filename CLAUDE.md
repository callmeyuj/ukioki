# uki oki 品牌官网 — 项目记忆

> 每次新会话开始时，请先阅读本文件了解项目进展。

---

## 项目概述

**uki oki** 品牌官网，包含多个独立功能模块，部署于 `www.ukioki.com`。

### 功能模块

| 模块 | 路径 | 功能 | 状态 |
|------|------|------|------|
| **热量计算器** | `/calories/` | 宠物每日摄入热量计算 + uki oki 鲜食喂食建议 | ✅ 已上线（V3.22） |
| **订阅计划** | `/plan/` | 基于热量计算的包数，提供订阅分配和算价 | 🔜 待开发 |

### 技术栈

- 纯前端（HTML + CSS + JS），无框架依赖
- 每个模块独立运行，共享品牌资源
- 微信小程序可单独跳转各功能页

---

## 目录结构

```
ukioki/
├── shared/                # 共享品牌资源
│   ├── brand.css          # 品牌变量、基础重置、容器样式
│   ├── components.css     # 公共组件（按钮、卡片、输入框、Toast）
│   └── utils.js           # 共享工具函数（数值、环境判断、DOM、防抖）
├── calories/              # 热量计算器模块
│   ├── index.html         # 页面结构
│   ├── style.css          # 模块专属样式
│   ├── script.js          # 逻辑
│   ├── CLAUDE.md          # 模块专属文档
│   ├── harness.md         # 模块迭代规范
│   └── CHANGELOG.md       # 模块版本记录
├── plan/                  # 订阅计划模块（待开发）
│   └── (空)
├── CLAUDE.md              # 本文件（品牌级文档）
├── harness.md             # 品牌级迭代规范
└── CHANGELOG.md           # 品牌级版本记录
```

---

## 开发规范

详见根目录 `harness.md`，核心要点：
- 所有修改先进入 Plan 模式沟通
- 分步执行，每步等确认
- 每次版本变更同步更新 CHANGELOG.md
- Git tag 标记版本，保留最近 10 个

---

## 开发环境

- **本地服务器**：`http-server -p 8080 -c-1`（Node.js，禁用缓存）
- **访问地址**：
  - 热量计算器：`http://localhost:8080/calories/`
  - 订阅计划：`http://localhost:8080/plan/`（待开发）

### Git Remote

| Remote | 地址 | 用途 | 当前状态 |
|--------|------|------|----------|
| `ukioki` | `git@github.com:callmeyuj/ukioki.git` | 品牌官网（www.ukioki.com） | V1.2（共享 JS 工具提取） |

**部署**：腾讯云托管，域名 `www.ukioki.com` 已备案

---

## 当前版本

**V1.2** — 2026/09/08（共享 JS 工具提取：创建 shared/utils.js）

---

## 模块状态

### 热量计算器（calories/）

**当前版本**：V3.22
**核心功能**：
- 引导用户选择宠物信息（犬/猫）
- 计算每日建议摄入热量（MER）
- 给出 uki oki 品牌鲜食喂食建议
- 支持分享功能（快照截图、保存图片、转发好友）

**详细文档**：见 `calories/CLAUDE.md`

### 订阅计划（plan/）

**当前版本**：待开发
**计划功能**：
- 基于热量计算得出的包数
- 订阅分配方案（口味组合）
- 价格计算
- 订阅管理

---

## 共享资源架构（V1.1 新增，V1.2 扩展 JS）

### 架构设计

采用**方案 C（混合架构）**：共享品牌资源 + 模块专属样式/逻辑

```
shared/brand.css        ← 品牌变量、基础重置、容器
shared/components.css   ← 公共组件（按钮、卡片、输入框、Toast）
shared/utils.js         ← 共享工具函数（V1.2 新增）
calories/style.css      ← 热量计算器专属样式
calories/script.js      ← 热量计算器专属逻辑
plan/style.css          ← 订阅计划专属样式（待开发）
```

### shared/brand.css（品牌基础）

包含：
- CSS 变量（品牌色、背景、边框、文字、渐变、过渡）
- 基础重置（*, body）
- 容器样式（.container）

### shared/components.css（公共组件）

包含：
- 按钮系统（.btn, .btn-back, .btn-next, .btn-restart）
- 选项卡片（.option-btn 及子元素）
- 输入框（.input, .weight-input）
- Toast 提示（.toast）

### 使用方式

各模块在 `index.html` 中按顺序引用：
```html
<link rel="stylesheet" href="../shared/brand.css">
<link rel="stylesheet" href="../shared/components.css">
<link rel="stylesheet" href="style.css">
```

**CSS 优先级规则**：
- 共享样式提供默认样式
- 模块专属样式可覆盖共享样式（使用更具体的选择器）
- 加载顺序：brand.css → components.css → style.css

### shared/utils.js（共享工具函数，V1.2 新增）

包含：
- 数值处理：`roundToHalf()`（取整到 0.5）、`formatPacks()`（包数格式化）
- 环境判断：`isMobile()`（UA 判断移动设备）
- DOM 工具：`toggleSelection()`（选项卡片选中切换）
- 函数控制：`debounce()`（防抖，为 plan/ 输入场景备用）

**JS 加载方式**（普通 script + defer，无构建工具）：
```html
<script src="../shared/utils.js" defer></script>
<script src="script.js" defer></script>
```
- defer 保证按顺序执行：utils.js 先于模块 script.js
- 函数为全局函数，模块内直接调用（函数名不冲突即可）
- 提取原则：仅提取**不依赖模块内部状态**的通用函数（如 `getPetConfig()` 依赖 calories 的 state，不提取）

### 优势

- ✅ **品牌一致性**：所有模块共享品牌变量和基础样式
- ✅ **代码复用**：公共组件和工具函数无需重复编写
- ✅ **易于维护**：品牌升级只需修改 shared/ 目录
- ✅ **模块独立**：各模块可灵活覆盖共享样式

---

## 整体规划（Roadmap）

### 优先级排序

| 优先级 | 功能 | 状态 | 说明 |
|--------|------|------|------|
| **P0** | 订阅计划（plan/） | 🔜 待开发 | 基于热量计算包数，提供订阅分配和算价 |
| **P1** | 官网主页 | 📋 待规划 | 根目录 index.html，衔接各模块入口 |
| **P2** | 用户登录系统 | 📋 待规划 | 微信登录 + 手机号登录 |
| **P3** | 微信小程序集成 | ❓ 待评估 | 继承登录态和数据（技术可行性待评估） |
| **P4** | 食谱配方功能 | 💭 待定 | 需求待明确 |

### 技术规划

**用户登录方案**：
- 100% 使用微信登录 / 手机号登录
- 小程序跳转网页：尝试继承登录态（UnionID 机制）
- 降级方案：网页和小程序分开登录，以手机号关联合并后台数据

**后端需求**：
- 用户数据存储服务（用户信息、宠物档案、订阅记录）
- 微信开放平台对接（UnionID、OAuth2.0）
- 支付接口（订阅付费，如需要）

---

## 待办功能

### 1. 订阅计划模块开发（P0 - 下次优先）
- 范围：新建 plan/ 模块
- 功能：订阅分配、口味组合、价格计算
- 状态：**待开发**

### 2. 官网主页（P1）
- 范围：根目录 index.html
- 功能：品牌展示 + 各模块入口导航
- 状态：**待规划**

### 3. 用户登录系统（P2）
- 范围：shared/ 或独立模块
- 功能：微信登录、手机号登录、用户数据管理
- 状态：**待规划**

### 4. 微信小程序集成（P3）
- 范围：跨平台登录态同步
- 方案：UnionID 机制 或 手机号关联
- 状态：**待评估**

### 5. 食谱配方功能（P4）
- 范围：待定
- 功能：待定
- 状态：**待定**

---

## 最近修改记录

| 时间 | 内容 |
|------|------|
| 2026/09/08 | V1.2 共享 JS 工具提取：创建 shared/utils.js（5 个函数），calories/script.js 精简（774→758 行），测试通过（7 断言 + 手动全流程）；补打历史 tag（v1.0/v1.1/calories-v3.22） |
| 2026/09/07 | **会话结束总结**：完成 V1.1 CSS 架构重构，测试通过，待办：提取共享 JS 工具函数 |
| 2026/09/07 | V1.1 CSS 架构重构（方案 C）：创建 shared/ 目录，提取品牌变量和公共组件，重构 calories/style.css（1141→872 行，-24%） |
| 2026/09/07 | 更新整体规划（Roadmap）：订阅计划（P0）、官网主页（P1）、用户登录（P2）、小程序集成（P3）、食谱功能（P4） |
| 2026/09/07 | V1.0 Monorepo 初始化，创建 ukioki 品牌官网结构，包含热量计算器（V3.22） |
