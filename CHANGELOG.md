# uki oki 品牌官网 — 版本记录

> 本文件记录品牌级变更（新增模块、重构目录等）。模块级变更见各模块内的 CHANGELOG.md。

---

## V1.2 — 2026/09/08

### 共享 JS 工具提取（V1.1 CSS 提取的 JS 侧对应操作）

**新增 shared/utils.js（43 行）：**
- 数值处理：`roundToHalf()`（取整到 0.5）、`formatPacks()`（包数格式化）
- 环境判断：`isMobile()`（UA 判断移动设备）
- DOM 工具：`toggleSelection()`（选项卡片选中切换）
- 函数控制：`debounce()`（**新增备用**，原代码中不存在，为 plan/ 输入场景准备）

**重构 calories/script.js：**
- 从 774 行精简至 758 行（-16 行）
- 删除已提取到 shared/utils.js 的 4 个函数定义
- 保留 `getPetConfig()`（依赖模块内部 state，不符合提取原则）
- 所有调用点零改动（函数名不变，全局函数直接可用）

**更新 calories/index.html：**
- 添加 `<script src="../shared/utils.js" defer>` 引用（先于 script.js，defer 保证执行顺序）

**技术方案：**
- 普通 script 标签 + 全局函数，与现有无构建工具架构一致
- 不引入 ES Module / 打包工具，保持纯前端零依赖

**提取原则（沿用 CSS 方案 C 思路）：**
- 仅提取不依赖模块内部状态的通用函数
- 加载顺序：shared/utils.js → 模块 script.js

**测试：**
- 自动测试：7 个断言全部通过（roundToHalf x3、formatPacks x2、isMobile x1、debounce x1）
- 手动测试：calories 全流程验证通过（选项切换、MER 计算、喂食量表、自定义热量、分享功能）

**版本号说明：**
- 沿用 V1.1 先例：共享资源提取只升品牌级版本，calories 保持 V3.22 不变

**其他：**
- 补打历史版本 tag：`v1.0`、`v1.1`、`calories-v3.22`（此前仓库无任何 tag）

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
| 品牌官网 | V1.2 | 2026/09/08 | 本文件 |

---
