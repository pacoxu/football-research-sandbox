# 领域内容覆盖矩阵与缺口清单

更新时间：2026-07-18

本文件对应 issue #8，用来把后续扩展从“继续加球员”转成可跟踪的覆盖计划。详细补采样本和字段清单见根目录 `research-collection-outline-2026-06-27.md`；本文件只维护模块级状态、来源要求、完成标准、最近核查日期和后续 issue 拆分方向。

## 总览

当前聚合球员库共 252 人：

| 国家/地区 | 人数 | 当前定位 |
| --- | ---: | --- |
| China PR | 80 | 中国 U17/U20/U23、当前留洋、中超/国内青年、足球小将和历史样本主线 |
| Japan | 52 | 日本 U17/U23 完整终报名种子 + 留洋历史对照 |
| Korea Republic | 50 | 韩国 U17/U23 完整终报名种子 + 留洋历史对照 |
| Australia | 46 | AFC U17 2026、U20 2025 两届完整终报名对照组 |
| Uzbekistan | 24 | U17 2026 完整终报名 23 人 + Khusanov 留洋兑现样本 |

年龄段分布：

| 年龄段 | 人数 | 说明 |
| --- | ---: | --- |
| u17 | 123 | 东亚三队 U17 + 澳大利亚、乌兹别克 U17 2026 完整终报名 + 中国补充观察 |
| u20 | 41 | 中国 U20 2025 两版名单边界已版本化；澳大利亚 U20 2025 完整终报名 23 人已结构化 |
| u21 | 19 | 中超/国内青年观察和项目样本 |
| u23 | 69 | 中日韩 U23 完整终报名、中国留洋/中超样本及 Khusanov 兑现样本 |

## 覆盖矩阵

