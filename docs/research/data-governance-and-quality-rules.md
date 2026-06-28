# 数据治理、来源状态与质量控制规则

更新时间：2026-06-28

这份规则对应 issue #6，用于把球员、赛事、教练和专题资料的来源状态制度化。原则是：能由程序校验的先进入 `scripts/validate-data.mjs`，不能自动判断真假的内容先用模板和复核规则约束。

## verification.status

| 状态 | 使用标准 | 是否可作为当前事实 |
| --- | --- | --- |
| `verified` | 官方来源、俱乐部/赛事注册页，或两个以上可信来源交叉一致。 | 可以。 |
| `mixed-source` | 核心事实可确认，但来源之间存在字段差异，例如中文名、注册俱乐部、借租路径或日期不完全一致。 | 可以，但必须在 `verification.notes` 写明分歧。 |
| `provisional` | 只有单一可信新闻、俱乐部公告尚未形成注册页，或来源可信但关键字段不完整。 | 可进入观察字段，不宜直接作为当前注册。 |
| `needs-review` | 资料缺少关键链接、链接失效、字段过旧或上下文不清。 | 不应作为强事实。 |
| `conflict` | 官方名单、俱乐部注册、媒体报道互相矛盾，且无法判断主次。 | 不应覆盖既有事实。 |
| `stale` | 超过复核期限且涉及当前注册、现役名单或转会状态。 | 需要复核后再使用。 |
| `rejected` | 已确认错误、误传或同名误配。 | 只保留在 notes/dossiers 里解释排除原因。 |

最低要求：

- 每个球员必须有 `verification.status`、`verification.last_checked` 和 `verification.notes`。
- `last_checked` 使用 `YYYY-MM-DD`。
- `notes` 必须说明资料为什么可信，或冲突在哪里。

## external_links.type

| 类型 | 说明 | 典型用途 |
| --- | --- | --- |
| `official` | 足协、赛事、联赛、政府或组委会官方页面/PDF。 | 报名名单、集训名单、赛程赛果、任命公告。 |
| `club` | 俱乐部官网、官方 squad、官方公告。 | 当前注册、签约、租借、梯队归属。 |
| `stats` | 统计数据库或赛事数据站。 | 出场、进球、比赛名单交叉核验。 |
| `news` | 媒体报道、通讯社稿件。 | 转会线索、采访、背景信息。 |
| `wikipedia` | Wikipedia 条目。 | 历史索引和交叉入口，不作唯一来源。 |
| `transfermarkt` | Transfermarkt。 | 转会、身价、俱乐部路径辅助核验。 |
| `school` | 学校、校园足球、青训机构页面。 | 学校/青训路径。 |
| `profile` | 球员个人资料页、联赛 profile。 | 基础档案。 |
| `match` | 单场比赛报告、比赛中心。 | 出场或名单状态。 |
| `reference` | 汇总参考、规则说明、背景资料。 | 口径说明和二级索引。 |

程序校验要求：每条 `external_links` 必须带 `type`、`label`、`url`，且 `url` 必须是 `http` 或 `https`。

## source_layers

`source_layers` 是可选增强字段，用来说明某个事实由哪一层来源支撑。它不替代 `external_links`：`external_links` 仍是原始外链清单，`source_layers` 则负责把外链、字段和事实 claim 绑定起来。

允许类型：

| 类型 | 使用场景 |
| --- | --- |
| `afc-registration` | AFC 终报名 PDF、赛事 registration 文件。 |
| `national-fa-profile` | JFA、KFA、CFA 等国家/地区足协名单、队伍页或球员 profile。 |
| `club-academy-profile` | 俱乐部官网、梯队页面、俱乐部公告或军队球队官网。 |
| `school-profile` | 高中、大学、校园足球队页面；若暂只有 AFC 报名字段，应在 `claim` 中说明仍需补个体页。 |
| `league-registration` | J.League、K League、联赛当前注册或转会公告。 |

每条 `source_layers` 必须包含：

