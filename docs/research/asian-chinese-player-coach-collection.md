# 亚洲/中国球员与教练信息收集说明

更新时间：2026-06-27

这份说明用于统一后续四条线的数据收集口径：亚洲球员、中国球员、亚洲教练、中国教练。它优先描述当前仓库已有覆盖、待补方向、待核线索和落库位置；未完成注册或缺少官方来源的线索只进入观察池，不直接覆盖现有球员或教练记录。

## 口径

- 亚洲球员：默认按 AFC 成员协会口径统计；土耳其、以色列等地理或中文语境中的广义亚洲边界项需要单独标注，不混入 AFC 主口径。
- 中国球员：默认指 China PR 口径。港澳台球员若后续纳入，需要独立字段标明协会归属。
- 当前注册：以最近可核验的俱乐部注册、官方名单、联赛名单或俱乐部页面为准。试训、传闻、未来生效合同不计入当前注册。
- 教练：主教练、代理主教练、国字号公开任命的主教练优先；助教和顾问可以作为 staff 字段保留，但不混入主教练统计。
- 冲突处理：当官方集训名单、俱乐部注册、媒体报道互相冲突时，用 `verification.status` 和 `verification.notes` 记录分歧，不直接删改原有路径。

## 当前仓库快照

球员库当前聚合到 `data/site/players.json`，共 171 名球员：

| 国家/地区 | 数量 | 主要来源 |
| --- | ---: | --- |
| China PR | 65 | 中国 U23/U17、当前留洋、CSL 青年样本 |
| Japan | 52 | 日本 U23/U17 终报名名单 |
| Korea Republic | 50 | 韩国 U23/U17 终报名名单 |
| Uzbekistan | 4 | 乌兹别克斯坦 U17 关键样本 |

中国当前留洋样本在 `data/raw/players/china-overseas-current.json`，聚合后有 12 人：

| 球员 | 当前记录俱乐部 | 国家 |
| --- | --- | --- |
| 刘邵子洋 | LAFC2 | United States |
| 徐彬 | Barnsley FC | England |
| 王博豪 | FC Den Bosch | Netherlands |
| 林子皓 | FK Vozdovac U19 | Serbia |
| 张家鸣 | FK Vozdovac U19 | Serbia |
| 汪修昊 | DAMM CF | Spain |
| 万项 | Red Star Belgrade U17 | Serbia |
| 金昱成 | NK Lokomotiva Zagreb | Croatia |
| 吕孟洋 | Europa, C.E. Juvenil B | Spain |
| 刘凯源 | FC Villarreal Youth | Spain |
| 李东宸 | Sant Cugat FC | Spain |
| 张林峒 | DAMM CF | Spain |

留洋历史模板在 `data/raw/overseas-history.json`，当前已补三条国家线：

| 国家/地区 | featured_records 数量 | 当前作用 |
| --- | ---: | --- |
| China PR | 16 | 五大联赛正式出场、欧洲其他、万达西班牙计划、健力宝巴西线和 2025-2026 新一波现役海外样本 |
| Japan | 51 | 日本留洋历史与欧洲主流联赛样本 |
| Korea Republic | 29 | 韩国留洋历史与欧洲主流联赛样本 |

亚洲教练五大联赛样本在 `data/raw/big-five-asian-coaches.json`，截至 2026-06-27：

| 口径 | 数量 | 说明 |
| --- | ---: | --- |
| AFC 成员协会主口径 | 2 | Patrick Kisnorbo、Ange Postecoglou |
| 广义亚洲边界口径 | 7 | 另列 Özcan Arkoç、Fatih Terim、Avram Grant、Tayfun Korkut、Nuri Sahin |

中国男足 U 系列教练组在 `data/raw/china-men-youth-coaches.json`：

| 队伍 | 年龄线 | 主教练 | 最近公开节点 |
| --- | --- | --- | --- |
| 中国U23 / 亚运队 | 2003年龄段 | Antonio Puche / 安东尼奥·普切 | 2026年第一期集训，2026-03-20 |
| 中国U19 / U20国青线 | 2007年龄段 | Dejan Djurdjevic / 德扬·久尔杰维奇 | 2026年第三期集训，2026-05-22 |
| 中国U17 | 2009年龄段 | Satoshi Ukishima / 浮嶋敏 | 2026年第四期集训，2026-06-27 |
| 中国U16 | 2010年龄段 | David Almazan / 大卫·阿尔马赞 | 2026年第二期集训，2026-03-12 |
| 中国U15 | 2011年龄段附近 | Zhou Haibin / 周海滨 | 2026年第三期集训，2026-04-11 |

