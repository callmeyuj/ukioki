# uki oki 品牌官网 — 版本记录

> 本文件记录品牌级变更（新增模块、重构目录等）。模块级变更见各模块内的 CHANGELOG.md。

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

---
