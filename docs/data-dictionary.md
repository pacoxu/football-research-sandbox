# 数据字典

更新时间：2026-07-11

本文解释仓库中核心 JSON 文件和常用字段。程序化校验范围见 `docs/validation.md`，数据流见 `docs/data-flow.md`，来源状态规则见 `docs/research/data-governance-and-quality-rules.md`。

## 文件分层

| 路径 | 角色 | 是否手工维护 |
| --- | --- | --- |
| `data/raw/players/*.json` | 球员源数据，按年龄段、国家或专题拆分。 | 是 |
| `data/raw/tournaments.json` | 当前页面使用的赛事卡片。 | 是 |
| `data/raw/tournament-archive.json` | 历史赛事、赛果、中国队档案和来源版本。 | 是 |
| `data/raw/overseas-history.json` | 中日韩留洋历史、分层 bucket 和 featured records。 | 是 |
| `data/raw/big-five-asian-coaches.json` | 五大联赛亚洲教练主表和边界说明。 | 是 |
| `data/raw/asian-coaches.json` | 五大联赛之外的亚洲主教练实体、任期、范围和官方来源。 | 是 |
| `data/raw/dossiers.json` | 专题档案，例如董路足球小将。 | 是 |
| `data/raw/player-name-overrides.json` | 球员姓名覆盖和展示修正。 | 是 |
| `data/raw/player-market-values.json` | 全量球员 Transfermarkt 覆盖状态、完整历史和独立替代来源序列。 | 是，通常由脚本辅助刷新 |
| `data/site/players.json` | 前端使用的球员聚合 JSON。 | 否，由脚本生成 |
| `data/site/overview.json` | 首页和专题页使用的聚合总览。 | 否，由脚本生成 |
| `storage/youth-football.sqlite` | 本地 SQLite 查询库。 | 否，不提交 |

## 球员记录

`data/raw/players/*.json` 每条球员记录至少包含：

| 字段 | 含义 |
| --- | --- |
| `id` | 稳定唯一 ID，通常包含国家、姓名和出生年份。 |
| `name` | 英文或拉丁字母展示名。 |
| `local_name` | 中文展示名或本地常用名。 |
| `names` | 多语言姓名块，至少有 `zh`、`en`、`native`；日本球员应有 `ja`，韩国球员应有 `ko`。 |
| `country` | 代表国家/地区或当前研究归属。 |
| `birth_date` | 出生日期，格式 `YYYY-MM-DD`。 |
| `age_band` | 年龄段，例如 `u17`、`u20`、`u21`、`u23`。 |
| `primary_position` | 主要位置。 |
| `registration_club` | 当前有效注册俱乐部，包含 `name` 和 `country`。 |
| `training_pathway` | 训练、学校、俱乐部、国家队或项目路径数组。 |
| `focus_tags` | 页面筛选、专题和研究标签。 |
| `tournament_participation` | 赛事、集训、留洋或专题参与记录。 |
| `external_links` | 外部来源链接数组。 |
| `verification` | 核验状态、日期和说明。 |

可选字段包括 `height_cm`、`weight_kg`、`source_layers`、`league_system_override`、`overseas_bucket_override`、`market_value` 等。

## `registration_club`

| 字段 | 含义 |
| --- | --- |
| `name` | 当前有效注册俱乐部、学校队或组织名。 |
| `country` | 俱乐部或组织所在国家/地区。 |

不要把未来生效转会、试训、短训或媒体传闻写进 `registration_club`。这些应写在路径、参与记录或核验备注中。

## `training_pathway`

每个路径节点说明球员发展或核验链中的一个阶段。

| 字段 | 含义 |
| --- | --- |
| `stage_label` | 阶段名称。 |
| `organization` | 俱乐部、学校、国家队、项目或机构。 |
| `country` | 阶段所在国家/地区。 |
| `note` | 该阶段的来源背景、口径和限制。 |

## `tournament_participation`

该字段不只记录正式赛事，也可记录集训、留洋跟踪和专题参与，但必须用 `squad_status` 区分状态。

| 字段 | 含义 |
| --- | --- |
| `competition_id` | 可选，关联 `data/raw/tournaments.json` 中的赛事 ID。 |
| `label` | 可读名称。 |
| `team` | 代表队、俱乐部或项目名。 |
| `squad_status` | 名单状态，例如 `registered`、`called-up`、`tracked`、`pending-transfer`。 |
| `appearances`、`goals`、`minutes` | 出场、进球、分钟；未知用 `null`。 |
| `note` | 统计范围和来源说明。 |

