# 亚洲教练扩展口径与试点样本

更新时间：2026-07-11

本文件对应 [issue #20](https://github.com/pacoxu/football-research-sandbox/issues/20)，用于把亚洲教练样本从现有 `data/raw/big-five-asian-coaches.json` 扩展到五大联赛之外。目标不是继续往五大联赛主表塞记录，而是先定义可落库字段、边界和首批试点样本。

实现状态：统一表 `data/raw/asian-coaches.json`、loader、站点聚合和 validator 已落地。首批收录 Ange Postecoglou、Tony Popovic、Hajime Moriyasu、Hong Myung-bo、Chan Yuen-ting 五名教练、10 段任期；逐场战绩仍按分步原则保留为 `null`。

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

## 建议 schema

```json
{
  "id": "asian-coaches",
  "last_checked": "2026-06-28",
  "scope_counts": {
    "afc_member_association": 0,
    "geographic_broad": 0
  },
  "coaches": [
    {
      "id": "tony-popovic",
      "name": "Tony Popovic",
      "local_name": "托尼·波波维奇",
      "nationality": "Australia",
      "association": "Football Australia",
      "association_confederation": "AFC",
      "counted_in": ["afc_member_association", "geographic_broad"],
      "boundary_notes": [],
      "stints": [
        {
          "team": "Australia",
          "team_country": "Australia",
          "team_type": "national_team",
          "competition_scope": "afc_senior_national_team",
          "competition": "FIFA World Cup 2026 qualification / AFC Asian Qualifiers",
          "role_scope": "senior_national_team",
          "role_type": "head_coach",
          "spell_type": "permanent",
          "period": {
            "start": "2024-09",
            "end": null
          },
          "season": "2024-2026 cycle",
          "count_in_primary": true,
          "record_scope": "all senior international matches, pending match-level audit",
          "record": null,
          "source_links": [
            {
              "label": "Football Australia appoints Tony Popovic as Head Coach of the Subway Socceroos",
              "url": "https://footballaustralia.com.au/news/football-australia-appoints-tony-popovic-head-coach-subway-socceroos",
              "type": "association-announcement"
            }
          ],
          "verification": {
            "status": "verified",
            "last_checked": "2026-06-28",
            "notes": "Official Football Australia appointment page is reachable."
          }
        }
      ],
      "source_links": [],
      "confidence": "high"
    }
  ]
}
```

`record` 先允许为 `null`。任命事实和战绩统计应分步完成，避免因为缺逐场战绩而阻塞首批样本落库。

实现中把 `role_scope` 与 `role_type` 分开：前者区分 `club_first_team`、`senior_national_team`、`youth_national_team`，后者区分正式、代理和临时主教练。任期改为结构化年月，现任的 `period.end` 为 `null`。

凡表内写作 `2024-`、`2026-` 或 open-ended 的任期，只能视为待落库线索。真正进入 JSON 前必须在对应记录的 `verification.last_checked` 日期重新确认官方现任状态，不能只沿用本研究页。

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

1. 第二批优先补 Kevin Muscat、Kim Pan-gon、Akira Nishino、Masatada Ishii、Amir Ghalenoei、Choi Kang-hee，并坚持每段任期至少一条官方来源。
2. 逐步为首批任期补同口径逐场战绩；在完成审计前继续保留 `record: null`。
3. 若站点需要独立展示，再增加扩展教练筛选和卡片；当前只将数据发布到 `data/site/overview.json`，不混入五大联赛主表页面。

## 已核和待补来源

已核可访问：

- Football Australia: Tony Popovic appointed Head Coach of the Subway Socceroos, https://footballaustralia.com.au/news/football-australia-appoints-tony-popovic-head-coach-subway-socceroos
- Celtic FC: Celtic appoint Ange Postecoglou as new football manager, https://www.celticfc.com/news/2021/june/Celtic-appoint-Ange-Postecoglou-as-new-football-manager/
- JFA 2026 SAMURAI BLUE staff, https://www.jfa.jp/eng/samuraiblue_2026/member/
- KFA: Hong Myung-bo appointed Korea Republic head coach, https://www.kfa.or.kr/layer_popup/popup_live.php?act=news_tv_detail&check_url=bGF5ZXI%3D&div_code=news&idx=26402&lang=EN
- AFC: Chan Yuen-ting / Eastern AFC Champions League Q&A, https://www.the-afc.com/en/club/afc_champions_league/news/afc_champions_league_qa_chan_yuen-ting_eastern_sc.html

优先待补：

- FAM 的 Kim Pan-gon 任命和辞任公告。
- Yokohama F. Marinos、Shanghai Port、Sint-Truiden 的 Muscat 任命和离任公告。
- FAT 的 Masatada Ishii 任命公告。
- FFIRI 的 Amir Ghalenoei 任命公告。
- HKFA / Eastern 的 Chan Yuen-ting 任命与 AFC 参赛节点。
