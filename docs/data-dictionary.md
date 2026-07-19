# 数据字典

更新时间：2026-07-18

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
| `data/raw/china-youth-development-coaches.json` | 中国基层、校园、足校、职业梯队与民间项目的具名青训教练样本。 | 是 |
| `data/raw/dossiers.json` | 专题档案，例如董路足球小将。 | 是 |
| `data/raw/player-name-overrides.json` | 球员姓名覆盖和展示修正。 | 是 |
| `data/raw/player-market-values.json` | 全量球员 Transfermarkt 覆盖状态、完整历史和独立替代来源序列。 | 是，通常由脚本辅助刷新 |
| `data/raw/youth-development-systems.json` | 日本、韩国青训/学校/大学体系、竞赛关系和年度快照。 | 是 |
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
| `registration_club` | 注册组织或有明确日期的赛事报名归属，包含 `name`、`country`，可含状态、快照日期、组织类型、母组织和合作学校。 |
| `training_pathway` | 训练、学校、俱乐部、国家队或项目路径数组。 |
| `focus_tags` | 页面筛选、专题和研究标签。 |
| `tournament_participation` | 赛事、集训、留洋或专题参与记录。 |
| `external_links` | 外部来源链接数组。 |
| `verification` | 核验状态、日期和说明。 |

可选字段包括 `height_cm`、`weight_kg`、`source_layers`、`league_system_override`、`overseas_bucket_override`、`overseas_status`、`market_value` 等。

### `overseas_status`

中国留洋相关球员使用顶层 `overseas_status` 解释当前状态；与留洋无关的球员不需要填写。

| 值 | 含义 | 是否进入当前留洋统计 |
| --- | --- | --- |
| `active-registered` | 当前有效海外注册。 | 是 |
| `pending-effective` | 转会已确认但尚未到生效日。 | 否 |
| `trial-watch` | 试训或明确关注线索，尚无正式注册。 | 否 |
| `returned` | 有可信海外经历，当前已回国内注册。 | 否 |
| `historical-only` | 退役或仅为历史研究保留的球员实体。 | 否 |

`historical-only` 只用于球员实体，不写入 `overseas-history.json` 的单段 `featured_records`。状态的来源与最近核查日期继续由 `verification`、`external_links` 和相关路径 / 参与记录承载。

## `registration_club`

| 字段 | 含义 |
| --- | --- |
| `name` | 注册俱乐部、学校队或赛事名单所记录的组织名。 |
| `country` | 俱乐部或组织所在国家/地区。 |
| `status` | 可选；`current` 表示有当前注册来源，`tournament-snapshot` 表示只确认赛事报名时点。旧记录缺少该字段时按 `current` 兼容处理。 |
| `as_of` | 可选 ISO 日期；`tournament-snapshot` 必填，用于明确赛事报名快照时点。 |
| `organization_type` | `high-school`、`club-academy`、`university`、`professional-club`、`military-service-club` 或 `overseas-academy`。 |
| `parent_organization` | 可选母俱乐部对象，包含 `name`、`country`；韩国职业梯队使用。 |
| `education_partner` | 可选合作高中对象，包含 `name`、`country`；不得覆盖当前注册组织。 |

没有较新的官方俱乐部或联赛注册来源时，赛事名单中的俱乐部必须标为 `tournament-snapshot`，页面显示“赛事报名归属”，不得称为当前俱乐部。不要把未来生效转会、试训、短训或媒体传闻写进 `registration_club`；这些应写在路径、参与记录或核验备注中。

## `training_pathway`

每个路径节点说明球员发展或核验链中的一个阶段。

| 字段 | 含义 |
| --- | --- |
| `stage_label` | 阶段名称。 |
| `organization` | 俱乐部、学校、国家队、项目或机构。 |
| `country` | 阶段所在国家/地区。 |
| `note` | 该阶段的来源背景、口径和限制。 |
| `organization_type` | 可选，沿用当前组织类型枚举。 |
| `competition_context_ids` | 可选，引用 `youth-development-systems.json` 中的竞赛 ID。 |
| `parent_organization`、`education_partner` | 可选，保留路径节点当时的俱乐部/教育双重语境。 |

## 日韩青训体系

`data/raw/youth-development-systems.json` 将稳定制度与年度快照分开：

| 字段 | 含义 |
| --- | --- |
| `systems[]` | 国家级体系条目，当前为日本、韩国。 |
| `registration_categories[]` | 年龄层、注册类别和允许组织类型。 |
| `competitions[]` | 稳定竞赛 ID、类型、适用组织、层级关系和官方来源。 |
| `stable_structure` | 不随单一赛季变化的制度说明。 |
| `annual_snapshot` | 可选赛季快照，例如 2026 队数；不当作永久规则。 |
| `source_links[]` | 官方来源、URL 和核查日期。 |

球员只能通过 `training_pathway[].competition_context_ids` 引用竞赛 ID。该引用表示培养环境，不自动断言球员在某赛季实际出场。

## 青训机构专题现状