## 来源优先级

1. 官方协会与赛事文件：CFA、AFC、FIFA、JFA、KFA、各联赛官方报名表、官方 squad list。
2. 俱乐部与联赛注册：俱乐部官网球员页、联赛注册名单、杯赛报名名单。
3. 结构化数据库：Transfermarkt、FBref、WorldFootball、Soccerway、National Football Teams 等，只用于交叉核验或补字段。
4. 新闻与社交媒体：只在缺少官方注册页时作为线索来源，落库时应标 `provisional` 或 `needs-review`。
5. 图片、短视频、二次转述：只能进入 dossiers 或 watchlist，不直接当作 registration_club 的唯一来源。

更细的海外青训、球探平台、青年球员报告和公开数据站目录，见 `docs/research/scouting-source-directory.md`。后续拓展球员时，先按该目录找线索，再回到本文件和 `data-governance-and-quality-rules.md` 判断能否落库。

## 亚洲球员收集线

已有基础：

- `data/raw/players/japan-u23-2026.json`、`japan-u17-2026.json`：日本 U23/U17 2026 终报名名单。
- `data/raw/players/korea-republic-u23-2026.json`、`korea-republic-u17-2026.json`：韩国 U23/U17 2026 终报名名单。
- `data/raw/players/u17.json`：乌兹别克斯坦 U17 对照样本。
- `data/raw/overseas-history.json`：日本、韩国留洋历史 featured records。

优先补充：

- 日本、韩国 U17/U20/U23 球员的学校、青训、J/K 联赛注册和海外转会路径。
- 澳大利亚、沙特、伊朗、卡塔尔、乌兹别克斯坦等 AFC 重点协会的 U17/U20/U23 样本。
- 亚洲球员五大联赛正式出场样本，和“梯队/低级别/试训”分开统计。
- 2026 之后的 AFC U17/U20/U23 正赛 roster 与进球/出场数据。

建议字段：

- `id`、`name`、`local_name`、`country`、`birth_date`、`primary_position`
- `registration_club`、`training_pathway`、`tournament_participation`
- `external_links`、`verification.status`、`verification.last_checked`、`verification.notes`

## 中国球员收集线

已有基础：

- 现役留洋：`data/raw/players/china-overseas-current.json`
- 国字号 U23/U17：`data/raw/players/china-u23-2026.json`、`china-u17-2026-additions.json`
- 中超青年样本：`data/raw/players/china-csl-2026-youth.json`
- 留洋历史：`data/raw/overseas-history.json`
- 专题线索：`data/raw/dossiers.json`

待核队列：

| 球员 | 当前判断 | 后续动作 |
| --- | --- | --- |
| 张家鸣 | 现有球员记录保留 FK Vozdovac U19 当前注册，同时 training_pathway 记录 Burnley FC U21 签约节点。 | 继续核对伯恩利、沃日多瓦茨、足协 U19 集训名单三端口径，不直接把当前注册改回 Burnley。 |
| 谢初筠 | 足协 U19 2026 第三期公开名单里出现 Stuttgart 线索，当前球员库尚未建档。 | 查官方或俱乐部注册页后新增记录，先不要只凭名单归属落当前注册。 |
| 魏祥鑫 | 已有数据按未来生效转会或观察节点处理。 | 生效日前不计入当前海外注册。 |
| 王钰栋、蒯纪闻、刘诚宇 | 已有中超/国字号样本，欧洲试训或关注线索不等于注册。 | 继续放入 watchlist 或 dossiers，除非出现俱乐部注册/官方签约。 |
| 2010 西班牙线 | 刘凯源、李东宸、张林峒已在当前留洋样本。 | 继续补俱乐部页面、赛事出场和学校/青训路径。 |

中国球员下一步应补：

- 中国男足国家队、U23、U20/U19、U17/U16 的官方名单与注册俱乐部变更。
- 中国球员五大联赛正式出场、五大联赛梯队、欧洲其他联赛、亚洲其他联赛、美洲其他联赛的分层索引。
- 2012-2016 万达西班牙计划、健力宝巴西留洋、近年小年龄段旅欧样本的名单闭环。
- 所有“当前留洋”样本的 `last_checked` 和 source link 复核节奏。