| 模块 | 当前覆盖 | 状态 | 来源要求 | 完成标准 | 最近核查 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| 中国 U17/U20/U23 完整名单 | 中国 U23 2026 终报名 23/23，六场逐场阵容、换人、牌事件和逐人统计已完成：21 人出场、66 次首发、6270 分钟、4 球；中国 U17 2026 `final-squad` 保持 23 人，第四期集训 24 人中 21 人映射、3 人经审计均为 `insufficient-evidence`，继续以 `later-camp-callup` 留在名单视图；中国 U20 2025 保留两版名单与四场官方 Match Summary 汇总。 | 主名单与 U23 正赛统计完成；U17 三人证据待公开来源补齐 | AFC final registration/technical report、CFA/JFA 战报、FotMob/Opta 事件交叉源。 | 名单边界可自动校验；逐场首发、换人、分钟、进球和牌事件能解析到球员 ID；确认未出场为 0。 | 2026-07-19 | 常规复核 U23 数据源；仅在完整生日与注册证据同时出现后为 U17 三人建档。 |
| 日本、韩国 U17/U23 青训路径 | 四队各 23 人、合计 92 人全部有 AFC 基础来源、当前组织类型和体系引用；16 名深度样本具备不同 URL 的独立官方来源。新增日韩体系页，区分日本学校/俱乐部并行体系、韩国母俱乐部/合作高中双重语境，以及大学、职业和成年军队球队。 | 完成 | JFA/KFA、J/K 联赛、俱乐部、学校、大学队官方页。 | 92 人基础覆盖、16 人独立深度来源、体系 ID 可校验、前端与 SQLite 同步。 | 2026-07-12 | 常规维护官方链接和年度快照；不把赛季数据写成永久规则。 |
| 根宝足球基地代际与现状 | 已公开专题详情页；覆盖 2000 年崇明基地以来七条代际线、26 名代表球员，以及 1314/1516 委培梯队现状。每名代表球员有状态分类、截至日期、可信度和现状来源。 | 代表样本完成 | 中国足协、上海本地权威媒体、俱乐部/联赛阵容与比赛记录交叉核验。 | 页面能区分一线队、B队、退役执教、青训上升和待复核；不得把混编全运队自动视为纯基地培养。 | 2026-07-12 | 补全 93-94、97-98、01-03 三拨名单，并按月复核现役去向。 |
| 中国 2026 职业联赛青年样本 | 已为中超、中甲、中乙、足协杯、U21 联赛和中冠建立独立赛事 ID；14 条中超参与记录与 1 条中冠记录具备赛季、层级、出场/首发/替补/进球/分钟字段、统计截止日、完整度和来源核查日。李雨轩中冠样本已从中超口径迁出，魏祥鑫现役留洋后不再保留国内当前参赛记录。 | 分层口径完成，逐场累计持续补齐 | 中国足协、联赛与俱乐部官方比赛报告优先；权威赛事数据库或媒体只作补充与交叉核验。 | 成年联赛、杯赛、U21 联赛分开统计；每名样本有 competition/season/apps/starts/substitute appearances/goals/minutes/source_checked_at，未知值明确为 `null` 且标记 `partial`。 | 2026-07-19 | 按轮更新新增出场，每月末逐场复核 partial 样本并补中甲、中乙、足协杯和 U21 实际参与者。 |
| 当前中国留洋样本 | 17 名当前有效海外注册样本已统一标记为 `active-registered`；李昊、杨希、邝兆镭 3 名回流样本标记为 `returned`。李昊已补 2016 马竞青训、2023 职业合同/科尔内利亚与 2025 回国时间线；王大雷、张文钊 2006 国际米兰训练/试训单列为 `historical-trial-only`，不计当前或正式留洋。魏祥鑫 2026-07-01 欧塞尔节点已生效。 | 状态模型完成 | 俱乐部注册页、联赛名单、CFA 集训归属、可靠媒体交叉源。 | 五类 `overseas_status` 可校验；当前人数只统计 `active-registered`；历史试训明确无签约/注册，并在页面单独标识。 | 2026-07-19 | 常规复核注册变化；出现可靠试训或未来生效转会时按 `trial-watch` / `pending-effective` 录入。 |
| 中国留洋历史与五大联赛出场榜 | `overseas-history.json` 已有中国 featured_records 25 条，其中新增宫磊 1 条、贾秀全 2 条早期留洋记录；big-five checklist 13 人均已关联独立 featured record，蒿俊闵、蒋光太、李金羽、李可、李玮锋、张呈栋等缺口已补齐。 | checklist 完成，历史样本持续扩充 | Premier League、J.League、俱乐部历史档案为主，WorldFootball、Transfermarkt、历史数据库和媒体用于交叉核对。 | checklist 每名球员都有可解析的 featured record；五大联赛顶级联赛与杯赛、梯队、低级别及欧洲、亚洲、大洋洲其他路径严格分开。 | 2026-07-19 | 按新增官方档案修订来源和统计，继续补早期非五大联赛先驱。 |
| 亚洲其他国家对照组 | 澳大利亚 U17 2026、U20 2025 与乌兹别克 U17 2026 已完成 23/23；#55 另确认伊朗、乌兹别克斯坦、沙特、卡塔尔有 10 个目标组合具备 AFC 官方 23 人终报名表，伊朗 U23 2024、U17 2026 未参赛。 | 部分完成，剩余来源审计完成 | AFC final registration、AFC/FIFA match reports、各国足协/俱乐部 profile。 | 每个有官方完整名单的国家×赛事组合恰好 23 人，不再截取 8—12 人样本；跨年龄名单去重并保留多条赛事参与记录。 | 2026-07-18 | 按 [#55 审计表](research/issue-55-iran-remaining-u20-u23-source-audit.md) 执行 10 个完整名单任务。 |
| UEFA Youth League 历史赛事 | 已建立 2010—2023 完整谱系边界：2010 UEFA Under-18 Challenge 单列为前身试验赛，2010/11—2012/13 标记为尚未创办；正式索引覆盖 2013/14—2022/23 连续10季，9个已举办赛季含日期、赛制路径、四强、最佳射手、冠亚军与决赛信息，2020/21 明确记录为疫情取消且未产生比赛。最近3季另有完整参赛队和八强起逐场详情。 | 谱系与赛季索引完成，历史逐场待补 | UEFA launch announcement、history、当季 dates/format、competition regulations、match centre、records 与取消公告。 | 前身试验赛、未创办、取消与缺数据严格区分；正式历史赛季连续且每季有来源版本和覆盖状态；完整参赛队及逐场比赛按状态分阶段补齐。 | 2026-07-18 | 第二阶段补2013/14—2022/23完整参赛队清单，再按赛季扩展淘汰赛和逐场赛果。 |
| 男足 U20 世青赛与亚青赛历史 | 1985—2025 两条谱系各 21 个周期，含取消的 AFC 2020、FIFA 2021；已完赛届次均有主办国、日期、冠亚军、完整参赛队和决赛圈分组。另有 FIFA/AFC 2027 两条 future 记录，AFC 资格赛 44 队按 Qualification/Development Phase 分层。 | 届次主干完成，旧届官方来源可继续加固 | FIFA/AFC 官方档案、技术报告、抽签和主办公告优先；RSSSF、Wikipedia 仅作旧届二级交叉。 | 42 个历史周期通过集合与分组一致性校验；future/cancelled 允许空日期和部分名单，不得用推测球队填充。 | 2026-07-12 | 继续用 FIFA/AFC 技术报告替换旧届二级来源，并随官方公告更新 2027 决赛圈资格和抽签。 |
| 世界杯、世青赛、世少赛中国队档案 | 已补 2002 世界杯完整 squad、三场小组赛、逐人 minutes、主教练和 qualification_path；新增 1983/1985/1997/2001 U20 与 1985/1989/1991/1993/2003 U16/U17 世界赛参赛档案，覆盖 squad、matches、goals、coach、qualification_path、source_links；2005 U17/U20 已补 coach 与 qualification_path，并通过 U20/U17 参赛索引串联所有中国参赛年份。 | 参赛档案主线完成，minutes 待深化 | FIFA archive、AFC qualification、CFA 历史资料、权威赛事数据库。 | 中国参赛年份都有 squad、matches、goals、coach、qualification_path；逐人 minutes 用 `minute_status` 明确是否已抽取。 | 2026-06-28 | 继续从 FIFA technical report 或 match centre 抽取 1983-2005 U20/U16/U17 逐人 minutes、首发/替补和停补时口径。 |
| 海外青训/球探检索源目录 | 已新增 `docs/research/scouting-source-directory.md`，把 Transfermarkt、FBref、Soccerway、FotMob/Sofascore、WorldFootball、CIES、Wyscout/Instat/StatsBomb、Eyeball、Tonsser、aiScout、Scoutium、FIFA Training Centre、UEFA/PFSA、Guardian Next Generation 等拆成来源等级、检索用途和落库边界。 | 完成，随用随维护 | 官方源优先；公开数据库交叉核验；付费球探平台和自荐/试训平台只作线索。 | 后续每个球员/赛事扩展 issue 都能说明使用了哪类检索组合，且不把自荐/商业试训平台当作强事实。 | 2026-06-28 | 将常用检索组合固化到具体 issue 或脚本化 source audit。 |
| 董路足球小将逐名档案 | `donglu-football-boys` 专题有 4 个 roster_views、18 条 timeline；球员库中 14 人带 `donglu-football-boys` tag。 | 专题完成，逐名拆分进行中 | 公开报名表、赛事平台、视频/图文原始线索、俱乐部/学校后续注册。 | 区分 donglu-core、tournament-only、short-camp、overseas-supported、uncertain；逐名字段可追踪。 | 2026-06-27 | 拆足球小将逐名档案 issue。 |
| 中国基层青训教练 | 首批9人，覆盖石门五小、王楚、根宝基地、东北路小学、山东泰山/鲁能足校体系、恒大足校、清华附中、足球小将和阿勒泰地区U14。 | 种子完成 | 足协、学校、俱乐部、政府或党报原始报道；自媒体仅作机构自述和训练线索。 | 每人有具名机构、岗位、年龄段、任期或赛季快照、逐条来源声明和核验边界。 | 2026-07-18 | 补鲁能、恒大各年龄段现任教练全表，并拆分足球小将各批次实际教练组。 |
| 亚洲教练 | 五大联赛主表维持 AFC 主口径 2 人、广义边界 7 人；扩展表首批落库 5 名 AFC 教练、10 段任期，覆盖欧洲非五大、AFC 成年/青年国家队和亚洲顶级联赛。 | 首批扩展完成 | 官方联赛统计、俱乐部任命公告、足协任命公告、联赛/AFC profile。 | 五大联赛主表不被污染；扩展表每名教练标注 `association_confederation`、`role_scope`、`competition_scope`、来源类型和核查日期。 | 2026-07-11 | 继续补 Kevin Muscat、Kim Pan-gon、Akira Nishino、Masatada Ishii、Amir Ghalenoei、Choi Kang-hee 等第二批样本，并逐步审计逐场战绩。 |