`dossiers[].roster_views[].players[].current_status` 用于专题中的代表球员近况：

| 字段 | 含义 |
| --- | --- |
| `category` | `active-first-team`、`active-reserve`、`active-professional`、`retired-coach`、`youth-development` 或 `needs-review`。 |
| `organization`、`role` | 当前可核组织和球员/教练角色。 |
| `as_of` | 现状核查日期。 |
| `confidence` | `high`、`medium` 或 `low`。 |
| `source_label`、`source_url` | 当前状态的直接来源。 |

专题名单是代表性产出档案，不等同于基地完整毕业生名册。当前去向无法可靠确认时使用 `needs-review`，不得沿用过期俱乐部冒充现状。

## `tournament_participation`

该字段不只记录正式赛事，也可记录集训、留洋跟踪和专题参与，但必须用 `squad_status` 区分状态。

| 字段 | 含义 |
| --- | --- |
| `competition_id` | 可选，关联 `data/raw/tournaments.json` 中的赛事 ID。 |
| `label` | 可读名称。 |
| `team` | 代表队、俱乐部或项目名。 |
| `squad_status` | 名单状态，例如 `registered`、`called-up`、`tracked`、`pending-transfer`。 |
| `roster_status` | 可选的细分边界，例如实际赛事名单、赛前替补、被替换或后续集训；具体枚举由赛事 archive 的 `roster_boundary` 说明。 |
| `season` | 统计赛季；国内 2026 分赛事统计固定为 `2026`。 |
| `competition_level` | 赛事层级，例如成年顶级联赛、成年杯赛或 U21 青年联赛；不得跨层级汇总。 |
| `appearances`、`starts`、`substitute_appearances` | 出场、首发、替补出场；已确认未出场写 `0`，未知或未完成逐场复核才用 `null`。 |
| `goals`、`minutes` | 正式比赛进球和标准分钟；点球大战进球不计入，是否计补时由赛事统计说明约定。 |
| `yellow_cards`、`red_cards` | 黄牌、红牌汇总；已确认无牌写 `0`。 |
| `stats_as_of` | 本条累计统计的比赛截止日。 |
| `statistics_status` | `complete` 表示截止日内逐场完整，`partial` 表示只有部分字段或比赛得到确认。 |
| `source_checked_at` | 统计来源最后核查日。 |
| `statistics_sources` | 直接支撑统计的比赛报告或统计页 URL 数组。 |
| `note` | 统计范围和来源说明。 |

部分赛事会在 `tournament-archive` 集中维护逐人统计，并由 loader 合并到此字段。中国 U20 2025 和中国 U23 2026 均采用这一方式，避免在每个球员文件中重复维护逐场汇总。

`tournament-archive.china_matches[].china_lineup` 保存首发和替补。替补项可包含 `minute`、`display_minute`、`replaced_player_id` 和 `replaced_player`；未使用替补以 `status: "unused"` 明示。`china_cards` 的事件类型只使用 `yellow`、`second-yellow-red`、`straight-red`，每条必须包含球员 ID、球员名和分钟。

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

`data/raw/tournament-archive.json` 维护更细的历史赛事、赛果、中国队比赛、关键球员、`source_version` 和 `source_conflict_note`。男子 U20 谱系另使用以下统一字段：

| 字段 | 含义 |
| --- | --- |
| `status` | `completed`、`upcoming` 或 `cancelled`；取消届冠军、亚军为空。 |
| `date_range`、`date_precision` | 精确日期使用 `exact`；官方日期未公布时使用 `tbc`，且开始、结束日期均为 `null`。 |
| `participants.status` | `complete`、`partial` 或 `cancelled-snapshot`。 |
| `participants.teams[]` | 决赛圈球队；包含 `team`、`entry_status`，可选 `qualification_route`、`confirmed_at`。 |
| `participants.teams[].entry_status` | `host`、`qualified` 或 `participant`。主办身份不自动改写为资格赛晋级。 |
| `final_draw.status` | `complete`、`pending` 或 `cancelled`。 |
| `final_draw.groups[]` | 决赛圈小组，每组包含 `name` 和 `teams`；必须与完整参赛队全集一致且不得重复。 |
| `qualifiers[]` | 可选资格赛层，包含阶段、日期、赛制说明、赛区主办地与资格赛分组，不得混入决赛圈 `participants`。 |
| `source_checked_at` | 本届信息的最近核查日期。2027 未来赛事的当前截点为 `2026-07-12`。 |
| `source_version` | 字段级来源版本，说明哪些来源支撑主办、日期、赛果、参赛队和抽签。 |

`china_status` 允许 `qualification-cancelled`，用于资格路径或赛事因取消而中止的届次。旧届官方资料不足时，可用 RSSSF、赛事技术报告或 Wikipedia 作二级交叉来源，但需保留来源类型和核查日期。

## 留洋历史

`data/raw/overseas-history.json` 由留洋分层、国家记录和独立试训记录组成：

