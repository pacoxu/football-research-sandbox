# Roadmap

更新时间：2026-06-28

本路线图用于把项目后续工作从零散补数据，收敛成可排期、可验收、可拆 issue 的维护计划。详细覆盖状态见 `docs/coverage-matrix.md`，研究补采样本见 `research-collection-outline-2026-06-27.md`。

## 当前基线

- 球员库：171 人。
- 国家/地区：China PR、Japan、Korea Republic、Uzbekistan。
- 主要页面数据：`data/site/players.json`、`data/site/overview.json`。
- 主要维护入口：`data/raw/**`。
- 本地校验：`npm run validate-data`。

当前项目已经有可用的静态站点、球员聚合、赛事归档、留洋样本和专题档案。下一阶段的重点不是继续无序加人，而是把名单完整度、来源层级、状态字段和统计口径补齐。

## 阶段目标

| 阶段 | 目标 | 判断标准 |
| --- | --- | --- |
| P0 基础文档与边界 | 明确项目范围、数据授权、来源政策、生成链路和本地运行方式。 | 新维护者能知道哪些文件该改、哪些文件是生成物、哪些数据不是官方全量。 |
| P1 数据治理 | 统一 `verification.status`、`external_links.type`、`squad_status`、重复球员和过期复核规则。 | `npm run validate-data` 能覆盖关键结构问题；人工 review 有统一标准。 |
| P2 覆盖计划 | 建立领域覆盖矩阵和缺口清单。 | 每个模块都有状态、来源要求、完成标准和下一步 issue。 |
| P3 核心数据补齐 | 补中国 U 系列、当前留洋、中超青年和日韩 U 系列路径来源。 | 关键样本从“能展示”推进到“可复核、可比较、可持续更新”。 |
| P4 对照组与历史档案 | 扩亚洲对照组、FIFA/AFC 历史赛事、中国五大联赛长尾和亚洲教练扩展。 | 历史和区域对照能支撑研究问题，不再只依赖少数热门样本。 |

## 近期优先事项

| 优先级 | 工作项 | 目标产物 | 关联 |
| --- | --- | --- | --- |
| P3 | 中国 U20 2025 终报名和正赛技术统计 | `data/raw/players/china-u20-2025.json`，并补赛事参与统计 | [#13](https://github.com/starryjog/football-research-sandbox/issues/13) |
| P3 | 中国 U17 2026 终报名、后续集训、观察池边界 | roster flag 或等价字段，区分终报名、集训和观察池 | [#14](https://github.com/starryjog/football-research-sandbox/issues/14) |
| P3 | 当前中国留洋 `overseas_status` 模型 | 区分 active registered、pending effective、trial watch、returned、historical only | [#15](https://github.com/starryjog/football-research-sandbox/issues/15) |
| P3 | 日韩 U17/U23 俱乐部、学校、青训路径补源 | 为重点样本补 national-fa、club-academy、school/university 来源层级 | [#16](https://github.com/starryjog/football-research-sandbox/issues/16) |
| P4 | 亚洲其他国家 U17/U20/U23 对照组 | 澳大利亚、沙特、伊朗、卡塔尔、乌兹别克等核心样本池 | [#17](https://github.com/starryjog/football-research-sandbox/issues/17) |
| P4 | FIFA 中国参赛档案 | 2002 世界杯和早期 U16/U20 世界赛中国队档案 | [#18](https://github.com/starryjog/football-research-sandbox/issues/18) |
| P4 | AFC U 系列 `source_version` 字段 | 近期 3 届试点已记录 source version、source checked date、冲突说明和名称谱系；后续扩到余下历史届次 | [#19](https://github.com/starryjog/football-research-sandbox/issues/19) |
| P4 | 五大联赛之外的亚洲教练扩展 | 欧洲非五大、AFC 国家队、J/K/中超/西亚联赛教练样本 | [#20](https://github.com/starryjog/football-research-sandbox/issues/20) |

## 数据模型方向

近期应优先补这些结构化字段或等价口径：

- `overseas_status`：当前注册、未来生效、试训观察、已回流、历史样本。
- roster 边界字段：终报名、集训名单、观察池、专题名单、赛事平台名单。
- source layer：AFC/FIFA 基础源、国家足协、俱乐部青训、学校/大学、联赛注册、媒体线索。
- source version：PDF、页面、报告或数据库的版本、核验日期和冲突说明。
- 统计拆分：一线队联赛、杯赛、青年联赛、梯队、低级别联赛不混算。

字段落库前先在单个模块试点，确认页面、SQLite 和校验脚本是否需要同步调整。

## 发布与校验规则

每个数据类 PR 至少满足：

- 修改源数据时先改 `data/raw/**`。
- 运行 `npm run validate-data`。
- 如影响页面聚合，运行 `npm run build-data` 并 review `data/site/**`。
- SQLite 只作为本地生成物验证，不提交 `storage/youth-football.sqlite`。
- 资料冲突用 `verification.status` 和 notes 保留，不直接覆盖。
- 新增长期工作必须关联 issue，避免只留在一次提交里。

## 后续可做

- 为 `data/raw/**` 和 `data/site/**` 增加 JSON Schema。
- 增加 CI 生成物一致性检查，防止漏提交 `data/site/**`。
- 增加非阻塞死链检查报告。
- 给 `generated_at` 增加显式构建输入。
- 给 SQLite 增加 schema version，并拆出 market value 表。
- 建立每月复核节奏：当前注册 30 天，市场价值和现役教练 90 天，稳定历史记录 180 天。
