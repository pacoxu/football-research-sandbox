# 来源政策与冲突处理

更新时间：2026-06-28

本政策说明数据进入仓库前如何判断来源可信度、如何交叉验证，以及遇到冲突时如何记录。更细的字段枚举见 `docs/research/data-governance-and-quality-rules.md`。

## 来源优先级

| 优先级 | 来源类型 | 可支撑的事实 | 注意事项 |
| --- | --- | --- | --- |
| 1 | FIFA、AFC、各足协、联赛、赛事组委会官方页面或 PDF | 报名名单、赛程赛果、比赛报告、官方征召、官方注册。 | 记录发布日期、版本和核查日期。 |
| 2 | 俱乐部官网、俱乐部 squad、俱乐部公告、学校或大学官方队页 | 当前注册、青训路径、学校归属、转会或任命公告。 | 注意页面时点，旧 squad 不等于当前注册。 |
| 3 | 官方比赛中心、联赛技术统计、权威统计库 | 出场、进球、分钟、比赛名单。 | 统计范围要分联赛、杯赛、青年队和梯队。 |
| 4 | 可靠媒体、通讯社、采访、新闻稿 | 背景、转会线索、冲突解释、补充路径。 | 不应单独覆盖官方注册字段。 |
| 5 | Transfermarkt、Wikipedia、公开数据库、球探平台 | 检索入口、历史索引、交叉验证、身价快照。 | 不作为唯一强事实；平台字段可能滞后或有误。 |
| 6 | 社媒、短视频、论坛、二手汇总 | 线索或待核材料。 | 不直接进入强事实字段，可放入 notes 或待核清单。 |

## 交叉验证规则

关键事实至少满足以下之一：

- 有一个官方来源直接支撑。
- 有一个俱乐部/联赛来源直接支撑。
- 有两个以上独立可信来源互相一致。
- 只有单一非官方来源时，标为 `provisional` 或 `needs-review`，不要提升为强事实。

关键事实包括：

- 球员生日、国籍或协会归属。
- 当前注册俱乐部。
- 正式报名、征召、退出或出场状态。
- 转会或租借生效日期。
- 教练任命、任期、联赛层级和战绩。
- 赛事日期、赛果、名单和比赛统计。

## 冲突处理

来源冲突时，按以下顺序处理：

1. 保留原字段，不直接覆盖。
2. 在 `verification.status` 使用 `mixed-source`、`conflict`、`needs-review` 或 `stale`。
3. 在 `verification.notes` 写清楚冲突字段、冲突来源和暂用口径。
4. 如果冲突影响统计或页面展示，拆 issue 跟踪。
5. 等官方或更高优先级来源确认后，再更新强事实字段。

常见冲突包括：

- 中英文名、日韩本名和转写不一致。
- AFC 报名俱乐部与俱乐部官网当前 squad 不一致。
- Transfermarkt 转会节点早于官方注册生效日。
- 媒体称“加盟”但联赛或俱乐部注册未更新。
- 历史赛事名称、年龄段名称或赛事年份口径不同。

## 当前注册与未来生效

`registration_club` 只记录当前有效注册。已公告但未生效的转会，应使用 `squad_status: "pending-transfer"`，并把未来俱乐部写入 `training_pathway`、`tournament_participation.note` 或 `verification.notes`。

试训、短训、商业选拔和观察线索不计入当前留洋。当前中国留洋样本不是官方全量人数，只是仓库中已经结构化并满足当前来源口径的样本。

中国球员只有 `overseas_status: "active-registered"` 才进入当前留洋统计。`pending-effective` 必须保留当前有效注册并配套 `pending-transfer` 记录；`trial-watch` 必须有 `tracked` 记录和可复核来源；`returned` 必须能在 `training_pathway` 中找到海外路径。经纪公司合作、媒体“有意”或未落地传闻不足以单独支撑 `trial-watch`。

## 来源证据模板

新增或修正关键事实时，建议在 PR 或 issue 中提供：

```text
字段：registration_club.name
主张：NK Lokomotiva Zagreb
来源：AFC U17 2026 Final Squad Lists
链接：https://...
页面字段：club / squad list
核查日期：2026-06-28
备注：AFC 终报名支撑赛事时点注册；当前俱乐部官网仍需后续复核。
```

结构化数据中应同步维护：

- `external_links[].type`
- `external_links[].label`
- `external_links[].url`
- `verification.status`
- `verification.last_checked`
- `verification.notes`
- 可选的 `source_layers[]` 或 `verification.evidence[]`

## 死链处理

发现来源失效时，不要直接删除链接。先找同站新 URL、官方 PDF、互联网档案或替代来源。旧链接仍有证据价值时，保留并在 notes 标记失效日期。
