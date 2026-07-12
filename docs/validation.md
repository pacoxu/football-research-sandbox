# 数据校验脚本

更新时间：2026-07-12

`scripts/validate-data.mjs` 是当前数据变更的第一道程序化检查。运行方式：

```bash
npm run validate-data
```

成功时会输出类似：

```text
Validated 186 players, 13 tournaments, 9 projects.
```

## 校验链路

```mermaid
flowchart LR
  Raw["data/raw/**"] --> Loader["loadDataset()"]
  Loader --> TournamentStats["合并 tournament statistics"]
  TournamentStats --> Names["补 names"]
  Names --> Market["合并 player-market-values"]
  Market --> Validate["validateData()"]
  Validate --> Result["通过或抛出第一处错误"]
```

校验会通过 `scripts/lib/data-loader.mjs` 读取所有 raw JSON，所以它检查的是 loader 合并后的数据，而不是单个文件的孤立结构。

## 已校验内容

球员：

- 必填字段：`id`、`name`、`local_name`、`names`、`country`、`birth_date`、`age_band`、`primary_position`、`registration_club`、`training_pathway`、`focus_tags`、`tournament_participation`、`external_links`、`verification`。
- `birth_date` 和核验日期格式必须是 `YYYY-MM-DD`。
- 多语言姓名块必须包含 `zh`、`en`、`native`，日本球员需 `ja`，韩国球员需 `ko`。
- `registration_club.name` 和 `registration_club.country` 必须是字符串。
- `training_pathway` 不能为空，每一步至少有 `stage_label`、`organization`、`country`。
- `external_links` 不能为空，且每条必须有合法 `type`、`label`、`http/https url`。
- `source_layers` 如存在，必须是数组；每条需有合法 `type`、`label`、`url`、`checked_at`、`confidence`、`fields` 和 `claim`。
- 组织类型、母组织、合作学校和路径竞赛 ID 必须匹配统一枚举与日韩体系数据。
- 日本/韩国 U17、U23 四队必须各 23 人，合计 92 人；每人恰有一条 AFC 报名来源。
- 固定 16 名深度样本必须有至少一条不同于 AFC PDF 的独立官方来源；组织来源不得复用 `assets.the-afc.com` URL。
- 根宝足球基地专题必须保持七个代际、26 名代表球员；每名球员都要有合法 `current_status`、核查日期、可信度和现状来源，1314 梯队需保留当前项目状态。
- `tournament_participation[].competition_id` 如存在，必须能对应 `data/raw/tournaments.json`。
- `squad_status` 必须来自允许枚举。
- `verification.status` 必须来自允许枚举，`notes` 必填。
- `verification.evidence` 如存在，需包含字段、claim、来源标签、来源 URL 和核验日期。
- `player.id` 不得重复。
- `birth_date + 标准化姓名` 不得与另一球员重复，用于发现同一球员跨文件重复建档。
- `league_system_override` 必须是非空字符串。
- `overseas_bucket_override` 必须来自 `overseas-history.json` 的 `bucket_definition`。
- `market_value` 如存在，需具备 status、checked_at、source、current/peak 点位结构。

赛事和专题：

- `tournaments[].last_checked` 必须是日期；`date_precision=exact` 时起止日期必填，`date_precision=tbc` 时起止日期必须同时为空。
- `overseas-history` 的 bucket、featured records、big five checklist 结构必须可用。
- `dossiers` 必须有 `id`、`name`、`last_reviewed`、`timeline`、`roster_views`，可选 link audit 和 search disambiguation 也会校验日期与数组结构。
- `tournament-archive` 必须有赛事 ID、名称、合法日期精度、来源链接、中国队比赛和关键球员数组；可选 `source_version`、`source_checked_at`、`source_conflict_note`、`competition_name_history` 如出现也会校验结构。
- 男足 U20 档案必须精确覆盖 1985—2025 的 21 届 FIFA 周期和 21 届 AFC 周期，并保留取消的 FIFA 2021、AFC 2020 以及两条 2027 future 记录。
- 已完赛 U20 届次的 `participants` 与 `final_draw.groups` 必须完整、无重复且集合严格一致；future/cancelled 届次允许部分名单、空冠军和待定/取消抽签。
- AFC 2027 资格赛必须保留 44 支唯一球队，且不得被写入决赛圈 `participants`。
- 中国 U20 2025 必须保留原始终报名 23 人、更新赛事名单 23 人和 1 次门将替换；四份官方 Match Summary 汇总需保持 20 人出场、61 人次、44 次首发、3960 分钟和 8 球，并与 loader 合并后的球员记录一致。
- `china-men-youth-coaches` 校验队伍周期、教练、集训节点、staff 和来源链接。
- `big-five-asian-coaches` 校验来源链接、scope count、教练战绩和 club records 加总。
- `asian-coaches` 校验教练 ID、统计口径、任期范围、`role_scope`、`competition_scope`、官方来源类型、核查日期和可选战绩。