| 字段 | 含义 |
| --- | --- |
| `bucket_definition` | 留洋层级定义，例如五大联赛、欧洲其他、亚洲其他、美洲其他等。 |
| `countries` | 各国家/地区的留洋摘要、featured records 和 checklist。 |
| `countries[].historical_trial_records` | 有可靠来源的历史海外训练/试训事件；必须明确 `signed`、`registration_changed`，不得混入正式留洋人数。 |

留洋历史记录要区分正式一线队联赛、杯赛、梯队、低级别联赛和纯青训经历，不混算。

历史试训记录使用 `historical-trial-only`，只说明曾发生训练或试训，不代表签约、注册或正式比赛经历。若俱乐部与国内报道对“训练/试训”用词不同，应在 `summary` 保留口径差异。

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

## 中国青训教练

`data/raw/china-youth-development-coaches.json` 与国字号青年队教练、亚洲一线队主教练分开维护。首批覆盖石门五小、王楚、根宝基地、东北路小学、山东泰山/鲁能足校体系、恒大足校、清华附中、中国足球小将和阿勒泰地区体校。

| 字段 | 含义 |
| --- | --- |
| `organization` | 教练对应的学校、足校、职业梯队、独立基地、地区体校或民间项目；`type` 明确组织类别。 |
| `role`、`age_bands` | 公开可核的训练职责和年龄段，不从单场带队自动外推为全校总教练。 |
| `period` | 年份任期或赛季快照；`confirmed-2025` 表示只能确认该年度，不等于持续现任。 |
| `methodology_tags` | 来源能够支持的培养特征，用于检索，不作为主观教练排名。 |
| `source_links[].claim` | 逐条说明来源支撑的人名、岗位、成果或任期事实。 |
| `verification` | 核验状态、日期和边界；模糊的“某教练”称呼不得替代全名。 |

## 生成字段

`data/site/**` 由脚本生成，不应手工编辑。`data/site/overview.json` 的 `generated_at` 当前由 `scripts/build-site-data.mjs` 中常量控制，不是构建时自动日期。只改文档时不更新 `generated_at`。
## UEFA Youth League historical season index

`data/raw/uefa-youth-league.json` 中的 `historical_season_index` 保存青年欧冠赛季级历史档案。它与用于页面深度展示的 `seasons` 分开，允许先完成历史索引，再分阶段补齐完整参赛队和逐场比赛。

2010—2013 的赛事边界单独保存在 `lineage`，不混入正式赛季索引：`prehistory` 中的 `precursor-event` 表示 2010 UEFA Under-18 Challenge 前身试验赛，`not-established` 表示 2010/11—2012/13 赛事尚未创办，`launch-approved` 表示 2012 年获批且首届定于 2013/14。`not-established` 不得填写参赛队、比赛或冠亚军，也不能与 `cancelled`（赛事已经存在但当季取消）混用。

| `lineage` 字段 | 类型 | 说明 |
| --- | --- | --- |
| `coverage_start_year` / `coverage_end_season` | integer / string | 当前谱系覆盖边界为 2010 至 2022/23。 |
| `first_official_season` | string | 首个正式 UEFA Youth League 赛季，固定为 `2013/14`。 |
| `boundary_note` | localized text | 解释前身试验赛、未创办周期与正式赛季的统计边界。 |
| `prehistory` | object[] | 按时间保存前身事件、未创办周期和赛事获批节点，并逐条引用 UEFA 官方来源。 |

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` / `label` | string | 内部赛季 ID 使用 `YYYY-YY`，展示名使用 UEFA 的 `YYYY/YY`。 |
| `status` | enum | `completed`、因赛历中断而延期完成的 `completed-delayed`，或未进行比赛的 `cancelled`。 |
| `start_date` / `end_date` | date \| null | 已举办赛季使用 ISO 日期；取消且未开赛的赛季必须为 `null`。 |
| `entrant_count` | integer | 已举办赛季的参赛规模；取消赛季可记录官方抽签规模，但须在冲突说明中注明并非实际出赛数。 |
| `paths` | string[] | 当季资格路径，如欧冠路径和国内青年冠军路径。 |
| `format_summary` | localized text | 当季赛制、路径和特殊赛历说明。 |
| `champion` / `runner_up` | string \| null | 取消赛季必须为 `null`。 |
| `semi_finalists` | string[] | 两支止步半决赛的球队；取消赛季为空数组。 |
| `top_scorers` | object[] | UEFA 官方赛季最佳射手及俱乐部、进球数；并列时全部保留，来源冲突写入 `source_conflict_note`。 |
| `final` | object \| null | 决赛日期、场地、城市、国家、双方与比分；取消赛季为 `null`。 |
| `coverage` | object | 分别标记完整参赛队、淘汰赛和全量逐场比赛是否已采集。 |
| `source_version` | string | 本条采用的 UEFA 页面或公告版本说明。 |
| `source_checked_at` | date | 最近核查日期。 |
| `source_conflict_note` | string | 命名、延期、场地例外、取消赛季参赛规模等口径说明；无冲突时也明确记录。 |
| `source_ids` | string[] | 指向同文件 `sources` 中的官方来源。 |
