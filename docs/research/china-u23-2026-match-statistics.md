# 中国 U23 2026 终报名与逐场技术统计

更新时间：2026-07-19

本文件对应 [issue #8](https://github.com/pacoxu/football-research-sandbox/issues/8)。结构化结果位于 `data/raw/tournament-archive.json` 的 `afc-u23-2026`，loader 再按 `competition_id + player_id` 合并到球员的 `tournament_participation`。

## 验收结果

- AFC 终报名保持 23 人。
- 中国队六场比赛均保存 11 名首发、替补登场与未使用替补，并记录中国队牌事件。
- 六场合计 66 次首发，21 名球员实际出场，4 个正式比赛进球。
- 标准分钟合计 `11 × (5 × 90 + 120) = 6270`。
- 两名替补门将栾毅、霍深坪确认 0 出场；毛伟杰在半决赛第 90 分钟登场，记 1 次替补出场、0 标准分钟。

## 日期、赛果与冲突处理

- 赛事日期统一使用沙特阿拉伯当地比赛日，赛事范围为 2026-01-06 至 2026-01-24。
- 北京时间造成的跨日只用于说明，不改写 archive 日期。
- 八强对手为乌兹别克斯坦，120 分钟 0 比 0，中国队点球大战 4 比 2 晋级；旧档案中的约旦和 5 比 4 已更正。
- 点球大战进球不计入球员正式比赛进球。

## 分钟算法

- 常规比赛按 90 分钟、八强加时赛按 120 分钟计算。
- 伤停补时不额外累加。
- 半场换人按第 45 分钟计算。
- 八强第 90+4 分钟、加时开始前完成的换人按第 90 分钟计算，因此替补球员获得 30 分钟。
- 第 90 分钟登场且比赛无加时的球员保留出场次数，但标准分钟为 0。

## 来源层级

1. [AFC 技术报告](https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/AFC-U23-Asian-Cup-Saudi-Arabia-2026-Technical-Report.pdf)：赛事范围、赛果、最终排名与名单基准。
2. CFA 官方战报：[伊拉克](https://www.thecfa.cn/zhongguozhidui/20260109/37180.html)、[澳大利亚](https://www.thecfa.cn/zhongguozhidui/20260112/37182.html)、[乌兹别克斯坦八强](https://www.thecfa.cn/xinwen/20260118/37220.html)：中国队比赛叙事、关键换人和八强赛果。
3. [JFA 决赛记录](https://www.jfa.jp/eng/national_team/u23_2026/afc_u23_asiancup_2026/final/match_page/m32.html)：决赛日期、赛果和日本队进球事件。
4. [FotMob 中国 U23 赛程与 Opta 事件页](https://www.fotmob.com/teams/317240/fixtures/china-u23)：在官方公开材料缺少完整事件流时补齐首发、换人和牌数。

官方来源决定名单边界、日期和赛果；可信比赛数据库只补充官方公开材料未完整披露的阵容级字段。出现冲突时不以二级事件源覆盖官方结果。

## U17 同批审计

张君豪、孙臣曦、袁博涵均由 CFA 第四期集训通知确认身份与集训单位，但截至本次核查，没有公开可靠足球来源同时提供完整生日和可独立验证的注册归属。因此三人不创建稳定球员 ID，统一记录为 `later-camp-callup` 与 `insufficient-evidence`，不计入 AFC U17 终报名 23 人。
