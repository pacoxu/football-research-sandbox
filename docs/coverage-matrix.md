# 领域内容覆盖矩阵与缺口清单

更新时间：2026-06-27

本文件对应 issue #8，用来把后续扩展从“继续加球员”转成可跟踪的覆盖计划。详细补采样本和字段清单见根目录 `research-collection-outline-2026-06-27.md`；本文件只维护模块级状态、来源要求、完成标准、最近核查日期和后续 issue 拆分方向。

## 总览

当前聚合球员库共 171 人：

| 国家/地区 | 人数 | 当前定位 |
| --- | ---: | --- |
| China PR | 65 | 中国 U17/U23、当前留洋、中超/国内青年、足球小将和历史样本主线 |
| Japan | 52 | 日本 U17/U23 完整终报名种子 + 留洋历史对照 |
| Korea Republic | 50 | 韩国 U17/U23 完整终报名种子 + 留洋历史对照 |
| Uzbekistan | 4 | U17 亚洲对照组关键样本 |

年龄段分布：

| 年龄段 | 人数 | 说明 |
| --- | ---: | --- |
| u17 | 81 | 东亚三队 U17 + 中国补充观察 + 乌兹别克对照 |
| u20 | 3 | 主要是当前观察/未来留洋线索，缺中国 U20 2025 完整名单 |
| u21 | 19 | 中超/国内青年观察和项目样本 |
| u23 | 68 | 中日韩 U23 完整终报名与中国留洋/中超样本 |

## 覆盖矩阵

