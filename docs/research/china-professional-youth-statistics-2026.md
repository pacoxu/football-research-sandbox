# 2026 中国职业联赛青年球员统计口径

本文件对应 [issue #7](https://github.com/pacoxu/football-research-sandbox/issues/7)。结构化球员记录位于 `data/raw/players/`，赛事边界位于 `data/raw/tournaments.json`。

## 赛事边界

| `competition_id` | 层级 | 计入 | 不计入 |
| --- | --- | --- | --- |
| `csl-2026` | 成年顶级职业联赛 | 中超一线队联赛 | 中甲、中乙、足协杯、U21、亚冠、超级杯 |
| `china-league-one-2026` | 成年第二级职业联赛 | 中甲联赛 | 其他级别与杯赛 |
| `china-league-two-2026` | 成年第三级职业联赛 | 中乙联赛，包括实际代表 B 队出场 | 母队中超一线队统计 |
| `cfa-cup-2026` | 成年杯赛 | 中国足协杯 | 所有联赛与青年赛事 |
| `china-u21-league-2026` | U21 青年联赛 | U21 联赛 | 成年一线队和杯赛 |
| `china-champions-league-2026` | 成年业余第四级联赛 | 中冠联赛 | 中乙及以上职业联赛 |

租借、B 队或低级别报名只进入球员实际参赛的赛事。球员在同一赛季跨多个赛事出场时，为每个 `competition_id` 建立独立 `tournament_participation`，不生成“国内赛事总计”来替代分项数据。

## 统计字段

每条 2026 国内赛事参与记录都包含：

- `season`、`competition_level`；
- `appearances`、`starts`、`substitute_appearances`、`goals`、`minutes`；
- `stats_as_of`、`statistics_status`、`source_checked_at`、`statistics_sources`。

`complete` 表示已按截止日逐场复核；`partial` 表示公开来源只能确认部分比赛或字段。未知值使用 `null`，不从报名名单、新闻标题或其他赛事推算。只要首发和替补出场都已确认，两者之和必须等于总出场数。

## 来源优先级

1. 中国足协、赛事官方比赛报告或技术统计；
2. 参赛俱乐部官方战报；
3. 可追溯到具体比赛的权威赛事数据库或媒体报道；
4. 聚合站只用于发现线索或交叉检查，不单独支撑完整累计值。

当前赛事日历边界以[中国足协 2026 竞赛日历](https://www.thecfa.cn/lstz/20251120/37089.html)为基准，足协杯另参考[官方赛事入口](https://www.thecfa.cn/zuxiebei/index.html)。

## 更新节奏

- 每轮：更新已跟踪球员的新出场和新增来源；杯赛与 U21 联赛按各自轮次或阶段更新。
- 每月末：逐场复核累计出场、首发、替补、进球和分钟，并检查赛事 ID 是否混用。
- 转会、租借或 B 队变更：在确认实际报名或出场后新增对应赛事记录，不回写为原俱乐部一线队出场。
- 赛季结束：冻结最终快照，把全部 `partial` 项逐条复核或解释剩余缺口。
