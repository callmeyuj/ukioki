# 版本记录

---

## V3.22 — 2026/09/01

### 热量缺口调整（0.9 → 0.85）

**script.js：**
- `CALORIE_DEFICIT_RATIO` 从 0.9 调整为 0.85（15% 热量缺口，原为 10%）
- 影响范围：喂食量建议表 + 自定义热量输入（犬猫通用）

**index.html：**
- 自定义热量区提示文字同步更新：`MER × 0.90` → `MER × 0.85`

**核心公式零改动：** RER/MER 公式、系数推导链、步骤流转保持不变

---

## V3.21 — 2026/08/31

### 犬类产品数据更新

**script.js：**
- 新增犬类「鸭肉冬瓜梨」产品（120g / 130 kcal），位于珍萃鹿肉与平均数据之间
- 犬类「嫩牛牡蛎」更名为「牛肉牡蛎」
- 犬类「野牧鹿肉」更名为「珍萃鹿肉」
- 犬类「平均数据」热量从 142 kcal 更新为 140 kcal（5 个口味的平均值）

**CLAUDE.md：**
- 产品数据表同步更新
- 新增文档说明章节（CLAUDE.md / CHANGELOG.md / harness.md 定位对照）
- 新增模块代码地图（index.html / script.js / style.css 模块结构）
- 更新 Git Remotes 状态（origin / test-repo 当前版本）

**harness.md：**
- 第九条新增 CLAUDE.md 核心内容更新规则
- 第十条新增会话结束 Git 状态同步规则
- 新增第十一条 Git 操作流程规范

**文件清理：**
- 删除 prompt.md（空文件）
- 删除 script.md（过时需求文档）
- 删除 test-cases.md（过时测试用例）

---

## V3.3 — 2026/07/16（已退回）

> ⚠️ **注意**：此版本曾开发完成并推送至 test-repo，但于 2026/08/31 本地回退至 V3.2。
> 代码改动已撤销，仅保留版本记录。

### 档案功能 + 全局紧凑化 + 历史详情内嵌

**新增功能：**
- 底部 Tab 栏：卡片式分段控制器风格（浅灰容器 + 白色选中卡片）
- 历史记录面板：按由近到远展示计算记录，支持单条删除和清空
- 记录卡片：展示宠物 emoji、体重、MER 值、日期
- 历史详情内嵌：点击记录不切 Tab，在历史面板内直接展示喂食量建议页
- 详情页包含：MER 值、品牌建议表、自定义热量输入、分享/商城按钮
- 详情页右上角 ✕ 关闭，返回历史列表
- localStorage 持久化，最多 50 条

**记录逻辑：**
- 仅在完成所有步骤（step 8 → step 9）时保存一条记录
- 从历史记录查看详情不会重复保存

**全局紧凑化（一屏显示）：**
- body padding 去除，container 全屏无圆角
- header/progress/content/各组件间距全面缩减
- 字号整体下调（标题 16px、按钮 14px、详情 12-13px）
- 移动端同步适配

---

## V3.2 — 2026/07/03

### 快照卡片优化 + CSS清理 + 热量缺口调整

- **script.js**：`CALORIE_DEFICIT_RATIO` 从 0.95 调整为 0.9（10% 热量缺口）
- **style.css**：快照卡片颜色统一为品牌绿，移除 15 个未使用 CSS 变量
- **index.html**：快照卡片占位值改为 0

---

## V3.1 — 2026/06/29

### 代码优化重构（核心计算链路零改动）

**script.js（793 → 767 行）：**
- 新增 `toggleSelection()` 公共函数，消除 pet-card / option-btn 选中逻辑重复
- 新增 `handleShare()` 独立函数，从事件委托中提取 40 行分享逻辑
- 新增 `showPreviewFallback()` 消除重复的预览+toast 调用
- `nextStep()` / `prevStep()` 合并为 `navigateStep(offset)`
- `getStepFlow()` 改为通用遍历，读取 STEP_CONFIGS 的 `condition` 字段
- 步骤 7（孕哺）条件从硬编码改为配置化 `condition: (s) => ...`
- 犬猫幼犬/幼猫 age 值统一为 `young`（原犬 `kid` / 猫 `young`）
- DOM 缓存：btnNext0-8 自动生成；进度条节点缓存到 `progressNodes[]`
- 事件委托从 async 恢复普通函数（async 移入 handleShare 内部）

