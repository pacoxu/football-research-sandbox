# 静态 JSON API 说明

更新时间：2026-07-19

项目发布到 GitHub Pages 后，页面会读取 `data/site/*.json`。这些文件可以被浏览器直接请求，但它们首先是站点内部静态数据文件，不是稳定承诺的公共 API。

## 可用文件

| 文件 | 用途 |
| --- | --- |
| `data/site/players.json` | 前端球员列表，已合并姓名覆盖和 Transfermarkt 身价快照。 |
| `data/site/overview.json` | 首页、赛事页、留洋页、专题页使用的聚合数据。 |
| `data/site/meta.json` | 数据生成日期、构建状态、样本声明、数据集质量摘要和目录记录质量。 |
| `data/site/world-cup-forecast.json` | 2030—2042 世界杯预测的元数据、假设、回测、概率、区间和来源。 |

本地预览时 URL 类似：

- `http://127.0.0.1:4173/data/site/players.json`
- `http://127.0.0.1:4173/data/site/overview.json`
- `http://127.0.0.1:4173/data/site/meta.json`
- `http://127.0.0.1:4173/data/site/world-cup-forecast.json`

GitHub Pages 上的 URL 取决于仓库 Pages 地址和路径。

## 稳定性边界

当前不承诺：

- 字段永久稳定。
- 版本化 API。
- 分页、过滤、排序参数。
- 向后兼容。
- SLA 或实时更新。
- 完整全量覆盖。

字段可能随着数据模型、页面需求和研究口径变化而调整。外部使用者应固定到 commit SHA 或自行缓存所需版本。

## 缓存与版本

`assets/app.js` 请求 JSON 时会追加 `_v=<SITE_DATA_VERSION>`，并设置 `cache: "no-store"`。这只是站点内部的缓存规避手段，不是 API 版本号。

如果外部使用这些 JSON：

- 不要依赖 `_v` 的含义。
- 应记录抓取日期、commit 或 Pages 部署版本。
- 对重要结论回查 `data/raw/**` 和原始来源链接。

## 元信息与 Schema

`meta.json` 的 `schema_version` 是数据中心元信息的版本，不是整个站点的兼容性承诺。仓库内生成文件保持 `build.status: "unstamped"`，commit 和构建时间为 `null`，从而保证本地生成可复现；Pages 部署在一致性检查后把真实 commit SHA、构建时间和 `deployed` 状态注入部署副本。

`data/schema/manifest.json` 登记 `loadDataset()` 消费的主要 raw 文件，以及 `players.json`、`overview.json`、`meta.json`。Schema 使用 JSON Schema Draft 2020-12；编辑器和外部工具可以据此检查结构，但跨记录引用、统计加总和其他业务约束仍以程序化 validator 为准。

## 授权与引用

`data/site/**` 包含由第三方来源整理的事实、链接、身价和名单信息。项目代码授权不等于数据再授权。

外部复用时：

- 保留来源链接和核验备注。
- 不要声称这些 JSON 是官方数据接口。
- 不要把站内样本数量解释为官方全量人数。
- 遵守原始来源、数据库、商标、隐私和平台条款。

## 推荐用途

适合：

- 本项目页面渲染。
- 本地分析和研究草稿。
- 低频读取、人工复核和引用入口。
- 对照 raw JSON 检查聚合结果。

不适合：

- 生产系统强依赖。
- 实时比分、实时转会或实时身价。
- 商业数据库同步。
- 自动化大规模抓取。
- 直接作为官方报名名单或官方留洋人数统计。

## 后续可做

- 只发布 `data/site/**`，不发布 `data/raw/**`，降低外部误用 raw 草稿的风险。
- 为外部使用者增加最小 changelog feed。
