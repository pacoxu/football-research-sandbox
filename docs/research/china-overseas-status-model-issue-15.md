# Issue #15 research note: China overseas status model

更新时间：2026-06-27

关联 issue: https://github.com/starryjog/football-research-sandbox/issues/15

## 目标

为中国当前留洋与留洋相关线索增加 `overseas_status`，避免把当前注册、未来生效转会、试训关注、回流和纯历史记录混算。

## Issue 当前状态

- 标题：`P3 follow-up: 为中国当前留洋样本增加 overseas_status 状态模型`
- 状态：open
- 创建时间：2026-06-27T13:16:55Z
- 评论数：0
- issue 正文指定枚举：`active-registered`、`pending-effective`、`trial-watch`、`returned`、`historical-only`

## 当前数据入口

当前仓库已经有多处相关口径，但还没有统一的 `overseas_status` 字段。

| 入口 | 现状 | 与 issue #15 的关系 |
| --- | --- | --- |
| `data/raw/players/china-overseas-current.json` | 独立文件 7 人 | 只覆盖一部分当前留洋样本，不等于聚合后的 12 人 |
| `data/raw/players/china-u23-2026.json` | 徐彬、王博豪带 `china-overseas-current` | U23 文件补足当前留洋样本 |
| `data/raw/players/u17.json` | 金昱成、万项、汪修昊带 `china-overseas-current` | U17 文件补足当前留洋样本 |
| `data/raw/players/china-u17-2026-additions.json` | 谢晋注册俱乐部为 Real Carabanchel CF，但没有 `china-overseas-current` | 形成 12/13 人边界差异，需要先定口径 |
| `data/raw/players/china-csl-2026-youth.json` | 魏祥鑫已有 `pending-transfer` 参赛状态 | 可映射为 `pending-effective` |
| `data/raw/overseas-history.json` | 杜月徵、李磊等历史留洋记录 | 可映射 `returned` 或 `historical-only` |
| `docs/research/data-governance-and-quality-rules.md` | 已有 `squad_status=pending-transfer` 与观察池规则 | 需要补 `overseas_status` 规则 |
| `scripts/validate-data.mjs` | 只校验 `squad_status`，未校验 `overseas_status` | issue 验收需要增加枚举校验 |

## 当前 active-registered 候选

以 `china-overseas-current` tag 统计，聚合后当前是 12 人：

| 球员 | 当前记录俱乐部 | 国家 | 原始入口 |
| --- | --- | --- | --- |
| 刘邵子洋 / Liu Shaoziyang | LAFC2 | United States | `china-overseas-current.json` |
| 徐彬 / Xu Bin | Barnsley FC | England | `china-u23-2026.json` |
| 王博豪 / Wang Bohao | FC Den Bosch | Netherlands | `china-u23-2026.json` |
| 林子皓 / Lin Zihao | FK Vozdovac U19 | Serbia | `china-overseas-current.json` |
| 张家鸣 / Zhang Jiaming | FK Vozdovac U19 | Serbia | `china-overseas-current.json` |
| 汪修昊 / Wang Xiuhao | DAMM CF | Spain | `u17.json` |
| 万项 / Wan Xiang | Red Star Belgrade U17 | Serbia | `u17.json` |
| 金昱成 / Jin Yucheng | NK Lokomotiva Zagreb | Croatia | `u17.json` |
| 吕孟洋 / Lyu Mengyang | Europa, C.E. Juvenil B | Spain | `china-overseas-current.json` |
| 刘凯源 / Liu Kaiyuan | FC Villarreal Youth | Spain | `china-overseas-current.json` |
| 李东宸 / Li Dongchen | Sant Cugat FC | Spain | `china-overseas-current.json` |
| 张林峒 / Zhang Lindong | DAMM CF | Spain | `china-overseas-current.json` |

边界样本：

- 谢晋 / Jin Xie 当前 `registration_club` 为 Real Carabanchel CF / Spain，但没有 `china-overseas-current` tag，也没有 `china-overseas-2026` participation。若按“中国球员当前海外注册”机械统计，他会把 active 候选增至 13；若按“当前留洋专题已确认样本”统计，则仍是 12。
- `research-collection-outline-2026-06-27.md` 的当前注册行已经列入 Jin Xie，因此它与 `docs/coverage-matrix.md` 的 12 人口径不一致。

建议：实现前先决定谢晋是否进入当前留洋专题。若进入，应补 `china-overseas-current` tag、`china-overseas-2026` 参与记录和 `overseas_status=active-registered`；若不进入，应在 notes 中说明暂不纳入 current count 的原因。

## pending-effective 候选

| 球员 | 当前注册 | 待生效节点 | 现有字段 | 建议状态 |
| --- | --- | --- | --- | --- |
| 魏祥鑫 / Wei Xiangxin | Meizhou Hakka FC | AJ Auxerre，按现有 notes 口径 2026-07-01 后再复核 | `squad_status=pending-transfer`、`future-overseas-watch` | `pending-effective` |

建议：`registration_club` 保留当前有效注册，不提前改为 AJ Auxerre；`training_pathway` 或 `tournament_participation` 保留未来节点；页面统计不计入 active 当前留洋。

## trial-watch 候选

当前本地数据没有专门字段表达试训/关注，只在研究文档和 `overseas-history.json` notes 中提到。