**style.css（1286 → 1157 行，-129 行）：**
- 死代码清理：`.text-gradient-brand`、`.input-suffix`、`.btn-back-result`、`.result-animate`、`.pet-icon-large`
- CSS 变量精简：删除 `--brand-yellow-hover-start` / `--brand-yellow-hover-end`，新增 `--brand-teal`
- `.btn-share` / `.btn-shop` 公共样式合并（touch-action, tap-highlight, :active 缩放）
- 快照卡片 12 处硬编码颜色替换为 CSS 变量（`--brand-dark`, `--brand-yellow`, `--text-gray`, `--text-unit`, `--brand-teal`）
- 结果页阶梯动画 4 条规则合并为 `:is()` 单行

**index.html：**
- 无障碍增强：输入框添加 `inputmode` + `aria-label`，按钮补充 `aria-label`

**核心公式零改动：** RER = 70 × weight^0.75, MER = RER × coeff

---

## V3.0 — 2026/06/29

### 分享功能 + 代码优化

**新增功能：**
- 分享弹窗：快照卡片 + 保存图片 + 转发好友
- 快照卡片：品牌信息 + 宠物 MER + 喂食包数 + 二维码
- 保存图片：桌面端直接下载，移动端长按保存
- 转发好友：Web Share API 拉起微信/QQ 等 App
- 图片预览弹窗：移动端生成图片后全屏预览
- 二维码：使用 api.qrserver.com 生成 calories.ukioki.com 链接

**喂食量页优化：**
- 重新计算按钮：右上角定位，SVG 白底黑箭头图标
- 分享结果按钮：底部按钮行
- 按钮点击响应优化：`:active` transition 缩短至 0.05s
- 分享按钮：`z-index` 提升，避免点击不灵敏

**代码优化：**
- 删除 draft.html 测试文件
- script.js 重构：提取 `captureSnapshot()`、`convertImagesToBase64()` 等公共函数，消除重复代码
- DOM 缓存扩展：分享相关元素统一缓存
- 弹窗关闭按钮：标题居中 + 右上角关闭
- 移动端点击高亮：`-webkit-tap-highlight-color: transparent`

**核心链路零改动：** RER/MER 公式、系数推导链、步骤流转保持不变

---

## V2.1 — 2026/06/28

### 喂食量页按钮调整 + harness 规范更新
- 左按钮：返回结果 → 🔄 重新计算
- 右按钮：🔄 重新计算 → 🛒 前往商城（跳转至商城页面）
- CSS: `.btn` 添加 `text-decoration: none` 支持 `<a>` 标签样式
- harness.md 第六条新增豁免项：仅调整参数不算修改，不计入版本迭代

---

## V2.0 — 2026/06/28

### 代码结构大重构（零功能变更，纯架构优化）

**index.html（229 → 174 行，-55 行）：**
- 移除 step-4~8 的 HTML 骨架，改为 JS 动态生成
- 移除萤火虫 span 硬编码，改为 JS 动态生成
- 添加 `id="feedingBtnWrapper"` 用于 JS 萤火虫容器

**script.js（576 → 609 行，结构优化）：**
- 新增 `initDynamicSteps()` — 动态生成步骤 4-8
- 新增 `initFireflies()` — 动态生成萤火虫元素
- 新增 `createPostSurgeryRule()` — 规则工厂函数，消除犬猫术后规则重复
- 移除 `STEP_ELEMENT_IDS` — 不再需要手动映射 DOM ID
- `els` → `dom` 重命名，语义更清晰
- `renderStepOptions()` 改用 DOM 查询替代缓存 ID
- Step 8 猫配置用 getter 复用犬配置，消除重复

**style.css（831 → 854 行，变量化 + 公共类）：**
- 补充 CSS 变量：品牌色扩展、间距系统、圆角系统、过渡时间
- 提取 `.text-gradient-brand` 公共类（渐变文字效果复用）
- 提取 `.input-suffix` 公共类（输入框单位定位复用）
- 萤火虫系统用 CSS 自定义属性精简（`--ff-size`, `--ff-path`, `--ff-dur` 等）
- 硬编码颜色全部替换为 CSS 变量
- 新增 `prefers-reduced-motion` 无障碍适配

**延展性提升：**
- 新增步骤只需在 `STEP_CONFIGS` 中添加配置，无需修改 HTML
- 新增萤火虫只需添加一行 CSS 配置
- 规则工厂函数支持灵活扩展术后规则
- CSS 变量系统完整，便于主题扩展

---

## V1.4 — 2026/06/27

### 三核心文件代码优化
- **script.js**：提取 `PET_CONFIG`、`POST_SURGERY_OPTIONS` 常量，消除重复代码；步骤 5-8 全部配置化；统一 `const/let`；新增 `getPetConfig()` 工具函数
- **index.html**：移除 `.header-text` 冗余包裹层；步骤 5-8 改为空容器由 JS 动态渲染；添加 HTML 注释分区
- **style.css**：新增 4 个 CSS 变量（`--bg-card-selected`、`--bg-section-warm`、`--bg-section-cool`、`--border-accent`）；合并 `.btn-back`/`.btn-back-result` 和 `.btn-next`/`.btn-restart` 公共样式；全局替换硬编码色值
- 零功能变更，纯代码重构