## 状态定义

| 状态 | 含义 |
| --- | --- |
| 完成 | 已有结构化数据、来源、核查日期和维护规则；新增只属于常规更新。 |
| 部分完成 | 主干存在，但缺关键字段、来源版本、统计或边界说明。 |
| 种子完成 | 已有名单或样本，足够展示页面，但不够支撑完整研究。 |
| 初始样本 | 只有少量对照样本或专题入口。 |
| 待建 | 缺独立文件或尚未结构化。 |

## 来源要求

| 数据类型 | 优先来源 | 降级来源 | 不可直接作为强事实 |
| --- | --- | --- | --- |
| 赛事名单 | AFC/FIFA/CFA/JFA/KFA final registration、官方集训通知 | 俱乐部公告、联赛 profile | 短视频截图、自媒体转述 |
| 当前注册 | 俱乐部官网、联赛注册、足协名单 | Transfermarkt、Soccerway、新闻报道 | 试训、传闻、未来生效合同 |
| 出场统计 | 官方 match centre、联赛技术统计、FIFA/AFC report | WorldFootball、FBref、Wikipedia | 赛后海报、非结构化集锦 |
| 青训路径 | 俱乐部/学校/足协 profile | 媒体采访、项目介绍 | 未标日期的二手名单 |
| 教练战绩 | 联赛官网、俱乐部任命公告、赛事数据库 | Wikipedia/Transfermarkt 交叉源 | 只写“曾任教”的百科摘要 |

