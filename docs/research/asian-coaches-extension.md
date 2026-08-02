# 亚洲教练扩展口径与试点样本

更新时间：2026-08-01

本文件对应 [issue #20](https://github.com/pacoxu/football-research-sandbox/issues/20)，用于把亚洲教练样本从现有 `data/raw/big-five-asian-coaches.json` 扩展到五大联赛之外。目标不是继续往五大联赛主表塞记录，而是先定义可落库字段、边界和首批试点样本。

实现状态：统一表 `data/raw/asian-coaches.json`、loader、站点聚合和 validator 已落地。Issue #12 第二批补入 Kevin Muscat、Kim Pan-gon、Akira Nishino、Masatada Ishii、Amir Ghalenoei、Choi Kang-hee；[issue #45](https://github.com/pacoxu/football-research-sandbox/issues/45) 进一步完成同口径逐场审计。当前共11名教练、19段任期，其中15段闭环，4段因职责边界或进行中赛季保持 `record: null`。

## Issue #12 第二批核验结果

| 教练 | 已落库任期 | 核验边界 |
| --- | --- | --- |
| Kevin Muscat | Yokohama F. Marinos 2021-2023；Shanghai Port 2023- | AFC 可闭环任命和岗位；上海海港现任状态在2026年资料中复核，战绩未录。 |
| Kim Pan-gon | Malaysia 2022-2024；Selangor 2026- | FAM 辞任事实由 AFC 转述，Selangor 任命使用俱乐部公告。Ulsan 历史暂不重复堆叠。 |
| Akira Nishino | Japan 2018；Thailand 2019-2021 | JFA 任命与 AFC 的泰国任命/离任资料闭环；兼任 Thailand U23 不另建重复任期。 |
| Masatada Ishii | Thailand 2023-2025 | 2025年10月已离任，不再沿用旧研究页的开放任期。 |
| Amir Ghalenoei | IR Iran 2023- | AFC 转述 FFIRI 任命，并由2026世界杯名单资料复核仍在任。 |
| Choi Kang-hee | Shandong Taishan 2023-2025 | 2025年7月起无法现场执教；结束月表示实际主教练职责中断，不推断合同解除。 |

第二批校验固定检查六个 coach id，并要求每段任期至少有一条非二级来源。`big-five-asian-coaches.json` 未改动，因为这些任期均不属于五大联赛顶级联赛一线队联赛战绩口径。

## Issue #45 逐场战绩审计

战绩不再使用未声明的“所有赛事”汇总。俱乐部任期只统计字段中声明的国内顶级联赛；成年国家队只统计 FIFA 认可的成年 A 级赛，点球大战按加时结束时的平局处理。青年队、成年队、俱乐部一线队互不混算，杯赛、洲际赛和友谊赛也不得混入俱乐部联赛战绩。

| 教练 | 任期 | 声明赛事 | 战绩（场-胜-平-负） | 审计状态 |
| --- | --- | --- | --- | --- |
| Ange Postecoglou | Australia 2013-2017 | FIFA 成年 A 级赛 | 49-22-12-15 | 完成 |
| Ange Postecoglou | Yokohama F. Marinos 2018-2021 | J1 League | 118-58-18-42 | 完成 |
| Ange Postecoglou | Celtic 2021-2023 | Scottish Premiership | 76-61-9-6 | 完成 |
| Tony Popovic | Australia 2024- | FIFA 成年 A 级赛，截至2026-07-03 | 22-11-6-5 | 完成快照；2026-10-30前复核 |
| Hajime Moriyasu | Sanfrecce Hiroshima 2012-2017 | J1 League | 187-92-40-55 | 完成 |
| Hajime Moriyasu | Japan Olympic-age 2017-2021 | U23 / Olympic-age | — | 待核：成年队与奥运年龄队职责重叠，未逐场分派 |
| Hajime Moriyasu | Japan 2018- | FIFA 成年 A 级赛，截至2026-06-30 | 106-73-15-18 | 完成快照；2026-10-30前复核 |
| Hong Myung-bo | Ulsan 2021-2024 | K League 1 | 136-77-34-25 | 完成 |
| Hong Myung-bo | Korea Republic 2024-2026 | FIFA 成年 A 级赛（仅第二任期） | 26-15-5-6 | 完成 |
| Chan Yuen-ting | Eastern 2015-2017 | Hong Kong Premier League | 29-21-5-3 | 完成 |
| Kevin Muscat | Yokohama F. Marinos 2021-2023 | J1 League | 86-49-18-19 | 完成 |
| Kevin Muscat | Shanghai Port 2023- | Chinese Super League | — | 待核：2026赛季进行中；2026-10-30前复核 |
| Kim Pan-gon | Malaysia 2022-2024 | FIFA 成年 A 级赛 | 34-20-4-10 | 完成 |
| Kim Pan-gon | Selangor 2026- | Malaysia Super League | — | 待核：当前赛季未闭环；2026-10-30前复核 |
| Akira Nishino | Japan 2018 | FIFA 成年 A 级赛 | 7-2-1-4 | 完成 |
| Akira Nishino | Thailand 2019-2021 | FIFA 成年 A 级赛 | 10-2-5-3 | 完成；排除2021年对 Oman 的非 FIFA 赛 |
| Masatada Ishii | Thailand 2024-2025 | FIFA 成年 A 级赛 | 30-16-6-8 | 完成 |
| Amir Ghalenoei | IR Iran 2023- | FIFA 成年 A 级赛，仅当前任期，截至2026-06-26 | 46-31-9-6 | 完成快照；2026-10-30前复核 |
| Choi Kang-hee | Shandong Taishan 2023-2025 | Chinese Super League | — | 待核：合同/名义任期与实际临场执教截止不一致 |

每段任期的 `record_audit` 都声明赛事、覆盖起止、逐场来源、最后核查日和复核日。`status: complete` 必须满足 `matches = wins + draws + losses` 且存在非二级逐场来源；`status: pending` 必须保持 `record: null`。开放任期的 `review_after` 不得晚于 `last_checked` 后90天。五大联赛主表未因本次审计改动。

## 结论

建议新增统一的 `data/raw/asian-coaches.json`，用一个教练实体挂多个 `stints`。不要优先拆成 `asian-national-team-coaches.json`，因为同一名教练经常横跨国家队、欧洲非五大和亚洲顶级联赛，例如 Tony Popovic、Hong Myung-bo、Kim Pan-gon、Kevin Muscat。国家队、俱乐部和地区联赛视图应通过 `competition_scope` 派生。

现有 `data/raw/big-five-asian-coaches.json` 继续只保留五大联赛顶级联赛的一线队联赛战绩。扩展表可以引用同一名教练，但不能复制或改写五大联赛战绩。

## 计入口径

### 人员边界

| 字段 | 规则 |
| --- | --- |
| `association_confederation` | 以教练代表或归属足协为准，默认 AFC 主口径。 |
| `counted_in` | 至少一个值：`afc_member_association`、`geographic_broad`、`uefa_asian_boundary`、`dual_nationality_watch`。 |
| `association` | 记录具体足协，例如 Football Australia、JFA、KFA、FFIRI。 |
| `nationality` | 记录公开国籍；若出生地、护照和足协归属不同，用 `boundary_notes` 解释。 |

土耳其、以色列、俄罗斯、格鲁吉亚等 UEFA 或跨欧亚边界项不进入 AFC 主口径。若中文语境需要保留，可以放入 `geographic_broad` 或 `uefa_asian_boundary`，但必须与 AFC 主口径分开统计。

### 职务边界

| `role_type` | 是否进入主统计 | 说明 |
| --- | --- | --- |
| `head_coach` | 是 | 俱乐部一线队、成年国家队、U 系列国家队主教练。 |
| `caretaker_head_coach` | 是，但需标注 | 临时代理可以进入，但必须写明 `spell_type` 和任期来源。 |
| `interim_head_coach` | 是，但需标注 | 同上，避免与长期任命混淆。 |
| `assistant_coach` | 否 | 可作为履历线索，不计入主统计。 |
| `technical_director` | 否 | 只进入 staff/reference，不计入主教练样本。 |
| `advisor` | 否 | 顾问、个人顾问、技术顾问不进入主统计。 |
| `club_youth_head_coach` | 否，除非另设青训专题 | 俱乐部青年队教练不混入一线队主统计。 |
| `head_coach` + `role_scope: youth_national_team` | 是 | AFC U17/U20/U23 等国字号主教练可以进入，并使用独立 `competition_scope`。 |

## 赛事范围

| `competition_scope` | 定义 | 首批联赛或赛事 |
| --- | --- | --- |
| `europe_non_big_five_top_flight` | UEFA 顶级联赛，但排除 Premier League、La Liga、Serie A、Bundesliga、Ligue 1。 | Scottish Premiership、Belgian Pro League、Eredivisie、Primeira Liga、Austrian Bundesliga、Swiss Super League、Turkish Super Lig、Israeli Premier League 等。 |
| `afc_senior_national_team` | AFC 成员协会成年男足国家队主教练。 | Japan、Korea Republic、Australia、Iran、Saudi Arabia、Thailand、Malaysia 等。 |
| `afc_youth_national_team` | AFC 成员协会 U17/U20/U23 等国字号主教练。 | Japan U23、Korea Republic U23、China U23/U20/U17 等。 |
| `asian_top_flight_club` | 亚洲成员协会国内顶级联赛一线队主教练。 | J1 League、K League 1、Chinese Super League、A-League Men、Saudi Pro League、Qatar Stars League、UAE Pro League、Persian Gulf Pro League、Thai League 1、Malaysia Super League、Hong Kong Premier League 等。 |
| `afc_continental_club` | AFC Champions League 或 AFC Champions League Elite 参赛节点。 | 只作为补充视图，不能替代国内联赛任命。 |

## 已实现的战绩审计字段

```json
{
  "record_scope": "declared competition and result policy",
  "record": {
    "matches": 22,
    "wins": 11,
    "draws": 6,
    "losses": 5,
    "points": 39
  },
  "record_audit": {
    "status": "complete",
    "competitions": ["FIFA-recognised senior A internationals"],
    "coverage": {
      "from": "2024-10-10",
      "through": "2026-07-03"
    },
    "fixture_sources": [
      {
        "label": "official fixture archive",
        "url": "https://socceroos.com.au/fixtures#!/t575",
        "type": "competition-record"
      },
      {
        "label": "authoritative match-log cross-check",
        "url": "https://www.national-football-teams.com/coach/427/Tony_Popovic.html",
        "type": "secondary-crosscheck"
      }
    ],
    "last_checked": "2026-08-01",
    "review_after": "2026-10-30",
    "notes": "Open-stint snapshot; re-audit within 90 days."
  }
}
```

`record` 仍允许为 `null`，但只能与 `record_audit.status: pending` 同时出现，并必须写明未闭环原因。完成状态必须有至少一条官方或赛事方逐场来源；Wikipedia、Transfermarkt 等只能交叉核对，不能单独支撑完整战绩。

实现中把 `role_scope` 与 `role_type` 分开：前者区分 `club_first_team`、`senior_national_team`、`youth_national_team`，后者区分正式、代理和临时主教练。任期改为结构化年月，现任的 `period.end` 为 `null`。

开放任期既要在 `verification.last_checked` 确认岗位状态，也要在 `record_audit.last_checked` 截止逐场集合，并设置不超过90天的 `review_after`。两者不能互相替代。

## 首批试点样本

首批实际落库选择五名能覆盖全部主要 scope、且有官方来源闭环的教练。其余候选保留为第二批，不用二手来源强行填充。

| 教练 | 主口径 | 可覆盖范围 | 首批任期线索 | 当前来源状态 | 落库建议 |
| --- | --- | --- | --- | --- | --- |
| Ange Postecoglou | Australia / AFC | `europe_non_big_five_top_flight`、`asian_top_flight_club`、`afc_senior_national_team` | Celtic 2021-2023；Yokohama F. Marinos 2018-2021；Australia 2013-2017。 | Celtic 任命 URL 可访问；五大联赛经历已在主表。 | 扩展表只补 Celtic、Yokohama、Australia，不复制 Tottenham / Nottingham Forest 记录。 |
| Kevin Muscat | Australia / AFC | `europe_non_big_five_top_flight`、`asian_top_flight_club` | Sint-Truiden 2020；Yokohama F. Marinos 2021-2023；Shanghai Port 2023-。 | Belgian Pro League 与公开资料可交叉核；Yokohama、Shanghai 官方任命页待补。 | 很适合作为跨欧洲非五大、J1、CSL 的 schema 压测样本。 |
| Tony Popovic | Australia / AFC | `afc_senior_national_team`、`asian_top_flight_club`、`afc_continental_club` | Australia 2024-；Western Sydney Wanderers、Perth Glory、Melbourne Victory。 | Football Australia 2024 任命公告可访问。 | 先落国家队任命，再补 A-League 与 AFC Champions League 节点。 |
| Hajime Moriyasu | Japan / AFC | `afc_senior_national_team`、`afc_youth_national_team`、`asian_top_flight_club` | Japan 2018-；Japan U23 2017-2021；Sanfrecce Hiroshima 2012-2017。 | JFA 当前国家队入口可访问，旧英文个人页返回 404；需补 JFA 任命公告或官方 profile。 | 优先补 Japan senior 和 Sanfrecce J1 任期。 |
| Hong Myung-bo | Korea Republic / AFC | `afc_senior_national_team`、`afc_youth_national_team`、`asian_top_flight_club` | Korea Republic 2013-2014、2024-；Hangzhou Greentown 2015-2017；Ulsan HD 2020-2024。 | 需补 KFA / K League / CSL 官方源；公开资料可先列 watch。 | 能覆盖国家队、CSL、K League 三类 scope。 |
| Kim Pan-gon | Korea Republic / AFC | `afc_senior_national_team`、`asian_top_flight_club` | Malaysia 2022-2024；Ulsan HD 2024-2025；Selangor 2026-。 | FAM 辞任公告、Selangor 任命公告和 K League 源待逐条补 URL。 | 适合作为“教练协会归属”和“执教协会/联赛所在国”不同的样本。 |
| Akira Nishino | Japan / AFC | `afc_senior_national_team`、`asian_top_flight_club` | Japan 2018；Thailand 2019-2021；Gamba Osaka。 | 需补 JFA / FAT / J.League 官方源。 | 先作为历史亚洲国家队和 J League 样本。 |
| Masatada Ishii | Japan / AFC | `afc_senior_national_team`、`asian_top_flight_club` | Thailand 2023-；Kashima Antlers；Buriram United。 | 需补 FAT、J.League、club official。 | 适合作为日本教练在东南亚国家队和泰超的样本。 |
| Amir Ghalenoei | Iran / AFC | `afc_senior_national_team`、`asian_top_flight_club` | Iran 2023-；Esteghlal、Sepahan 等伊朗顶级联赛任期。 | 需补 FFIRI / league official / AFC source。 | 作为西亚本土主教练样本。 |
| Choi Kang-hee | Korea Republic / AFC | `asian_top_flight_club`、`afc_continental_club` | Jeonbuk Hyundai Motors；Tianjin / Shanghai Shenhua / Shandong Taishan 等 CSL 任期。 | 需补 K League、CSL 俱乐部和 AFC 源。 | 作为 K League / CSL / AFC Champions League 长任期样本。 |
| Chan Yuen-ting | Hong Kong, China / AFC | `asian_top_flight_club`、`afc_continental_club` | Eastern Sports / Eastern SC。 | 需补 HKFA、club、AFC 源。 | 主教练口径可计入；性别不是排除条件，关键是是否一线队 head coach。 |

## 边界观察池

| 教练或范围 | 当前判断 |
| --- | --- |
| 土耳其教练在 Turkish Super Lig | 因 Turkish Football Federation 属 UEFA，不进 AFC 主口径；可用 `uefa_asian_boundary` 保留。 |
| 以色列教练在 Israeli Premier League | 因 Israel Football Association 属 UEFA，不进 AFC 主口径；可用 `uefa_asian_boundary` 保留。 |
| 格鲁吉亚、亚美尼亚、阿塞拜疆、俄罗斯相关教练 | 先按足协归属和执教联赛分开标，不默认进入 AFC 或广义亚洲样本。 |
| 中亚 AFC 教练执教欧洲非五大 | 可进 AFC 主口径，但必须确认教练协会归属，不用出生地单独判断。 |
| 中国籍教练海外助教、顾问 | 不进入主统计，可进入 staff/reference 或中国教练专题线索。 |

## 下一步

1. 在2026-10-30前复核全部开放任期；发现新增比赛或离任时，同步推进 `coverage.through`、战绩和结束月份。
2. 继续闭环4段 `pending` 任期：Moriyasu 奥运年龄队逐场职责、Shanghai Port 和 Selangor 完整联赛赛季、Choi 的实际临场截止。
3. 新增任期时先声明赛事和结果政策，再收逐场集合；不得从跨赛事总场次反推联赛或国家队战绩。

## 已核和待补来源

主要逐场入口：

- J.League Data Site 教练逐场日志：https://data.j-league.or.jp/SFIX07/
- SPFL 历史赛季：https://spfl.co.uk/league/premiership/archive/364
- JFA SAMURAI BLUE 年度赛程：https://www.jfa.jp/samuraiblue/schedule_result/2026.html
- KFA 成年国家队赛果：https://www.kfa.or.kr/national/?act=results
- Football Australia / Socceroos 赛程：https://socceroos.com.au/fixtures#!/t575
- FIFA 2026 世界杯赛果：https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums
- AFC 各协会与洲际赛事档案：https://www.the-afc.com/

仍待闭环：

- JFA 奥运年龄队在 Moriyasu 兼任期的逐场主教练/委派记录。
- 2026 CSL 与 Malaysia Super League 完整赛季结束后的官方逐场集合。
- Shandong Taishan 在 Choi 无法现场执教后的正式临场职责记录。