- `type`：来源层类型。
- `label` 和 `url`：可读标题和原始链接。
- `checked_at`：核验日期，格式 `YYYY-MM-DD`。
- `confidence`：`high`、`medium` 或 `low`。
- `fields`：该来源支撑的字段，例如 `registration_club`、`training_pathway`、`tournament_participation`。
- `claim`：简短说明该来源具体支撑什么，不要扩大来源能证明的事实范围。

低 confidence 的典型场景：

- 只有组织级官网，没有个体球员 profile。
- AFC 报名字段能确认学校/俱乐部归属，但学校/俱乐部个人页还没捕获。
- 来源之间存在时点差异，需要保留多条路径而不是互相覆盖。

## tournament-archive.source_version

`source_version` 是赛事档案的可选增强字段，用来说明某届赛事的结果、日期、报名、比赛事件和二级交叉来源分别来自哪一类材料。它先在 AFC U 系列 archive 试点，不要求所有历史赛事一次性补齐。

配套字段：

- `source_version`：来源版本数组，每条包含 `type`、`label`、可选 `url` 和 `fields`。
- `source_checked_at`：该届赛事版本信息的核查日期，格式 `YYYY-MM-DD`。
- `source_conflict_note`：AFC 页面、PDF、比赛报告、维基或第三方事件页之间的冲突、边界或降级使用说明。
- `competition_name_history`：赛事名称谱系，例如 `AFC U-16 Championship` 到 `AFC U17 Asian Cup` 的延续关系。

允许的 `source_version.type`：

| 类型 | 使用场景 |
| --- | --- |
| `afc-final-registration` | AFC 终报名 PDF、final squad list、final registration。 |
| `afc-final-report` | AFC 官方赛事总结、决赛报告或 in-numbers 类总结。 |
| `afc-match-report` | AFC 单场比赛报告。 |
| `afc-match-schedule` | AFC 赛程 PDF 或赛程页。 |
| `afc-tournament-home` | AFC 赛事主页或 archive 入口。 |
| `afc-stats-archive` | AFC 官方统计归档。 |
| `fifa-report` | FIFA 对 AFC 赛事结果或资格路径的官方报道。 |
| `wikipedia-secondary` | Wikipedia 二级交叉入口，不作唯一强事实。 |
| `secondary-stats` | 365Scores、Futbol24、Azscore 等第三方事件/统计页。 |
| `news-secondary` | 通讯社、足协新闻或媒体报道。 |

使用边界：

- 官方报名、赛程、赛果优先用 AFC/FIFA；第三方事件页只补 AFC 暂未公开的 lineup、分钟和技术统计。
- 若来源之间冲突，不直接覆盖主字段，先写入 `source_conflict_note` 或后续拆 issue。
- `competition_name_history` 记录的是赛事谱系，不等于单届赛事曾经使用过所有历史名称。

## squad_status

| 状态 | 使用标准 |
| --- | --- |
| `registered` | 官方终报名、联赛/俱乐部注册名单、当前 squad 页面。 |
| `tracked` | 观察池、专题追踪、未进入正式名单或当前注册未确认。 |
| `pending-transfer` | 已签约或已公告但生效日未来，不能提前计入当前注册。 |
| `called-up` | 当前集训/征召名单。新数据优先使用这个状态。 |
| `selected` | 既有数据使用的征召/入选状态，保留兼容；新增数据优先用 `called-up`。 |
| `withdrawn` | 已入选但退出名单。 |
| `unknown` | 来源能确认关联，但名单状态不能确认。 |
| `used` | 历史赛事中已出场或已使用的比赛状态。 |

状态区分：

- 官方报名名单：`registered`
- 当前集训名单：`called-up` 或既有兼容 `selected`
- 观察池/试训/图片线索：`tracked`
- 未来生效转会：`pending-transfer`
- 未核实短视频/自媒体线索：不要直接进入球员当前注册字段，可放 `dossiers` 或 watchlist。

## 来源证据模板

