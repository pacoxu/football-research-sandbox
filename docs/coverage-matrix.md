# 领域内容覆盖矩阵

更新时间：2026-06-27

本矩阵对应 GitHub issue #8，用于把后续补录从零散加人转成可跟踪的覆盖计划。详细球员清单和扩展样本见 [`research-collection-outline-2026-06-27.md`](../research-collection-outline-2026-06-27.md)。

## 总体规则

| 项 | 口径 |
| --- | --- |
| 最近核查日期 | 每一行必须记录 `last_checked`；当前矩阵统一核查到 2026-06-27。 |
| 来源优先级 | FIFA/AFC/CFA/JFA/KFA 官方文件、俱乐部/学校官网、联赛官网和比赛报告优先；数据库和媒体只作交叉核验或线索。 |
| 完成定义 | 不只写已有名单，还要能说明缺口、来源要求、落库位置和下一步完成标准。 |
| 冲突处理 | 按 `docs/research/data-governance-and-quality-rules.md` 使用 `verification.status` 和 notes 保留冲突。 |
| 关联 issue | #8: P3 建立领域内容覆盖计划与缺口清单。 |

## 覆盖状态

| 模块 | 当前覆盖 | 数据位置 | 来源要求 | 完成标准 | 状态 | last_checked |
| --- | --- | --- | --- | --- | --- | --- |
| 中国 U17/U20/U23 赛事完整名单 | 中国 U23 2026 已有 23 人终报名；中国 U17 2026 已有终报名和后续观察池；中国 U20 2025 赛事结果已归档但缺专门球员文件。 | `data/raw/players/china-u23-2026.json`, `data/raw/players/u17.json`, `data/raw/players/china-u17-2026-additions.json`, `data/raw/tournament-archive.json` | AFC final registration、CFA 集训通知、AFC match reports。 | 增加 U17 终报名/观察池边界字段；新增 `data/raw/players/china-u20-2025.json`；三条年龄线都能列出完整 roster、俱乐部/学校、出场/进球/分钟缺口。 | 部分完成 | 2026-06-27 |
| 日本、韩国 U17/U23 路径来源 | 日本 U17/U23、韩国 U17/U23 四份 2026 终报名各 23 人已入库，当前多以 AFC 注册俱乐部为初值。 | `data/raw/players/japan-u17-2026.json`, `data/raw/players/japan-u23-2026.json`, `data/raw/players/korea-republic-u17-2026.json`, `data/raw/players/korea-republic-u23-2026.json` | AFC 报名表作基础；JFA/KFA、J/K 联赛、俱乐部青训页、学校官网补路径。 | 每名球员至少标明 `source_layer`，区分 `afc-registration`、`national-fa-profile`、`club-academy-profile`、`school-profile`、`league-registration`。 | 待扩展 | 2026-06-27 |
| 中国 2026 中超 U21/U23 样本统计口径 | 已有 16 个中超/国内青年观察样本，多数 apps/goals/minutes 为空。 | `data/raw/players/china-csl-2026-youth.json` 和带 `csl-2026` tag 的球员记录 | 中超/中甲/中乙/中冠官方数据、足协杯 match reports、俱乐部战报、U21 联赛官方记录。 | 联赛、足协杯、低级别联赛、U21 联赛单独建 `competition_id`；不混算一线队正式联赛和青年联赛。 | 待补统计 | 2026-06-27 |
| 当前中国留洋样本状态 | 当前注册样本、未来生效转会、试训观察和回流样本已在大纲中拆分；数据文件尚未统一状态字段。 | `data/raw/players/china-overseas-current.json`, `data/raw/players/china-u23-2026.json`, `data/raw/overseas-history.json` | 俱乐部注册页、官方签约/租借公告、联赛名单、CFA 集训名单；试训报道只进观察池。 | 增加或等价维护 `overseas_status`: `active-registered`, `pending-effective`, `trial-watch`, `returned`, `historical-only`。 | 口径已定，字段待落库 | 2026-06-27 |
| 历史中国五大联赛出场榜 featured records | checklist 已有；尚缺蒿俊闵、蒋光太、李金羽、李可、李玮锋、张呈栋 6 个 featured record。 | `data/raw/overseas-history.json` | 五大联赛顶级联赛官方/权威统计、FBref/WorldFootball/Transfermarkt 交叉核验、俱乐部历史资料。 | checklist 中每名中国球员都有 `featured_record_id` 或明确排除理由；只统计五大联赛顶级联赛正式出场，不混入梯队和低级别。 | 明确缺口 | 2026-06-27 |
| 亚洲其他国家对照组 | 仅乌兹别克斯坦 U17 有 4 人关键样本；澳大利亚、沙特、伊朗、卡塔尔主要停留在赛事卡。 | `data/raw/players/u17.json`, `data/raw/tournaments.json`, `data/raw/tournament-archive.json` | AFC final squad lists、各协会官网、俱乐部/联赛注册、AFC 技术报告。 | 每个重点协会在 U17/U20/U23 至少先有 8-12 名核心样本；有终报名 PDF 的赛事扩成 23 人完整名单。 | 待建对照池 | 2026-06-27 |
| AFC U 系列赛事历史成绩 | 已覆盖 U23 2020/2022/2024/2026、U20 2023/2025、U17 2023/2025/2026、U16 2018、U17 2004。 | `data/raw/tournaments.json`, `data/raw/tournament-archive.json` | AFC tournament home、match schedule PDF、final report、stats archive；Wikipedia 仅作二级入口。 | 每届记录有赛事名称变更、主办地、日期、冠军/四强、中国成绩、source version 和 source conflict note。 | 主干完成，版本字段待补 | 2026-06-27 |
| 世界杯、世青赛、世少赛中国队档案 | 已有 U17 2005、U20 2005、世界杯 2022/2026、U20 2023/2025、U17 2023/2025/2026；2002 世界杯和更早 U 系列历史仍需补。 | `data/raw/tournament-archive.json` | FIFA archive、FIFA match reports、AFC 资格赛资料、CFA 或权威通讯社资料。 | 中国参赛届次具备 squad、matches、lineups、goals、cards、coach、qualification_path、source links；未晋级届次有资格赛路径。 | 部分完成 | 2026-06-27 |
| 董路足球小将逐名档案进度 | 专题卡、公开批次主干和 14 个带 `donglu-football-boys` tag 的球员已存在；2012/2013 文字名单和 2034 杯平台名单仍需拆分。 | `data/raw/dossiers.json`, `data/raw/projects.json`, `data/raw/players/*.json` | 官方/公开报名表、B 站/赛事平台原始视频图文、CFA 集训名单、俱乐部/学校路径来源。 | 按 `donglu-core`、`donglu-tournament-only`、`donglu-short-camp`、`donglu-overseas-supported`、`donglu-uncertain` 拆身份；逐名档案标明批次、来源和置信度。 | 进行中 | 2026-06-27 |
| 五大联赛亚洲教练口径 | AFC 主口径 2 人；广义亚洲边界口径 7 人；已说明土耳其/以色列不进 AFC 主口径。 | `data/raw/big-five-asian-coaches.json` | 五大联赛官方/权威主教练列表、俱乐部公告、联赛赛程战绩、Wikipedia manager lists 作交叉入口。 | 联赛战绩只统计五大联赛顶级联赛一线队主教练/代理主教练场次；助教、青年队、杯赛、欧战不混入。 | 口径完成，后续维护 | 2026-06-27 |

