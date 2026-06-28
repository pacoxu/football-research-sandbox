# 海外青训、球探与青年球员检索源目录

更新时间：2026-06-28

本文件把“海外足球青训 / 球探 / 青年球员观察”网站整理成后续检索方向。它不替代 `data-governance-and-quality-rules.md` 的来源等级规则；真正落库时仍以官方注册、赛事报名、俱乐部和联赛页面为强事实来源。本目录的作用是：提高发现线索的效率、统一二级数据库使用口径，并把付费球探平台和球员自荐平台的风险边界写清楚。

## 使用原则

- 先官方，后数据库，再媒体/报告：当前注册、生日、国籍、正式名单和比赛出场，优先找足协、赛事、联赛、俱乐部官方来源。
- 二级数据库只做交叉核验：Transfermarkt、FBref、Soccerway、FotMob、Sofascore、WorldFootball、CIES 可以帮忙发现球员和补字段，但不应单独覆盖官方事实。
- 付费/B2B 平台不写不可复核事实：Wyscout、Instat、StatsBomb、Eyeball 等若无法公开访问原始页面，只能作为工作流方向，不作为 `external_links` 的唯一证据。
- 自荐/试训平台只进观察池：Tonsser、aiScout、Scoutium、Scouts Eyes 适合发现线索和视频，不等于注册、签约或正式试训。
- 未成年跨国路径必须额外谨慎：18 岁以下国际转会有 FIFA 规则限制；所有“海外青训”“试训”“签约”都要区分当前注册、未来生效、短期训练营和商业营。

## 来源等级

| 等级 | 来源类型 | 可用于强事实 | 典型用途 |
| --- | --- | --- | --- |
| S0 | FIFA、AFC、CFA、JFA、KFA、联赛、俱乐部、学校官方页面/PDF | 是 | 终报名、集训名单、当前注册、正式比赛、教练任命。 |
| S1 | 结构化公开数据库 | 部分字段可交叉使用 | 生日、位置、俱乐部履历、出场、转会、身价、同名排除。 |
| S2 | 公开青年球员报告和研究机构 | 不单独作为注册事实 | 潜力股、同龄对照、技术画像、后续跟踪名单。 |
| S3 | 职业球探/招募平台 | 只在公开可访问时引用 | 视频、事件数据、招募线索、球探报告方法。 |
| S4 | 球员曝光/自荐/试训平台 | 否 | 观察池、视频线索、试训风险提示。 |
| S5 | 教练、球探、青训学习资源 | 不用于球员事实 | 方法论、训练内容、球探评价框架。 |

## 公开资料与数据站

| 网站 | URL | 适合检索 | 推荐落库字段 | 使用边界 |
| --- | --- | --- | --- | --- |
| Transfermarkt | https://www.transfermarkt.com/ | 年龄、国籍、位置、俱乐部履历、转会、市场价值。 | `external_links.type=transfermarkt`、`market_value`、`training_pathway` 辅助。 | 身价和履历是二级来源；当前注册仍要回查俱乐部/联赛。 |
| FBref | https://fbref.com/en/ | 球员、球队、联赛数据和历史表现。 | `external_links.type=stats`、出场和比赛统计交叉源。 | 青年赛事和低级别联赛覆盖不稳定。 |
| Soccerway | https://int.soccerway.com/ | 赛程、积分、结果、H2H、小联赛、部分青年赛事。 | `external_links.type=stats`、比赛和赛事路径辅助。 | 页面可能随区域跳转；用作交叉源，不作唯一名单源。 |
| FotMob | https://www.fotmob.com/ | 实时赛程、球员评分、阵容、新闻和比赛数据。 | `external_links.type=stats`、现役比赛状态辅助。 | 实时数据适合跟踪，历史青训履历不足。 |
| Sofascore | https://www.sofascore.com/ | 赛程、结果、统计、评分、球员页面。 | `external_links.type=stats`、出场状态和比赛事件辅助。 | 同名球员和低级别赛事需要回查官方。 |
| WorldFootball.net | https://www.worldfootball.net/ | 国家队、俱乐部、历史赛季和球员记录。 | `external_links.type=stats` 或 `reference`。 | 历史索引好用，但字段要二次确认。 |
| CIES Football Observatory | https://football-observatory.com/ | 年轻球员表现、转会估值、青训产出、研究报告。 | `external_links.type=reference`、同龄对照和研究摘要。 | 更适合报告和榜单，不是报名/注册源。 |