---

## V1.34 — 2026/06/27

### 推导过程 & 性别选项优化
- **推导明细精简**：仅展示最终系数推导结果，去除步骤前缀，字体对齐 result-label 风格
- **展开/收起滚动优化**：收起延迟增至 500ms 等待折叠动画完成；收起锚点改为 header-icon
- **性别 emoji 更换**：♂ → 💪，♀ → 🎀，修复 iOS 上符号与文字错位问题
- **选项按钮对齐**：align-items 改为 center，emoji 与文案垂直居中

---

## V1.33 — 2026/06/27

### 交互流畅性优化
- **入场动画**：结果页和喂食量页内容阶梯式淡入（fadeInUp），层次感更强
- **按压反馈**：按钮、选项卡片、宠物卡片添加 `:active` 缩放效果
- **平滑滚动**：全局 `scroll-behavior: smooth` + 移动端惯性滚动
- **推导过程展开优化**：动画时长增至 0.5s，透明度渐变更舒展；展开后自动滚动至「查看喂食量」按钮，收起后回到 header
- **结果页紧凑化**：图标、间距、详情表、推导区 padding 全面收紧
- **喂食量页紧凑化**：MER 摘要、自定义输入、品牌建议表间距压缩
- **自定义输入优化**：「千卡/份」文字不拦截点击，输入框全域可触发键盘

---

## V1.3 — 2026/06/27

### 代码优化：精简 + 扩展性提升
- **CSS 变量化**：提取 12 个品牌色变量 + 6 个渐变变量，替换全文 50+ 处硬编码色值
- **死代码清理**：删除未使用的 `.result-formula`（23行）、`.header p` 等
- **DOM 缓存**：新增 `els` 对象统一缓存，减少 30+ 次重复 DOM 查询
- **步骤 8 动态化**：术后恢复期选项移入 `STEP_CONFIGS`，HTML 改为空容器
- **btn-arrow 伪元素化**：17 个冗余 `<span>` 移除，改用 CSS `::after` / `::before`
- **`restart()` 系统化**：批量 `querySelectorAll` 替代逐个手动重置
- **`configureStep` 简化**：硬编码步骤列表改为 `getStepKey() !== null` 判断
- 核心计算链路（RER/MER 公式、系数推导链、步骤流转）零改动

---

## V1.2 — 2026/06/27

### 新增喂食量计算功能
- 结果页新增「查看喂食量」按钮，跳转至喂食量页面
- 新增 uki oki 品牌鲜食喂食建议表（犬/猫各 5 个产品）
- 计算公式：建议包数 = MER × 0.92 ÷ 单包热量
- 包数以 0.5 为最小单位四舍五入
- 自定义热量输入实时计算
- 喂食量页面隐藏进度条，新增返回结果 + 重新计算按钮

**犬粮产品（120g/包）：** 鸡肉鳕鱼 121kcal | 猪肉蓝莓 149kcal | 嫩牛牡蛎 144kcal | 野牧鹿肉 154kcal | 平均 142kcal

**猫粮产品（100g/包）：** 鸡肉鳕鱼 107kcal | 猪肉蓝莓 111kcal | 嫩牛牡蛎 127kcal | 野牧鹿肉 132kcal | 平均 119kcal

---

## V1.0 — 2026/06/26

### 初始版本发布
- 支持犬/猫每日摄入卡路里计算
- 基于 RER × MER 系数公式
- 分步引导式交互流程（宠物类型 → 体重 → 性别 → 绝育 → 运动/户外 → 体型 → 年龄 → 孕哺 → 术后 → 结果）
- 支持犬猫不同系数推导链

---

## V1.1 — 2026/06/26

### 项目规范优化
- 修复 index.html Git 合并冲突
- 重写 harness.md 迭代行为规范（9 条规则）
- 新增 CHANGELOG.md 版本记录文件

---

## V1.11 — 2026/06/26

### 体型选项视觉优化
- 体型选择步骤增加 emoji + 视觉化描述文字
- 犬类：🐷肥胖 / 🐶超重 / 🐕标准 / 🦮偏瘦
- 猫类：🐷肥胖 / 🐈标准 / 🐈‍⬛偏瘦
- 新增描述文字样式（小号字体、灰色）

---

## V1.12 — 2026/06/26

### 移动端体型选项布局优化
- 修复移动端选项文字换行不美观问题
- 用 `option-label` 包裹标题和描述，布局更整齐
- 圆点对齐标题顶部
- 优化选项按钮垂直对齐方式

---