## `external_links`

每条来源链接必须包含：

| 字段 | 含义 |
| --- | --- |
| `type` | 来源类型，见治理文档枚举。 |
| `label` | 可读来源标题。 |
| `url` | `http` 或 `https` 链接。 |

常用类型包括 `official`、`club`、`stats`、`news`、`wikipedia`、`transfermarkt`、`school`、`profile`、`match`、`reference`。

## `verification`

| 字段 | 含义 |
| --- | --- |
| `status` | 核验状态，例如 `verified`、`mixed-source`、`provisional`、`needs-review`、`conflict`、`stale`、`rejected`。 |
| `last_checked` | 最近核查日期，格式 `YYYY-MM-DD`。 |
| `notes` | 证据链、冲突、降级使用或待核事项。 |
| `evidence` | 可选，结构化证据数组。 |

`verification.notes` 不应只写“已核实”，应说明哪些来源支撑哪些事实。

## 赛事记录

`data/raw/tournaments.json` 维护页面赛事卡片。

| 字段 | 含义 |
| --- | --- |
| `id` | 赛事 ID，被球员记录引用。 |
| `name`、`short_name` | 完整名称和短名称。 |
| `focus_level` | 页面关注层级。 |
| `status` | 赛事状态。 |
| `last_checked` | 最近核查日期。 |
| `date_range` | `start` 和 `end` 日期。 |
| `focus_teams` | 重点关注队伍。 |
| `headline` | 页面摘要。 |
| `notes` | 口径、赛果和边界说明。 |
| `sources` | 赛事来源列表。 |

`data/raw/tournament-archive.json` 维护更细的历史赛事、赛果、中国队比赛、关键球员、`source_version` 和 `source_conflict_note`。

## 留洋历史

`data/raw/overseas-history.json` 由两部分组成：

| 字段 | 含义 |
| --- | --- |
| `bucket_definition` | 留洋层级定义，例如五大联赛、欧洲其他、亚洲其他、美洲其他等。 |
| `countries` | 各国家/地区的留洋摘要、featured records 和 checklist。 |

留洋历史记录要区分正式一线队联赛、杯赛、梯队、低级别联赛和纯青训经历，不混算。

## 亚洲教练

`data/raw/big-five-asian-coaches.json` 维护五大联赛顶级联赛亚洲教练样本。

| 字段 | 含义 |
| --- | --- |
| `primary_scope_record` | 主口径汇总。 |
| `scope_counts` | AFC 主口径和广义边界统计。 |
| `coaches` | 教练明细。 |
| `excluded_or_boundary_notes` | 排除项和边界样本说明。 |

每名教练应说明 `association_confederation`、`counted_in`、`record_scope`、`top_flight_record`、`club_records`、`confidence` 和来源。

`data/raw/asian-coaches.json` 单独维护五大联赛之外的扩展样本。一个教练实体可挂多个 `stints`，避免国家队和俱乐部经历重复建档。

| 字段 | 含义 |
| --- | --- |
| `association`、`association_confederation` | 教练归属足协及洲足联，用于区分 AFC 主口径和 UEFA 地理边界项。 |
| `counted_in` | 统计口径，例如 `afc_member_association`、`geographic_broad`。 |
| `stints[].team_type` | `club`、`senior_national_team` 或 `youth_national_team`。 |
| `stints[].role_scope` | 俱乐部一线队、成年国家队或青年国家队。 |
| `stints[].competition_scope` | 欧洲非五大顶级联赛、AFC 成年/青年国家队、亚洲顶级联赛或 AFC 俱乐部赛事。 |
| `stints[].period` | 结构化开始和结束月份；现任时 `end` 为 `null`。 |
| `stints[].record` | 逐场战绩未核前允许为 `null`，任命事实不因缺战绩而阻塞。 |
| `stints[].source_links`、`verification` | 官方来源类型、核查日期和事实说明。 |

## 生成字段

`data/site/**` 由脚本生成，不应手工编辑。`data/site/overview.json` 的 `generated_at` 当前由 `scripts/build-site-data.mjs` 中常量控制，不是构建时自动日期。只改文档时不更新 `generated_at`。