## 职业球探与招募平台

| 平台 | URL | 适合检索 | 仓库使用方式 | 使用边界 |
| --- | --- | --- | --- | --- |
| Hudl Wyscout | https://www.hudl.com/en_gb/products/wyscout | 视频、数据、球员筛选、招募初筛。 | 作为后续视频/数据检索方向记录。 | 多数内容付费，不写不可公开复核事实。 |
| Hudl Instat | https://www.hudl.com/en_gb/products/instat | 比赛视频、球队分析、对手分析、球员招募。 | 可作为球队/球员分析来源线索。 | 不能替代官方出场与注册。 |
| Hudl StatsBomb | https://www.hudl.com/en_gb/products/statsbomb | 高阶事件数据、招募分析、表现评估。 | 用于方法论和高阶数据方向。 | 数据通常授权使用，公开引用要谨慎。 |
| Eyeball | https://www.eyeball.club/ | 青少年足球视频与数据球探。 | 可作为青年球员发现渠道。 | 发现线索后必须回查官方/俱乐部。 |
| The Scouting App | https://www.thescoutingapp.com/ | 球探报告、球员对比、数据库管理。 | 可作为球探工作流参考。 | 不把平台声称直接写成球员事实。 |

## 球员曝光、自荐与试训平台

| 平台 | URL | 适合检索 | 仓库使用方式 | 风险边界 |
| --- | --- | --- | --- | --- |
| Tonsser | https://tonsser.com/ | 青年球员 profile、集锦、数据、tryout 入口。 | 可进入 dossiers/watchlist。 | 不等于俱乐部注册或正式试训。 |
| aiScout | https://play.google.com/store/apps/details?id=com.aiscout.player | 手机技术测试、评分和试训入口。 | 可记录为球员曝光渠道。 | 不直接证明职业关注或签约。 |
| Scoutium | https://play.google.com/store/apps/details?id=com.scoutium.app | 青训队、体育学校、年轻球员视频展示。 | 可作为视频线索入口。 | 只做线索，不做事实。 |
| Scouts Eyes | https://www.scoutseyes.com/ | 球员自荐、视频展示和球探网络。 | 可作为观察池来源。 | 警惕“保证试训/保证签约/付费进队”。 |
| FIFPRO fake-agent guidance | https://www.fifpro.org/articles/2023/06/fake-agents-what-players-should-know-about-trials | 试训和假经纪风险提示。 | `reference`，用于试训类线索的风险说明。 | 用来约束商业试训判断，不是球员数据库。 |

## 教练、球探与青训学习资源

| 网站 | URL | 适合检索 | 仓库使用方式 |
| --- | --- | --- | --- |
| FIFA Training Centre | https://www.fifatrainingcentre.com/ | 训练课、青训、技战术分析、教练资源。 | 方法论、训练主题和青训体系说明。 |
| UEFA Coach Education / UEFA Academy | https://www.uefa.com/development/coaches/coaching-courses/ | 欧洲教练教育、足球管理、精英球探课程。 | 教练/球探学习路径说明。 |
| England Football Learning | https://learn.englandfootball.com/courses | coaching、talent ID、safeguarding 课程。 | 人才识别和青训安全框架。 |
| PFSA | https://thepfsa.co.uk/football-scouting-courses/ | 球探课程、Talent ID、表现分析、数据分析。 | 球探报告模板和评价维度参考。 |
| Coerver Coaching | https://coerver.com.sg/ | 技术训练、青训方法、教练教育。 | 技术训练方法和训练营方向。 |
| Barca Academy | https://barcaacademy.fcbarcelona.com/en/ | 俱乐部官方青训营和训练方法。 | 海外训练营/商业青训项目背景。 |
| Manchester City Football Schools | https://www.mancity.com/football-schools | 俱乐部足球学校和训练营。 | 商业训练营与职业注册分离说明。 |

## 青年球员报告与潜力股资讯