当一条记录依赖多个来源或存在冲突时，在 `verification.notes` 中必须解释证据链；后续可逐步增加结构化 `verification.evidence`：

```json
{
  "field": "registration_club.name",
  "claim": "FK Vozdovac U19",
  "source_label": "Sina report on Vozdovac registration",
  "source_url": "https://example.com/source",
  "checked_at": "2026-06-27",
  "notes": "用于确认当前注册；Burnley 节点只保留在 training_pathway。"
}
```

推荐每条关键事实至少对应一条证据：

- 当前注册俱乐部
- 生日和年龄段
- 国籍/协会归属
- 正式报名或集训状态
- 转会或租借生效日期
- 教练任命和任期

## last_checked 复核规则

| 周期 | 适用对象 | 动作 |
| --- | --- | --- |
| 30 天 | 当前注册、现役留洋、正在进行赛事、当前集训名单。 | 快速复核是否有转会、退队、名单变化。 |
| 90 天 | 近两年历史记录、市场价值、教练当前岗位。 | 常规复核链接和状态。 |
| 180 天 | 稳定历史记录、退役球员、已结束赛事归档。 | 检查死链和二级来源是否仍可访问。 |

超过期限时，先不要直接改事实；把 `verification.status` 调整为 `stale` 或在 notes 里标记复核需求，确认来源后再恢复为 `verified` 或 `mixed-source`。

## 死链检查说明

当前阶段先文档化，后续再自动化。人工或脚本检查时按以下顺序处理：

1. 检查所有 `external_links.url`、`source_links.url`、`profile_url` 是否返回 2xx/3xx。
2. 官方链接失效时，先找同站新 URL；其次找官方 PDF、公告归档或互联网档案。
3. 新闻链接失效时，保留标题和日期，补替代来源，不直接删除旧链接。
4. Transfermarkt、Wikipedia、统计站 URL 改版时，更新到 canonical 页面。
5. 死链但仍有证据价值时，把链接保留并在 notes 标记 `dead-link-on: YYYY-MM-DD`。

## 重复球员检查规则

程序已经检查：

- `id` 不重复。
- `birth_date + 标准化姓名` 不重复，姓名来源包括 `name`、`local_name`、`names.zh`、`names.en`、`names.native`、`names.ja`、`names.ko`。

人工复核还要看：

- 同生日、同俱乐部、不同译名。
- 同名同俱乐部但不同国别。
- 中文名相同、英文转写不同。
- 先在 U17/U23 文件建档，后又在当前留洋或中超青年样本重复建档。
- 球员转籍或代表协会变化，需要新增协会字段说明，不应复制成两个球员。

## 未来生效转会

规则：

- 已公告但尚未到生效日：`squad_status` 用 `pending-transfer`。
- `registration_club` 保留当前有效注册，不提前改为未来俱乐部。
- 未来俱乐部写入 `training_pathway`、`tournament_participation.note` 或 `verification.notes`。
- 生效日之后复核官方注册，再更新 `registration_club`。
- 当前留洋统计只统计已经生效的注册，不统计未来生效转会。

## 当前校验覆盖

`npm run validate-data` 当前已覆盖：

- 必填球员字段。
- `verification.status` 枚举。
- `verification.last_checked` 日期格式。
- `verification.notes` 必填。
- `external_links.type` 枚举、标签和 URL 格式。
- `source_layers` 的类型、confidence、字段列表、claim 和 URL/日期格式。
- `squad_status` 枚举。
- `competition_id` 必须存在于赛事表。
- `tournament-archive.source_version`、`source_checked_at`、`source_conflict_note` 和 `competition_name_history` 的可选结构。
- 重复 `player.id`。
- 重复 `birth_date + 标准化姓名`。
- 教练战绩加总、source link URL、赛事日期、专题日期等既有规则。

后续增强方向：

- 自动生成过期核查报告。
- 自动检查死链。
- 把 `verification.evidence` 从可选模板升级为关键字段必填。
- 把 `selected` 逐步迁移到 `called-up`。
- 对 `source_links` 也增加统一 `type`。
