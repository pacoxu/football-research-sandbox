# 中国 U20 2025 终报名与正赛技术统计

更新时间：2026-07-11

本文件对应 [issue #13](https://github.com/starryjog/football-research-sandbox/issues/13)，记录中国队在 AFC U20 Asian Cup China 2025 的名单版本差异、逐人出场和分钟口径。结构化结果位于 `data/raw/tournament-archive.json` 的 `afc-u20-2025.china_player_statistics`，由 loader 合并到球员的 `tournament_participation`。

## 验收结果

- 原始 AFC final registration：23 人。
- 更新版 AFC squad list：23 人。
- 两个版本合计涉及 24 名球员，其中 22 人重合。
- 门将 22 号发生版本变化：原始名单为 Yuan Jianrui，更新名单及四场 Match Summary 均为 Zhang Haoran。
- 中国队四场比赛共使用 20 人，累计 61 人次出场、44 次首发、3960 球员分钟和 8 个进球。

## 分钟口径

- 每场以 90 分钟为基数，四场均无加时赛。
- 半场换人按第 45 分钟计算。
- 其他换人按 Match Summary 标注分钟计算。
- 伤停补时不额外累加到球员分钟，因此每场球队总分钟固定为 `11 × 90 = 990`，四场合计 3960。
- 未进入实际赛事名单或进入名单但未出场的球员记 0 次、0 分钟，不保留 `null`。

## 官方来源

- [AFC 原始 final squad registration](https://assets.the-afc.com/2025_AFC_U20_Asian_Cup/Finals/Downloads/Squads/AFC-U20-Asian-Cup-China-2025%E2%84%A2-Final-Squad-Registration.pdf)
- [AFC 更新版 squad list](https://assets.the-afc.com/2025_AFC_U20_Asian_Cup/Finals/Downloads/Squads/AFC-U20-Asian-Cup-China-2025-Squad-List.pdf)
- [China PR 2-1 Qatar Match Summary](https://imageoss.thecfa.cn/upload/file/20250214/1739513637.pdf)
- [Kyrgyz Republic 2-5 China PR Match Summary](https://imageoss.thecfa.cn/upload/file/20250214/1739682556.pdf)
- [China PR 1-2 Australia Match Summary](https://imageoss.thecfa.cn/upload/file/20250214/1739887502.pdf)
- [Saudi Arabia 1-0 China PR Match Summary](https://imageoss.thecfa.cn/upload/file/20250214/1740363646557.pdf)

## 维护规则

`npm run validate-data` 会检查原始和更新名单各为 23 人、版本感知球员记录共 24 人、四份 Match Summary 来源仍在，并复算出场、首发、分钟和进球总数。球员文件中的赛事统计由 archive 集中维护，避免同一组逐场数据在多个球员文件中重复编辑。
