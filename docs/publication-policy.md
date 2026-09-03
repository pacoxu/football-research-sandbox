# 网站发布与字段边界

更新时间：2026-07-31

本文定义 GitHub 仓库、站点生成 JSON 和 GitHub Pages artifact 之间的公开边界。项目仓库本身是公开研究仓库；本文的“非站点发布”表示不再把维护或审计数据复制到 Pages，不表示这些内容在公开 GitHub 仓库中保密。

## 发布层级

| 层级 | 位置 | Pages 是否发布 | 用途 |
| --- | --- | --- | --- |
| 研究源数据 | `data/raw/**` | 否 | 手工维护、来源复核、冲突处理和生成输入。 |
| Schema | `data/schema/**` | 否 | 仓库内校验和开发工具使用。 |
| 站点数据 | `data/site/**` | 是 | 页面渲染使用的生成 JSON。 |
| 本地查询库 | `storage/**` | 否 | SQLite 分析和本地查询。 |
| 研究文档 | `docs/**` | 否 | GitHub 阅读和维护；后续可另建经过编辑的网站摘要。 |

Pages 构建必须通过 `scripts/stage-pages.mjs` 建立 artifact，不得直接复制整个 `data/**`。自动测试要求 artifact 的 `data/` 下只能出现 `site/`。

## 球员字段分类

### 站点公开事实

以下字段可以进入 `data/site/players.json`：

- 稳定 ID、多语言展示姓名、代表国家/地区和年龄段；
- `birth_date`、`birth_place`、`height_cm`、`weight_kg` 等有来源支持的事实；
- 注册组织、培养路径、赛事参与、来源链接、来源层和核验结论；
- 页面筛选所需标签、联赛和留洋状态覆盖字段；
- 身价日期序列、当前值、峰值和可访问的来源页面。

完整生日和身体数据目前保留在站点 JSON，是因为它们来自公开报名或球员资料，并用于实体区分、年龄计算和跨赛事对照；普通球员页面继续只显示出生年份，暂不主动聚合展示完整生日、身高和体重。若未来改变 UI，应单独 review 未成年球员的信息最小化影响。

### 仅限仓库审计

以下字段不得进入 `data/site/players.json`：

- `name_verification` 中的尝试过程、查询语言标签和未命中说明；
- 身价匹配的候选 URL、匹配字段和内部 lookup 结果；
- 身价刷新错误、提供方 API URL；
- Transfermarkt 内部俱乐部 ID 和赛季 ID。

这些数据继续保留在 `data/raw/**` 或 loader 内存数据中，供数据质量统计、同步排错和人工复核使用。已验证姓名的公开来源仍通过 `source_layers` 展示。

## Overview 与 Meta

`data/site/overview.json` 包含页面当前使用的专题、赛事、教练、留洋和研究故事数据，其中来源说明和口径边界属于公开研究内容。`data/site/meta.json` 可以公开聚合质量计数、缺失字段、来源等级和 freshness 摘要，但不应包含私密凭据或本地文件系统路径。

## 变更规则

- 新增站点球员顶层字段时，必须同步更新 `scripts/lib/public-site.mjs` 和发布契约测试。
- 审计字段默认不公开；需要公开时必须说明用户价值、来源和隐私影响。
- 修改 Pages artifact 内容时，必须运行 `npm test` 并检查 `tests/pages-publication.test.mjs`。
- 仓库公开并不等于第三方数据可自由再授权；外部复用仍须遵守原始来源和平台条款。
