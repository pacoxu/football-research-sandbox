# 伊朗及剩余 U20/U23 官方名单来源审计

核查日期：2026-07-18

本文件对应 [issue #55](https://github.com/starryjog/football-research-sandbox/issues/55)，也是 [issue #17](https://github.com/starryjog/football-research-sandbox/issues/17) 的来源审计子任务。目标是先确认“国家 × 赛事”是否存在可复核的 AFC 终报名表，再决定是否拆 23 人完整名单任务；本轮不向球员库加入搜索摘要、非官方样本或任意 8—12 人截取名单。

## 状态口径

| 状态 | 判定规则 |
| --- | --- |
| `ready-full-roster` | 已确认参赛，官方终报名表可访问，名单人数和关键字段足以录入完整赛事名单。 |
| `seed-only` | 已确认参赛，但官方来源只足以支持少量种子记录，不能据此冒充完整名单。 |
| `blocked-source` | 已确认参赛，但官方终报名来源缺失、损坏或无法可靠读取。 |
| `not-applicable` | 未参加该届决赛圈，不应创建该届完整名单任务。 |

## 审计结果

| 国家 | 赛事 | 参赛与名单数 | 官方终报名来源 | 字段完整度 | 原名/转写风险 | 与当前站点关系 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Iran | AFC U20 Asian Cup 2025 | 参赛，23 人 | [AFC final squad registration](https://assets.the-afc.com/2025_AFC_U20_Asian_Cup/Finals/Downloads/Squads/AFC-U20-Asian-Cup-China-2025%E2%84%A2-Final-Squad-Registration.pdf) | 号码、英文名、生日、位置、俱乐部、身高/体重、国家队数据、主教练 | 高：仅有拉丁转写，无波斯文原名 | 已有该届赛事和中国队档案；同届不同组 | `ready-full-roster` |
| Iran | AFC U23 Asian Cup 2024 | 未参赛 | [AFC squad lists](https://assets.the-afc.com/2024_AFC_U23_Asian_Cup/Downloads/Squad_List/AFC-U23-Asian-Cup-Qatar-2024%E2%84%A2---Squad-Lists-%28Updated-April-16%29.pdf) | 不适用 | 不适用 | 已有该届档案；无伊朗决赛圈名单 | `not-applicable` |
| Iran | AFC U23 Asian Cup 2026 | 参赛，23 个具名条目 | [AFC final registration](https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/Finals/Squad_Lists/AFC-U23-Asian-Cup-2026-Final-Registration.pdf?source=url) | 号码、位置、英文名/球衣名、生日、俱乐部国家、身高/体重、国家队数据、主教练 | 高：无波斯文原名；官方表缺 2 号且出现两个 22 号，须保留 source note，不得猜改 | 当前 U23 重点赛事，同届高相关对照 | `ready-full-roster` |
| Iran | AFC U17 Asian Cup 2025 | 参赛，23 人 | [AFC squad lists](https://assets.the-afc.com/2025_AFC_U17_Asian_Cup/Finals/Downloads/AFC-U17-Asian-Cup-Saudi-Arabia-2025---Squad-Lists.pdf) | 号码、英文名、生日、位置、俱乐部、身高/体重、国家队数据、主教练 | 高：无波斯文原名，青年球员转写可能存在版本差异 | 已有该届档案；中国也参赛但不同组 | `ready-full-roster` |
| Iran | AFC U17 Asian Cup 2026 | 未参赛 | [AFC final squad lists](https://assets.the-afc.com/2026_AFC_U17_Asian_Cup/Finals/Download/Squad_Lists/AFC-U17-Asian-Cup-Saudi-Arabia-2026---Final-Squad-Lists.pdf) | 不适用 | 不适用 | 已有该届档案；无伊朗决赛圈名单 | `not-applicable` |
| Uzbekistan | AFC U20 Asian Cup 2025 | 参赛，23 人 | [AFC final squad registration](https://assets.the-afc.com/2025_AFC_U20_Asian_Cup/Finals/Downloads/Squads/AFC-U20-Asian-Cup-China-2025%E2%84%A2-Final-Squad-Registration.pdf) | 号码、英文名、生日、位置、俱乐部、身高/体重、国家队数据、主教练 | 中高：乌兹别克拉丁文、西里尔文和 AFC 英文规范可能不同 | 已有该届赛事和中国队档案；同届不同组 | `ready-full-roster` |
| Uzbekistan | AFC U23 Asian Cup 2024 | 参赛，23 人 | [AFC squad lists](https://assets.the-afc.com/2024_AFC_U23_Asian_Cup/Downloads/Squad_List/AFC-U23-Asian-Cup-Qatar-2024%E2%84%A2---Squad-Lists-%28Updated-April-16%29.pdf) | 号码、英文名、生日、位置、俱乐部、身高/体重、主教练 | 中高：拉丁拼写和姓名分词需按 AFC 原文保留 | 已有该届赛事及中国参赛档案 | `ready-full-roster` |
| Uzbekistan | AFC U23 Asian Cup 2026 | 参赛，23 人 | [AFC final registration](https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/Finals/Squad_Lists/AFC-U23-Asian-Cup-2026-Final-Registration.pdf?source=url) | 号码、位置、英文名/球衣名、生日、俱乐部国家、身高/体重、国家队数据、主教练 | 中高：拉丁拼写和姓名分词需按 AFC 原文保留 | 当前 U23 重点赛事，同届高相关对照 | `ready-full-roster` |
| Saudi Arabia | AFC U23 Asian Cup 2024 | 参赛，23 人 | [AFC squad lists](https://assets.the-afc.com/2024_AFC_U23_Asian_Cup/Downloads/Squad_List/AFC-U23-Asian-Cup-Qatar-2024%E2%84%A2---Squad-Lists-%28Updated-April-16%29.pdf) | 号码、英文名、生日、位置、俱乐部、身高/体重、主教练 | 高：无阿拉伯文原名，`Al-`、空格和连字符规范可能不同 | 已有该届赛事及中国参赛档案 | `ready-full-roster` |
| Saudi Arabia | AFC U23 Asian Cup 2026 | 参赛，23 人 | [AFC final registration](https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/Finals/Squad_Lists/AFC-U23-Asian-Cup-2026-Final-Registration.pdf?source=url) | 号码、位置、英文名/球衣名、生日、俱乐部国家、身高/体重、国家队数据、主教练 | 高：无阿拉伯文原名，姓名分词和 `Al-` 规范需保留原文 | 当前 U23 重点赛事，同届高相关对照 | `ready-full-roster` |
| Qatar | AFC U23 Asian Cup 2024 | 参赛，23 人 | [AFC squad lists](https://assets.the-afc.com/2024_AFC_U23_Asian_Cup/Downloads/Squad_List/AFC-U23-Asian-Cup-Qatar-2024%E2%84%A2---Squad-Lists-%28Updated-April-16%29.pdf) | 号码、英文名、生日、位置、俱乐部、身高/体重、主教练 | 高：无阿拉伯文原名，复合姓名及 `Al-` 规范需保留原文 | 已有该届赛事及中国参赛档案 | `ready-full-roster` |
| Qatar | AFC U23 Asian Cup 2026 | 参赛，23 人 | [AFC final registration](https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/Finals/Squad_Lists/AFC-U23-Asian-Cup-2026-Final-Registration.pdf?source=url) | 号码、位置、英文名/球衣名、生日、俱乐部国家、身高/体重、国家队数据、主教练 | 高：无阿拉伯文原名，复合姓名及 `Al-` 规范需保留原文 | 当前 U23 重点赛事，同届高相关对照 | `ready-full-roster` |

## 决策与后续队列

本轮共有 10 个 `ready-full-roster`、0 个 `seed-only`、0 个 `blocked-source`、2 个 `not-applicable`。因此只为以下组合创建 23 人完整名单任务：Iran U23 2026、Uzbekistan U23 2026、Saudi Arabia U23 2026、Qatar U23 2026、Iran U20 2025、Uzbekistan U20 2025、Uzbekistan U23 2024、Saudi Arabia U23 2024、Qatar U23 2024、Iran U17 2025。

后续任务必须满足：

- 录入 AFC 表内全部 23 个具名条目，不截取“核心样本”。
- 记录官方 PDF、`source_checked_at: 2026-07-18` 和明确名单版本。
- AFC 拉丁转写作为可追溯原文；无官方来源时不推测波斯文、阿拉伯文或西里尔文写法。
- 伊朗 U23 2026 增加号码异常说明；无第二官方来源前不把任一 22 号改为 2 号。
- 赛事报名俱乐部与当前俱乐部分开，不用历史快照覆盖当前注册。
- 完成后运行构建和数据校验；不得把搜索摘要直接写入球员事实字段。

## PDF 可读性复核

- U20 2025 PDF 为图片型页面；已逐页渲染并人工确认伊朗和乌兹别克斯坦页面各有 23 行，结构化时需要 OCR 加逐行复核。
- U23 2024、U23 2026、U17 2025 和 U17 2026 PDF 可提取文本；仍须以渲染页面核对列错位、连字符和姓名换行。
- 本审计只确认来源可用性和名单边界，不等同于完成实体去重、当前俱乐部核验或原名补全。