## 优先顺序

1. 新增 `data/raw/players/china-u20-2025.json`，把中国 U20 2025 终报名和正赛统计补成完整结构。
2. 给中国 U17 2026 增加终报名、赛后集训、观察池边界，避免 23 人终报名和 31 人观察池混用。
3. 给当前中国留洋样本落 `overseas_status` 或等价状态字段。
4. 补中超 2026 青年样本的出场、进球、分钟，按一线队和 U21 联赛分开。
5. 给五大联赛出场榜缺失的 6 名中国球员补 `featured_records`。
6. 扩日韩 U17/U23 的学校、俱乐部青训和联赛注册来源。
7. 先按 8-12 人核心样本建立澳大利亚、沙特、伊朗、卡塔尔、乌兹别克斯坦对照组。
8. 补 2002 世界杯和早期世青赛、世少赛中国队档案。
9. 拆董路足球小将逐名档案和 2034 杯赛事平台名单。
10. 给 AFC U 系列历史赛事补 `source_version`、`source_checked_at`、`source_conflict_note`。

## 关联资料

- 详细补采大纲：`research-collection-outline-2026-06-27.md`
- 来源与质量控制：`docs/research/data-governance-and-quality-rules.md`
- 亚洲/中国球员与教练收集口径：`docs/research/asian-chinese-player-coach-collection.md`
- 中国联赛层级和地方赛事口径：`docs/research/china-league-pyramid-and-regional-super-leagues.md`