| 模块 | 当前覆盖 | 状态 | 来源要求 | 完成标准 | 最近核查 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| 中国 U17/U20/U23 完整名单 | 中国 U23 2026 已结构化 23/23；中国 U17 2026 终报名在 archive 为 23 人，球员库中 24 人带 `afc-u17-2026` 参与记录；中国 U20 2025 暂无专门球员文件。 | 部分完成 | AFC final registration、CFA 集训/报名通知、AFC match reports。 | 每个年龄段有独立名单文件或清晰 roster flag，区分终报名、集训、观察池；字段含生日、位置、注册俱乐部、来源和核查日期。 | 2026-06-27 | 拆中国 U20 2025 终报名；补中国 U17 roster 边界字段。 |
| 日本、韩国 U17/U23 青训路径 | 日本 U17/U23、韩国 U17/U23 均为 23/23 终报名种子；俱乐部、学校、青训路径仍主要停留在 AFC 注册字段。 | 种子完成，来源待扩 | JFA/KFA、J/K 联赛俱乐部、学校、大学队、联赛注册页。 | 每名球员至少有 AFC 基础源；重点样本补 national-fa、club-academy、school/university 三层来源。 | 2026-06-27 | 拆日韩 U17/U23 补源 issue。 |
| 中国 2026 中超 U21/U23 样本 | 65 名中国球员；14 人带 `csl-2026` tag，13 人带 `csl-u21-current`，15 人带 `u21-watch`。 | 种子完成，统计缺口大 | 中超/中甲/中乙官方数据、俱乐部战报、足协杯与 U21 联赛官方资料。 | 一线队联赛、杯赛、U21 联赛分开统计；每名样本有 apps/goals/minutes/source_checked_at。 | 2026-06-27 | 拆中超 2026 青年统计口径与更新节奏 issue。 |
| 当前中国留洋样本 | 12 名当前留洋样本：刘邵子洋、徐彬、王博豪、林子皓、张家鸣、汪修昊、万项、金昱成、吕孟洋、刘凯源、李东宸、张林峒。 | 当前注册种子完成，状态字段待细化 | 俱乐部注册页、联赛名单、CFA 集训归属、可靠媒体交叉源。 | 增加 `overseas_status` 或等价字段，区分 current registered、pending effective、trial watch、returned、historical only。 | 2026-06-27 | 拆 current overseas 状态模型 issue。 |
| 中国五大联赛历史出场榜 | `overseas-history.json` 已有中国 featured_records 16 条，big-five checklist 13 人；蒿俊闵、蒋光太、李金羽、李可、李玮锋、张呈栋仍适合拆成更明确的 featured records。 | 部分完成 | FBref/WorldFootball/Wikipedia/Transfermarkt 交叉源，优先正式联赛出场统计。 | checklist 每名球员都有 featured record 或明确 excluded note；五大联赛顶级联赛、梯队、低级别分开。 | 2026-06-27 | 拆缺失 featured record issue。 |
| 亚洲其他国家对照组 | 乌兹别克 U17 4 人样本；澳大利亚、沙特、伊朗、卡塔尔暂无同等结构化对照组。 | 初始样本 | AFC final registration、AFC match reports、各国足协/俱乐部 profile。 | 每国每年龄段先补 8-12 名核心样本；有完整名单 PDF 后扩到 23 人。 | 2026-06-27 | 拆亚洲对照组扩展 issue。 |
| AFC U 系列赛事历史成绩 | `tournaments.json` 覆盖 12 个赛事卡；`tournament-archive.json` 覆盖 AFC U23/U20/U17/U16 主干和部分 FIFA 档案。 | 主干完成，版本字段缺失 | AFC 官方赛程、final report、final registration PDF、match report。 | 每届赛事有 source_version、source_checked_at、名称变更说明、中国成绩和冲突说明。 | 2026-06-27 | 拆 AFC source_version 字段 issue。 |
| 世界杯、世青赛、世少赛中国队档案 | 已补 2002 世界杯中国队最终名单、三场小组赛、逐人 minutes、主教练和 qualification_path；已有 2005 U17、2005 U20、2007 土伦档案，并新增 U20/U17 世界赛历史名称和中国参赛年份索引。2005 U17/U20 已补 coach 与 qualification_path，逐人 minutes 仍需从 FIFA 技术报告或 match centre 抽取。 | 部分完成 | FIFA archive、AFC qualification、CFA 历史资料、权威赛事数据库。 | 中国参赛年份都有 squad、matches、goals、minutes、coach、qualification_path。 | 2026-06-27 | 继续拆 1983-2003 U20/U16/U17 世界赛逐届 squad、matches、minutes 和来源冲突。 |
| 董路足球小将逐名档案 | `donglu-football-boys` 专题有 4 个 roster_views、18 条 timeline；球员库中 14 人带 `donglu-football-boys` tag。 | 专题完成，逐名拆分进行中 | 公开报名表、赛事平台、视频/图文原始线索、俱乐部/学校后续注册。 | 区分 donglu-core、tournament-only、short-camp、overseas-supported、uncertain；逐名字段可追踪。 | 2026-06-27 | 拆足球小将逐名档案 issue。 |
| 五大联赛亚洲教练 | AFC 主口径 2 人，广义边界 7 人；已有战绩口径和土耳其/以色列边界说明。 | 主表完成，边界可继续扩展 | 官方联赛统计、俱乐部任命公告、权威数据库。 | 每名教练只统计五大联赛顶级联赛一线队联赛场次；杯赛/欧战/助教不混入。 | 2026-06-27 | 拆欧洲非五大、AFC 国家队和亚洲顶级联赛教练扩展 issue。 |

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
| P3 | [#13](https://github.com/starryjog/football-research-sandbox/issues/13) 中国 U20 2025 终报名和正赛技术统计 | AFC final squad PDF 与逐场 minutes 来源需要确认。 |
| P3 | [#14](https://github.com/starryjog/football-research-sandbox/issues/14) 中国 U17 2026 终报名、后续集训、观察池边界字段 | 当前球员库记录数与 23 人终报名之间需要可读区分。 |
| P3 | [#15](https://github.com/starryjog/football-research-sandbox/issues/15) 当前中国留洋 `overseas_status` 模型 | 张家鸣/Burnley/Vozdovac、魏祥鑫未来生效、试训池都需要状态化。 |
| P3 | [#16](https://github.com/starryjog/football-research-sandbox/issues/16) 日韩 U17/U23 俱乐部、学校、青训路径补源 | 学校/大学/俱乐部来源层级需要统一字段。 |
| P4 | [#17](https://github.com/starryjog/football-research-sandbox/issues/17) 亚洲其他国家 U17/U20/U23 对照组 | 是否先 8-12 核心样本还是直接 23 人完整名单，按来源可得性决定。 |
| P4 | [#18](https://github.com/starryjog/football-research-sandbox/issues/18) FIFA 中国参赛档案 | 2002 世界杯和早期 U16/U20 世界赛资料需要统一旧赛事名称。 |
| P4 | [#19](https://github.com/starryjog/football-research-sandbox/issues/19) AFC U 系列 source_version 字段 | AFC 页面、PDF、二级数据库之间的版本冲突需要记录。 |
| P4 | [#20](https://github.com/starryjog/football-research-sandbox/issues/20) 五大联赛之外的亚洲教练扩展 | 欧洲非五大、AFC 国家队、J/K/中超/西亚联赛不应混入五大联赛主表。 |