| 球员 | 当前注册 | 现有数据状态 | 建议状态 |
| --- | --- | --- | --- |
| 王钰栋 / Wang Yudong | Zhejiang FC | U23 + CSL 当前注册样本 | `trial-watch`，除非出现官方签约或注册 |
| 蒯纪闻 / Kuai Jiwen | Shanghai Port FC | U23 + CSL 当前注册样本 | `trial-watch`，除非出现官方签约或注册 |
| 刘诚宇 / Liu Chengyu | Shanghai Shenhua FC | CSL U21 当前注册样本 | `trial-watch`，除非出现官方签约或注册 |

建议：这类样本不应打 `china-overseas-current`，也不应改 `registration_club`。可以用顶层 `overseas_status=trial-watch` 或单独 watchlist/dossier 字段承载，页面需要明确“不计入当前注册人数”。

## returned 候选

这些样本当前注册在中国，但有可追踪的海外路径。

| 球员 | 当前注册 | 海外路径 | 建议状态 |
| --- | --- | --- | --- |
| 李昊 / Li Hao | Qingdao West Coast FC | Atletico Madrid / UE Cornella youth | `returned` |
| 杨希 / Alex Xi Yang | Shanghai Port FC | RCD Espanyol youth / CE L'Hospitalet | `returned` |
| 邝兆镭 / Kuang Zhaolei | Qingdao Hainiu FC | DAMM CF / CE L'Hospitalet / CE Atletic Lleida | `returned` |
| 杜月徵 / Du Yuezheng | 历史表记录为 2026 年已租借回国内比赛链 | Marbella 2024-2025 | `returned` |
| 李磊 / Li Lei | 历史表记录为 2023 年回国 | Grasshopper Club Zurich 2022-2023 | `returned` |

建议：若球员主库中仍有记录，顶层可写 `returned`；若只有 `overseas-history.json` featured record，则不必强制回填到 player 主表，避免为历史条目制造空壳球员。

## historical-only 候选

`historical-only` 更适合描述一段已经截断、且不代表当前注册的留洋经历。典型情况：

- 刘邵子洋的 Bayern/Austria 2022-2025 欧洲阶段是历史段，但球员本人当前 LAFC2 记录应是 `active-registered`。
- 何小珂的 Spain pathway 2021-2024 在历史表中已截断，当前不属于 active current overseas。
- 万达西班牙计划、健力宝巴西线这类专题批量历史项目，不应进入当前注册统计。

建议：如果 `overseas_status` 是球员顶层字段，则同一球员只能表示“当前分类”；历史段状态应继续放在 `overseas-history.json` 或 `training_pathway`，不要把刘邵子洋这类现役海外球员误标成 `historical-only`。

## 字段位置建议

优先选择球员顶层字段：

```json
{
  "id": "cn-wei-xiangxin-2008",
  "overseas_status": "pending-effective"
}
```

理由：

- 页面和 overview 需要直接按状态计数，顶层字段最容易聚合。
- `registration_club` 表达当前有效注册，不适合存未来、试训或回流语义。
- `tournament_participation.squad_status` 表达某一赛事/专题中的名单状态，不适合跨专题定义当前留洋分类。
- `training_pathway` 适合写历史路径和多段经历，但不适合作为当前状态的唯一来源。

可以保留 `squad_status=pending-transfer`，但它应是局部参赛/专题状态；`overseas_status=pending-effective` 才是球员级分类。

## 校验建议

在 `scripts/validate-data.mjs` 增加：

- `allowedOverseasStatuses = active-registered | pending-effective | trial-watch | returned | historical-only`
- 如果 `overseas_status` 存在，必须属于枚举。
- 第二阶段再把字段设为部分样本必填：带 `china-overseas-current`、`future-overseas-watch`、`csl-u23-overseas`、`overseas-europe` 且当前国内注册、或进入 trial watchlist 的中国球员。

页面统计建议：

- 当前留洋人数只统计 `overseas_status=active-registered`。
- `pending-effective`、`trial-watch` 单独展示或作为说明，不进入当前注册总数。
- `returned`、`historical-only` 进入历史/路径说明，不进入当前注册总数。

## 待决问题

1. 谢晋是否纳入当前中国留洋专题？这是 12 与 13 的关键差异。
2. `trial-watch` 是否只允许出现在球员主库，还是可以放在 dossier/watchlist，避免污染正式球员字段？
3. `returned` 是否只给仍在球员主库里的国内注册球员，`overseas-history.json` 里的纯历史 record 是否继续只用现有 `active_abroad` / `season` 表达？
4. 是否需要把 `docs/research/data-governance-and-quality-rules.md` 的 `squad_status=pending-transfer` 命名与 `overseas_status=pending-effective` 做显式映射，避免两个状态名看起来冲突？

## 相关来源与本地证据

- GitHub issue: https://github.com/starryjog/football-research-sandbox/issues/15
- Coverage matrix: `docs/coverage-matrix.md`
- Research collection outline: `research-collection-outline-2026-06-27.md`
- Player collection guide: `docs/research/asian-chinese-player-coach-collection.md`
- Data governance rules: `docs/research/data-governance-and-quality-rules.md`
- Current overseas raw file: `data/raw/players/china-overseas-current.json`
- U23 player raw file: `data/raw/players/china-u23-2026.json`
- U17 player raw file: `data/raw/players/u17.json`
- U17 additions raw file: `data/raw/players/china-u17-2026-additions.json`
- CSL youth raw file: `data/raw/players/china-csl-2026-youth.json`
- Overseas history raw file: `data/raw/overseas-history.json`