| 网站 | URL | 适合检索 | 仓库使用方式 |
| --- | --- | --- | --- |
| Football Talent Scout | https://footballtalentscout.net/ | 年轻球员 scouting report、talent of the week。 | 潜力球员候选池和技术画像入口。 |
| SCOUTED Football | https://scoutedftbl.com/ | 青年球员、招募、未来之星专题。 | 同龄对照和背景阅读。 |
| The Guardian Next Generation | https://www.theguardian.com/football/series/next-generation | 每年 60 名全球青年才俊。 | 全球同年龄段热门球员对照。 |
| Total Football Analysis | https://totalfootballanalysis.com/category/player-analysis | 球员分析、战术分析、scout report。 | 技术/战术画像辅助。 |
| CIES Football Observatory | https://www.cies.ch/research/ | 青训产出、年轻球员表现、市场估值研究。 | 研究型对照和榜单入口。 |

## 检索流程模板

### 新球员建档

1. 用本名、英文转写、中文译名、出生年、俱乐部、国家队年龄段组合检索。
2. 先找 S0 来源：足协/赛事 final registration、俱乐部 profile、联赛注册页、学校/学院页面。
3. 用 S1 数据库交叉：Transfermarkt、Soccerway、FBref、FotMob、Sofascore、WorldFootball。
4. 若只命中报告、自荐平台或短视频，进入 `dossiers` 或 watchlist，不进主球员表。
5. 新增记录时必须写清 `verification.status`、`last_checked` 和证据链。

### 当前留洋状态复核

1. 先查俱乐部和联赛注册页，确认当前有效注册。
2. Transfermarkt 只用来补履历、转会日期和市场价值，不能单独改 `registration_club`。
3. 若出现签约但未来生效，使用 `pending-transfer` 或等价状态，不提前计入当前留洋。
4. 对试训、商业训练营、短期训练，只写 `training_pathway` 或 dossier，不算留洋注册。

### U 系列赛事补录

1. 先找 FIFA/AFC/各足协 final registration、match centre、technical report。
2. 球员页用俱乐部、联赛、学校和数据库交叉补生日、身高、位置。
3. 出场、进球、minutes 优先比赛中心或技术报告；数据库只做辅助。
4. 若名单和俱乐部归属冲突，保留官方赛事注册字段，并在 `verification.notes` 写明当前注册复核需求。

### 潜力股和对照组扩展

1. 用 CIES、Guardian Next Generation、Football Talent Scout、SCOUTED 和 Total Football Analysis 发现候选人。
2. 候选人必须回到 S0/S1 来源核实后才能进入 `data/raw/players/*.json`。
3. 若只是“值得关注”的同龄对照，优先写入 docs 或 dossiers，不污染核心球员表。

## 当前项目优先应用方向

| 方向 | 推荐检索组合 | 落点 |
| --- | --- | --- |
| 中国当前留洋状态 | 俱乐部/联赛注册 + Transfermarkt + Soccerway/FotMob + 可靠新闻 | `data/raw/players/china-overseas-current.json`、`overseas_status` 后续字段。 |
| 日本/韩国 U17/U23 青训路径 | JFA/KFA + J/K League + 俱乐部/学校页面 + Transfermarkt/Soccerway | `data/raw/players/japan-*.json`、`korea-republic-*.json`。 |
| 亚洲其他国家对照组 | AFC final registration + 各国足协/俱乐部 + Soccerway/Transfermarkt | 新增国家/年龄段球员文件或 `u17.json` 对照组。 |
| U20/U17 世界赛历史 | FIFA archive + technical report + WorldFootball/Wikipedia/RSSSF 交叉 | `data/raw/tournament-archive.json`。 |
| 五大联赛之外留洋 | Transfermarkt + FBref/WorldFootball + 联赛官网 + 俱乐部官网 | `data/raw/overseas-history.json`。 |
| 球探报告和技术画像 | CIES + Football Talent Scout + SCOUTED + Total Football Analysis | docs、dossiers 或后续 scouting report 字段。 |

## 不落库或谨慎落库

- “保证试训”“付费进职业队”“保证签约”等商业承诺，不进入球员事实字段。
- 社媒截图、短视频口播、图片预测名单，只能作为线索。
- 付费平台截图或不可公开页面，不能作为公开仓库的唯一证据。
- 未成年人跨国训练营，不等于国际转会或正式注册；必须写清是否有 FIFA/足协批准、是否只是短期训练。