## 完成标准

每个覆盖缺口关闭前至少满足：

- 有明确数据落点，例如 `data/raw/players/*.json`、`data/raw/overseas-history.json`、`data/raw/tournament-archive.json` 或专题 dossier。
- 有来源类型和核查日期，符合 `docs/research/data-governance-and-quality-rules.md`。
- 能解释是否影响当前页面聚合；若只是研究线索，放在 docs 或 dossiers，不污染当前注册字段。
- 能通过 `npm run validate-data`。
- 若是长期扩展，必须新增或关联一个 GitHub issue，避免散落在单次提交里。

## 近期拆分队列

| 优先级 | 建议 issue | 不确定点/扩展点 |
| --- | --- | --- |
| P3 | [#13](https://github.com/pacoxu/football-research-sandbox/issues/13) 中国 U20 2025 终报名和正赛技术统计 | 两版 23 人名单边界、门将替换和四场 appearances/goals/minutes 已完成并加入聚合校验。 |
| P3 | [#14](https://github.com/pacoxu/football-research-sandbox/issues/14) 中国 U17 2026 终报名、后续集训、观察池边界字段 | 已新增 `roster_status` 与 archive `roster_boundary`；第四期集训仍有 3 个未建档名字。 |
| P3 | [#15](https://github.com/pacoxu/football-research-sandbox/issues/15) 当前中国留洋 `overseas_status` 模型 | 17 名当前注册与 3 名回流样本已状态化；试训传闻须达到来源门槛后再进入 `trial-watch`。 |
| P3 | [#16](https://github.com/pacoxu/football-research-sandbox/issues/16) 日韩青训体系与球员来源层 | 92 人基础层、16 人深度样本、体系页和 SQLite 已完成；合并后可关闭。 |
| P4 | [#17](https://github.com/pacoxu/football-research-sandbox/issues/17) 亚洲其他国家 U17/U20/U23 对照组 | [#55 来源审计](research/issue-55-iran-remaining-u20-u23-source-audit.md) 已确认 10 个组合可直接录入 23 人；伊朗 U23 2024、U17 2026 未参赛。 |
| P4 | [#18](https://github.com/pacoxu/football-research-sandbox/issues/18) FIFA 中国参赛档案 | 2002 世界杯和早期 U16/U20 世界赛资料需要统一旧赛事名称。 |
| P4 | [#19](https://github.com/pacoxu/football-research-sandbox/issues/19) AFC U 系列 source_version 字段 | 近期 3 届试点已落地；后续扩到余下 AFC U 系列历史届次。 |
| P4 | [#20](https://github.com/pacoxu/football-research-sandbox/issues/20) 五大联赛之外的亚洲教练扩展 | 欧洲非五大、AFC 国家队、J/K/中超/西亚联赛不应混入五大联赛主表。 |
