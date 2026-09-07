# uki oki 品牌官网 — 版本记录

> 本文件记录品牌级变更（新增模块、重构目录等）。模块级变更见各模块内的 CHANGELOG.md。

---

## V1.1 — 2026/09/07

### CSS 架构重构（方案 C：混合架构）

**新增 shared/ 目录：**
- `shared/brand.css`（82 行）：品牌变量、基础重置、容器样式
- `shared/components.css`（238 行）：公共组件（按钮、选项卡片、输入框、Toast）

**重构 calories/style.css：**
- 从 1141 行精简至 872 行（-269 行，-24%）
- 删除已提取到 shared/ 的样式
- 保留模块专属样式（头部、进度条、步骤、结果页、喂食量页、分享功能、快照卡片）

**更新 calories/index.html：**
- 添加 shared CSS 引用（brand.css → components.css → style.css）
- 确保 CSS 加载顺序正确（共享 → 专属）

**架构优势：**
- ✅ 品牌一致性：所有模块共享品牌变量和基础样式
- ✅ 代码复用：按钮、卡片、输入框等公共组件无需重复
- ✅ 易于维护：品牌升级只需修改 shared/ 目录
- ✅ 模块独立：各模块可覆盖共享样式，保持灵活性

**后续扩展：**
- `plan/` 模块开发时直接引用 shared/ CSS
- 官网主页开发时保持品牌一致性
- 未来新增模块自动受益

---

## V1.0 — 2026/09/07

### Monorepo 初始化

**目录结构：**
- 创建 `ukioki/` 品牌官网根目录
- 创建 `calories/` 子目录，包含热量计算器（从 Pet_Calories_Cal 迁移，V3.22）
- 创建 `plan/` 子目录（空骨架，待开发）

**文档体系：**
- 根目录 `CLAUDE.md`：品牌级概览（模块列表、版本、环境）
- 根目录 `harness.md`：品牌级迭代规范（适配 Monorepo）
- 根目录 `CHANGELOG.md`：本文件（品牌级版本记录）
- `calories/` 内保留原有文档（CLAUDE.md、harness.md、CHANGELOG.md）

**Git 配置：**
- 初始化 Git 仓库
- 配置 remote `ukioki`：`git@github.com:callmeyuj/ukioki.git`
- 部署目标：`www.ukioki.com`（腾讯云托管，域名已备案）

**模块状态：**
- 热量计算器（calories/）：V3.22（已上线，运行于 calories.ukioki.com）
- 订阅计划（plan/）：待开发

---

## 模块版本索引

| 模块 | 当前版本 | 最后更新 | CHANGELOG 位置 |
|------|----------|----------|----------------|
| 热量计算器 | V3.22 | 2026/09/01 | `calories/CHANGELOG.md` |
| 订阅计划 | — | — | `plan/CHANGELOG.md`（待创建） |
| 品牌官网 | V1.1 | 2026/09/07 | 本文件 |

---