## 亚洲教练收集线

已有基础：

- `data/raw/big-five-asian-coaches.json` 已把五大联赛顶级联赛一线队主教练/代理主教练拆成 AFC 主口径和广义边界口径。
- AFC 主口径当前只计 Patrick Kisnorbo 和 Ange Postecoglou。
- 土耳其、以色列样本因协会属 UEFA，只进入广义边界口径。

统计规则：

- 只统计五大联赛顶级联赛一线队联赛场次，不混入杯赛、欧战、青年队、预备队、助教经历。
- 代理主教练可以纳入，但需要标明 `spell_type` 或 notes。
- 地理亚洲但非 AFC 协会的教练必须用 `association_confederation` 和 `counted_in` 区分。

优先补充：

- 亚洲教练在五大联赛以外欧洲顶级联赛的执教样本。
- AFC 国家队和 U 系列国家队主教练任期。
- J 联赛、K 联赛、中超、西亚联赛中的亚洲籍主教练样本。
- 亚洲教练在 AFC Champions League 参赛俱乐部的主教练节点。

## 中国教练收集线

已有基础：

- `data/raw/china-men-youth-coaches.json` 已覆盖中国男足 U23、U19/U20、U17、U16、U15 五条 2026 附近年龄线。

下一步应补：

- 中国男足成年国家队历任主教练和现任周期，必须以足协公告或可信通讯社原文为准。
- 中国女足成年队和 U 系列教练周期。
- 中超、中甲每赛季中国籍主教练，区分正式主教练、代理主教练、临时带队。
- 中国教练海外任职、AFC 赛事执教或国字号助教经历，单独用 staff/assistant 口径，不混入主教练统计。
- 邵佳一国家队主教练线索可以作为 senior-team recheck，但需要先补到官方或新华社原文链接，再落入数据文件。

建议新增数据文件：

- `data/raw/china-senior-coaches.json`：中国成年国家队教练周期。
- `data/raw/china-club-coaches.json`：中超/中甲中国籍教练赛季索引。
- `data/raw/asian-national-team-coaches.json`：AFC 国字号主教练索引。

## 落库位置

| 数据类型 | 推荐位置 |
| --- | --- |
| 球员原始记录 | `data/raw/players/*.json` |
| 中国当前留洋 | `data/raw/players/china-overseas-current.json` |
| 中国/日本/韩国留洋历史 | `data/raw/overseas-history.json` |
| 五大联赛亚洲教练 | `data/raw/big-five-asian-coaches.json` |
| 中国男足 U 系列教练 | `data/raw/china-men-youth-coaches.json` |
| 专题、图片线索、待核观察池 | `data/raw/dossiers.json` |
| 聚合结果 | `data/site/players.json`、`data/site/overview.json` |

## 近期执行清单

- 建一张“国家/年龄段/赛事/是否完整名单/是否补俱乐部路径”的覆盖矩阵。
- 复核张家鸣、谢初筠、林子皓的欧洲注册与足协集训归属。
- 按 `scouting-source-directory.md` 为中国留洋、日本/韩国 U17/U23 和亚洲对照组建立固定检索组合，区分官方注册、公开数据库、球探报告和自荐/试训线索。
- 给中国成年国家队教练线新建数据文件，并用官方公告或通讯社原文建立首批记录。
- 把亚洲教练从五大联赛扩展到 AFC 国家队和亚洲顶级联赛。
- 给日本、韩国留洋历史增加 source confidence 和 `last_checked`。
- 把图片、短视频和自媒体线索统一放入 dossiers/watchlist，避免直接污染 registration 字段。

## 已知官方来源入口

- 中国 U23 2026 第一期集训：https://www.thecfa.cn/jxtz/20260320/37446.html
- 中国 U19 2026 第三期集训：https://www.thecfa.cn/jxtz/20260522/37710.html
- 中国 U17 2026 第四期集训：https://www.thecfa.cn/wqmdu17/20260627/37817.html
- 中国 U16 2026 第二期集训：https://www.thecfa.cn/jxtz/20260312/37416.html
- 中国 U15 2026 集训线索：https://www.thecfa.cn/jxtz/20260411/37545.html
- AFC U23 2026 final registration：https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/Finals/Squad_Lists/AFC-U23-Asian-Cup-2026-Final-Registration.pdf?source=url
