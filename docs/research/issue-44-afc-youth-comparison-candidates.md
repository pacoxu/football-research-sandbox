# Issue #44：AFC 青年对照组分阶段补录

核查日期：2026-08-02
状态：泰国正式名单已落库；2034杯候选保持部分审计

## 本次范围

本批先处理 48 条中国球员注册口径逾期，再从 AFC 官方终报名补齐泰国 U17 2025、U20 2025、U23 2024、U23 2026 四届名单。另保留两条 2026 年第六届 2034杯 U12 总决赛线索：老挝 WILAIKUL NAGA（W.I.G NAGA）和 ASIA FUTURE STARS。两条线索用于测试“国家背景、俱乐部学院和邀请联队不能混算”的边界，不视为 AFC 官方国家青年队终报名。

## 泰国正式名单

| 赛事 | AFC 报名人数 | 生成结果 | 核查方式 |
| --- | ---: | --- | --- |
| AFC U17 Asian Cup 2025 | 23 | 完整 `final-squad` | PDF 第 12 页文本提取并渲染逐行核对 |
| AFC U20 Asian Cup 2025 | 23 | 完整 `final-squad` | 图像型 PDF 第 14 页高分辨率渲染逐行转录 |
| AFC U23 Asian Cup 2024 | 23 | 完整 `final-squad` | PDF 第 13 页文本提取并渲染逐行核对 |
| AFC U23 Asian Cup 2026 | 23 | 完整 `final-squad` | PDF 第 13 页文本提取并渲染逐行核对 |

四届合计 92 条赛事参与记录，按“国家 + 出生日期 + 规范化姓名”跨届去重后生成 84 个稳定泰国球员 ID。俱乐部字段统一标记为带日期的 `tournament-snapshot`，不把 AFC 报名时点写成当前俱乐部。

- [AFC U17 2025 final squad list](https://assets.the-afc.com/2025_AFC_U17_Asian_Cup/Finals/Downloads/AFC-U17-Asian-Cup-Saudi-Arabia-2025---Squad-Lists.pdf)
- [AFC U20 2025 final registration](https://assets.the-afc.com/2025_AFC_U20_Asian_Cup/Finals/Downloads/Squads/AFC-U20-Asian-Cup-China-2025%E2%84%A2-Final-Squad-Registration.pdf)
- [AFC U23 2024 squad list](https://assets.the-afc.com/2024_AFC_U23_Asian_Cup/Downloads/Squad_List/AFC-U23-Asian-Cup-Qatar-2024%E2%84%A2---Squad-Lists-%28Updated-April-16%29.pdf)
- [AFC U23 2026 final registration](https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/Finals/Squad_Lists/AFC-U23-Asian-Cup-2026-Final-Registration.pdf?source=url)

## 2034杯候选边界

| 候选 | 当前实体判断 | 已确认 | 未确认 | 落库决定 |
| --- | --- | --- | --- | --- |
| WILAIKUL NAGA（W.I.G NAGA） | 老挝青训学院队 | 2034杯主办方确认参赛；老挝媒体确认其学院属性 | 完整赛事报名表、球员法定姓名、生日、号码和注册组织 | 登记部分候选，`national_team_claim: false`，不创建球员 ID |
| ASIA FUTURE STARS | 邀请联队 | 公开赛事页确认以该队名参赛 | 完整名单、球员所属国家/机构、泰国足协关系 | 泰国只保留为 issue 线索上下文，不建立“泰国 U12”记录 |

## 来源边界

- [2034杯主办方账号：WILAIKUL NAGA 参赛确认](https://www.sina.cn/news/detail/5247676419670333.html)只支撑队名、老挝背景和参赛事实，没有球员名单。
- [Laotian Times：W.I.G NAGA 青训项目介绍](https://laotiantimes.com/2026/07/09/young-lao-footballers-win-international-titles-as-world-cup-fever-grows/)支撑学院属性和培养背景，不支撑老挝国家队身份。
- [苏州工业园区：第六届 2034杯赛程](https://www.sipac.gov.cn/szgyyqenglish/News/202607/6360874d98f04fe5a96d7745b8c81efe.shtml)支撑 2026-07-25 至 2026-08-01 的赛事边界。
- [2034杯公开赛事页](https://www.xiaojiangfc.com/cup/2034/)支撑两支队伍的公开赛程/赛果线索；该页面明确是公开资料整理页，不能替代官方报名表。

## 为什么不补零散球员

Issue #44 明确禁止用明星样本或预测名单补足完整名单。现阶段公开报道中的昵称、照片和比赛片段无法共同确认法定姓名、生日、球衣号码与注册机构，也无法证明 ASIA FUTURE STARS 的国别组成。为了保护未成年人信息并避免错误去重，本次 `known_player_count` 固定为 0。

生成脚本和 validator 会拒绝把这两条候选变成球员记录；测试同时要求 `2034-cup-2026` 在球员库中的参与记录为 0。

## 启动门槛处理

按 2026-08-01 执行 freshness audit，原有 58 条 30 天逾期中有 48 条属于中国球员注册字段。其中 37 条实际来自 AFC U17/U23 终报名，已改为带报名日期的 `tournament-snapshot`；其余 11 条补了逐字段复核来源。处理后中国逾期归零，只剩 10 条本轮范围外的日韩当前注册复核项，因此可以启动泰国官方完整名单导入，但不能据零散线索扩展老挝或 2034杯邀请联队人物。

## 后续升级条件

1. 获得赛事主办方、参赛机构或足协发布的完整报名表，并记录官方人数例外。
2. 每名球员至少具备可核姓名；生日、号码和注册机构缺失时必须逐字段保留未知，不能猜测。
3. ASIA FUTURE STARS 必须先核清选拔机构和国别组成，才能决定是否按泰国背景、跨国邀请队或其他项目归档。
4. 泰国后续年龄段继续只取 AFC 或泰国足协正式名单，不能复用本次 2034杯记录。