## 允许枚举

`verification.status`：

- `verified`
- `mixed-source`
- `provisional`
- `needs-review`
- `conflict`
- `stale`
- `rejected`

`external_links.type`：

- `official`
- `club`
- `stats`
- `news`
- `wikipedia`
- `transfermarkt`
- `school`
- `profile`
- `match`
- `reference`

`squad_status`：

- `registered`
- `tracked`
- `pending-transfer`
- `called-up`
- `selected`
- `withdrawn`
- `unknown`
- `used`

`source_layers.type`：

- `afc-registration`
- `national-fa-profile`
- `club-academy-profile`
- `school-profile`
- `league-registration`
- `university-profile`
- `club-profile`

`registration_club.organization_type`：

- `high-school`
- `club-academy`
- `university`
- `professional-club`
- `military-service-club`
- `overseas-academy`

`source_layers.confidence`：

- `high`
- `medium`
- `low`

`tournament-archive.source_version.type`：

- `afc-final-registration`
- `afc-final-report`
- `afc-match-report`
- `afc-match-schedule`
- `afc-tournament-home`
- `afc-stats-archive`
- `fifa-report`
- `wikipedia-secondary`
- `secondary-stats`
- `news-secondary`

## 不校验内容

`validate-data` 不会判断：

- 外部链接是否仍能访问。
- 来源内容是否真的支持对应事实。
- Transfermarkt API 是否最新。
- 出场、进球、分钟是否和官方报告一致。
- `data/site/**` 是否和当前 raw 数据完全同步。
- `generated_at` 是否应该更新。
- 文本摘要是否中立、完整或无歧义。
- 未成年人隐私和版权风险是否已经人工审查。
- 所有历史名单是否达到全量覆盖。

这些仍需要 PR review、人工核验或后续自动化脚本。

## 常见失败处理

| 报错片段 | 含义 | 处理 |
| --- | --- | --- |
| `Missing player field` | 球员缺必填字段 | 对照同文件相邻记录补字段 |
| `Duplicate player id` | ID 重复 | 合并记录或重命名新 ID |
| `Possible duplicate player identity` | 同生日同姓名疑似重复 | 判断是否同一人；如是则合并 |
| `Unknown competition_id` | 球员引用了不存在的赛事 ID | 先补 `data/raw/tournaments.json` 或移除引用 |
| `Invalid external link type` | 链接类型不在枚举内 | 改用已有类型，必要时先扩展校验脚本和治理文档 |
| `Invalid squad_status` | 名单状态不在枚举内 | 使用治理文档定义的状态 |
| `Coach record does not add up` | 教练胜平负与场次不一致 | 修正 club record 或汇总 record |
| `Invalid source_version type` | 赛事档案来源版本类型不在枚举内 | 改用已有类型，必要时同步扩展校验脚本和治理文档 |

## 后续可做

- 增加 `npm run validate-generated`，比较 `data/site/**` 是否由当前 raw 生成。
- 增加 HTTP link checker，但默认只输出报告，不直接失败，以免临时网络波动阻塞数据 PR。
- 把 `source_links` 也统一到 typed source schema。
- 增加 JSON Schema，方便编辑器实时提示。
- 对 `generated_at`、`last_checked` 和 stale 规则增加自动报告。
