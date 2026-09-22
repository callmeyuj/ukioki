# uki oki 品牌官网 — 版本记录

> 本文件记录品牌级变更（新增模块、重构目录等）。模块级变更见各模块内的 CHANGELOG.md。

---

## V1.3 — 2026/09/22

### 跨模块架构优化（单一数据源 + 共享工具扩展）

**shared/utils.js（43 → 98 行，+55 行）新增 6 项共享资产：**

共享数据（建立单一数据源，消除 plan/ 和 calories/ 两份重复产品数据）：
- `PRODUCT_DATA`（Object.freeze）：犬猫口味列表，含 id/name/grams/kcal/price，猫价格暂为 null
- `PET_CONFIG`（Object.freeze）：宠物 icon/label（`{ dog: { icon: '🐶', label: '犬' }, ... }`）
- `getFlavors(petType)`：访问接口，封装数据结构
- `getAvgKcal(petType)`：动态算平均热量，口味增减时自动同步，无需维护单独常量

共享工具函数：
- `formatMoney(v)`：金额格式化，支持千位分隔符（`¥ 1,345.12`），修复 plan/ 原 `fmtMoney` 不支持千位符的缺陷
- `formatDate(date)`：日期格式化（`YYYY/MM/DD`），消除两个模块里的重复实现

**模块侧连锁更新：**

plan/script.js（-35 行）：
- 删除本地 `PRODUCT_DATA`（含未使用的 `avgKcal` 常量）
- `PRODUCT_DATA[petType].flavors` → `getFlavors(petType)`（8 处）
- `fmtMoney()` 本地定义删除，改用共享 `formatMoney()`（**修复千位符 bug**）
- 新增 `calcPriceSummary()` 提取公共价格计算，`renderPrice()` 和 `renderSnapshot()` 复用
- 日期格式化改用 `formatDate()`（2 处：`init()` + `renderSnapshot()`）
- `pet === 'dog' ? '犬' : '猫'` → `PET_CONFIG[petType].label`

calories/script.js（-6 行）：
- 删除本地 `PET_CONFIG` 和 `PRODUCT_DATA`（含平均行）
- `renderBrandSuggestions()` 改用 `getFlavors()` + 动态追加平均行（`getAvgKcal()`）
- 平均行 kcal 从硬编码 140/119 改为动态计算（`Math.round(139.6)` = 140，行为不变）

plan/style.css（-13 行）：
- 删除死代码：`.text-price`、`.snapshot-total-right`、`.snapshot-total .text-price`
- 删除重复 `.btn-back-link:hover` 规则
- 移除 `.snapshot-price-section span.price-actual-label` 等特异性补丁（根因 `:not()` 选择器已修，补丁冗余）

**版本影响：**
- plan/ V1.1 → V1.2（含 bug 修复 + 重构）
- calories/ V3.23 → V3.24（数据源迁移，行为零变化）

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
| 热量计算器 | V3.24 | 2026/09/22 | `calories/CHANGELOG.md` |
| 订阅计划 | V1.2 | 2026/09/22 | `plan/CHANGELOG.md` |
| 品牌官网 | V1.3 | 2026/09/22 | 本文件 |

---
