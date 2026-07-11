# 日韩 U17/U23 青训路径来源层补充

更新时间：2026-07-11

本文件对应 [issue #16](https://github.com/starryjog/football-research-sandbox/issues/16)，用于记录日本、韩国 U17/U23 球员的 `source_layers` 首批补充范围。四支 23 人终报名名单均已进入球员库，并已为 13 名重点样本建立多层来源；issue 的首批样本验收已完成，余下球员按同一结构进入常规维护队列。

## 字段口径

`source_layers` 是球员级可选字段。每条来源层至少说明：

- `type`：来源层类型。
- `label`、`url`、`checked_at`：来源标题、链接和核验日期。
- `confidence`：`high`、`medium`、`low`。
- `fields`：该来源支撑的字段。
- `claim`：该来源能证明的事实边界。

当前允许类型：

| 类型 | 说明 |
| --- | --- |
| `afc-registration` | AFC final registration 或 final squad PDF，优先支撑赛事报名、报名俱乐部、出生日期、位置。 |
| `national-fa-profile` | JFA/KFA 队伍页、名单公告或国家队 profile。 |
| `club-academy-profile` | 俱乐部、青训梯队、军队球队官网或俱乐部公告。 |
| `school-profile` | 高中、大学、校园足球队资料；只有 AFC 报名字段时需标为 `medium` 并写明后续补个体页。 |
| `league-registration` | J.League、K League 当前注册页或转会公告。 |

## 首批样本

| 队伍 | 球员 | 补充层 | 说明 |
| --- | --- | --- | --- |
| Japan U17 | Rei Ono | AFC、JFA、club-academy | 海外梯队报名归属：Bayer 04 Leverkusen U17。 |
| Japan U17 | Aran Sato | AFC、JFA、club-academy | 海外梯队报名归属：RC Strasbourg Alsace。 |
| Japan U17 | Takaya Sekine | AFC、JFA、school | 学校路径样本：Shizuoka Gakuen High School。 |
| Japan U23 | Masataka Kobayashi | J.League、JFA、FC Tokyo、AFC | 职业体系 + 国家队节点，区分当前联赛注册和赛事报名。 |
| Japan U23 | Kaito Tsuchiya | J.League、JFA、AFC | 职业体系 + U21 国家队节点。 |
| Japan U23 | Kosei Ogura | AFC、school | 大学路径样本：Hosei University；个体大学页待补。 |
| Korea Republic U17 | Seung Min Lee | AFC、KFA、school | 高中路径样本：Boin High School。 |
| Korea Republic U17 | Geon Woo Park | AFC、KFA、club-academy | K League 俱乐部 U18 梯队样本：Ulsan HD FC U18。 |
| Korea Republic U23 | Moon Hyunho | AFC、Gimcheon、Portimonense | Gimcheon Sangmu 与 Portimonense 来源分层保留，状态改为 `mixed-source` 待复核。 |
| Korea Republic U23 | Bae Hyunseo | K League、AFC | 当前 K League 注册 + U23 赛事报名。 |
| Korea Republic U23 | Lee Chanouk | AFC、Gimcheon | 军队球队报名归属样本：Gimcheon Sangmu；个体页待补。 |
| Korea Republic U23 | Kim Taewon | J.League、AFC | 日本联赛注册的韩国 U23 留洋样本。 |
| Korea Republic U23 | Kim Yonghak | Portimonense、AFC | 葡萄牙注册的韩国 U23 留洋样本。 |

## 覆盖验收

| 队伍 | AFC 终报名 | 多层来源样本 | 已覆盖来源类型 |
| --- | ---: | ---: | --- |
| Japan U17 | 23/23 | 3 | AFC、JFA、俱乐部青训、学校 |
| Japan U23 | 23/23 | 3 | AFC、JFA、俱乐部、学校/大学、J.League 注册 |
| Korea Republic U17 | 23/23 | 2 | AFC、KFA、俱乐部青训、学校 |
| Korea Republic U23 | 23/23 | 5 | AFC、俱乐部/军队球队、J.League/K League 注册 |

`npm run validate-data` 会为四支队伍持续检查：终报名名单保持 23 人、每队至少 2 名多层来源样本、每名样本同时具备 AFC 报名层和至少一种补充来源层，以及队伍层面的必需来源类型不丢失。

## 常规维护队列

- 为所有 U17/U23 AFC 终报名球员补至少一条 `afc-registration`。
- 给日韩 U17 的海外梯队样本补个体俱乐部 profile，而不是只依赖 AFC club 字段。
- 给日本 U23 大学样本补大学队个体页或全队 roster 页。
- 给韩国 U23 Gimcheon Sangmu 样本补 K League 或俱乐部个体页，降低 organization-level source 的 `low` confidence。
- 对 Moon Hyunho 的 Gimcheon/Portimonense 双来源做同名、注册时点和 URL 误配复核。
- 后续前端如需要展示来源层，可在 player detail 的来源区域聚合 `source_layers`，但当前数据已经进入 `data/site/players.json` 和 SQLite `player_source_layers`。

以上属于首批验收后的覆盖扩展和置信度维护，不阻塞 issue #16 关闭。
