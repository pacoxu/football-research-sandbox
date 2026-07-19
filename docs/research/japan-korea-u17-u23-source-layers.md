# 日韩青训体系与 U17/U23 球员来源层

更新时间：2026-07-12

本文件对应 [issue #16](https://github.com/starryjog/football-research-sandbox/issues/16)。实现范围包括体系介绍、四队 92 人基础映射、16 人深度来源、页面展示、SQLite 和强校验；不扩展到完整赛季赛果、逐场统计、女子足球或 U15 以下体系。

## 体系口径

- 日本：JFA 第2种同时包含高校足球部和俱乐部青年队。二者都可进入都道府县联赛、九地区 Prince League、Premier EAST/WEST 与 Final 的全年金字塔，但高校总体育大会、全国高校足球选手权和 Club Youth U18 保持组织边界。
- 日本大学阶段：地区大学联赛、总理大臣杯和全日本大学锦标赛构成比赛环境；特别指定制度允许符合条件的高中/大学注册球员在保留原注册的同时参与 J.League 俱乐部活动。
- 韩国：普通高中足球部与 K League 俱乐部 U18 并存。`Gangwon FC U18 / Kangneung Jeil High School` 等身份拆成 `parent_organization` 与 `education_partner`，不创建重复球队或球员。
- 韩国大学与职业：KFA U-League 单列；Gimcheon Sangmu 是成年职业军队球队，使用 `military-service-club`，不归入青训梯队。
- 稳定制度写入 `stable_structure`；2026 队数、赛季分组等只写入 `annual_snapshot`。

结构化体系数据位于 `data/raw/youth-development-systems.json`，竞赛 ID 可由 `training_pathway[].competition_context_ids` 引用。

## 来源层枚举

| 类型 | 使用边界 |
| --- | --- |
| `afc-registration` | AFC final registration / final squad，支撑赛事报名和报名组织。 |
| `national-fa-profile` | JFA/KFA 队伍页、名单公告或国家队 profile。 |
| `school-profile` | 只用于高中或学校队官方来源。 |
| `university-profile` | 只用于大学球队或个体名单。 |
| `club-academy-profile` | 只用于 U18 等俱乐部青训梯队。 |
| `club-profile` | 职业一线队、海外职业队或成年军队球队。 |
| `league-registration` | J.League、K League 等官方注册页、球员页或联赛公告。 |

组织来源不得复用 AFC 报名 PDF。每层必须记录 `label`、`url`、`checked_at`、`confidence`、`fields` 和边界清晰的 `claim`。

## 覆盖结果

| 队伍 | 人数 | AFC 基础层 | 当前组织类型 |
| --- | ---: | ---: | --- |
| Japan U17 | 23 | 23/23 | 高中、俱乐部梯队、海外梯队 |
| Japan U23 | 23 | 23/23 | 大学、职业一线队 |
| Korea Republic U17 | 23 | 23/23 | 高中、俱乐部梯队；可含合作高中 |
| Korea Republic U23 | 23 | 23/23 | 职业一线队、海外职业队、成年军队球队 |

合计 92 人全部具有一条 `afc-registration`、合法 `registration_club.organization_type`，并在当前路径节点保留同一组织类型。组织分布为：俱乐部梯队 32、高中 12、大学 8、职业一线队 36、海外梯队 2、成年军队球队 2。

## 16 名深度样本

既有 13 人：Rei Ono、Aran Sato、Takaya Sekine、Masataka Kobayashi、Kaito Tsuchiya、Kosei Ogura、Seung Min Lee、Geon Woo Park、Moon Hyunho、Bae Hyunseo、Lee Chanouk、Kim Taewon、Kim Yonghak。

新增 3 人：

- Ryosuke Furukawa：Iwata Higashi High School；AFC + JFA。
- Tomoyasu Hamasaki：Meiji University；AFC + 明治大学体育会足球部个体页。
- Jin Woo-jin：Kangneung Jeil High School / Gangwon FC U18；AFC + KFA + K League 官方赛事页。

校验器固定检查这 16 人至少有一条不同于 AFC URL 的独立官方来源，并拒绝把 AFC PDF 包装成学校、大学或俱乐部来源。

## 官方体系来源

- [JFA 注册与赛事分类](https://www.jfa.jp/registration/player_team/tournaments.html)
- [JFA Premier / Prince 结构](https://www.jfa.jp/match/takamado_jfa_u18_premier2026/about_premier.html)
- [JFA 高校总体育大会](https://www.jfa.jp/match/koukou_soutai_2025/men/about.html)
- [JFA 全国高校足球选手权](https://www.jfa.jp/match/alljapan_highschool_2025/about.html)
- [JFA Club Youth U18](https://www.jfa.jp/match/club_youth_u18_2025/about.html)
- [JFA 特别指定制度](https://www.jfa.jp/youth_development/honor_players/)
- [K League Junior](https://www.kleague.com/youth/junior.do)
- [K League Youth Championship](https://www.kleague.com/youth/youth.do)
- [KFA U-League](https://www.kfa.or.kr/competition/?act=lg_u)
- [KFA 2026 青少年竞赛规程](https://img.kfa.or.kr/data_rule/youth_rule_2026_01.pdf)

## 维护限制

- `competition_context_ids` 描述培养/竞赛环境，不自动表示球员在某一赛季实际报名或出场。
- K League 页面会随赛季更新；球队数量、比赛日期和合作学校映射需按年度复核。
- 体系页展示的是本站关联样本，不代表日本、韩国全部注册球员。
- Moon Hyunho 的 Gimcheon Sangmu / Portimonense 路径冲突说明继续保留，不能用当前组织字段覆盖历史节点。
