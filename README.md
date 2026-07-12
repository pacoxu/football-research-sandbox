# 青训球员追踪站

[![deploy-pages](https://github.com/starryjog/football-research-sandbox/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/starryjog/football-research-sandbox/actions/workflows/deploy-pages.yml)
![data generated](https://img.shields.io/badge/data_generated-2026--07--11-blue)
![validation](https://img.shields.io/badge/validation-npm%20run%20validate--data-informational)
![scope](https://img.shields.io/badge/scope-research%20sample-lightgrey)

当前状态：研究样本库，最近维护日期 `2026-07-12`。本站不是中国足协、AFC、FIFA、俱乐部或任何第三方平台的官方数据库；页面里的球员、留洋和教练数量只代表本仓库已经结构化并通过当前来源口径纳入的样本，不代表官方全量人数。

维护入口：

- 贡献流程：[CONTRIBUTING.md](CONTRIBUTING.md)
- 项目范围与非官方声明：[docs/scope.md](docs/scope.md)
- 来源政策与冲突处理：[docs/source-policy.md](docs/source-policy.md)
- 数据字典：[docs/data-dictionary.md](docs/data-dictionary.md)
- 覆盖矩阵：[docs/coverage-matrix.md](docs/coverage-matrix.md)
- 已知限制：[docs/known-limitations.md](docs/known-limitations.md)
- 快照机制：[docs/snapshots.md](docs/snapshots.md)

一个适合放到 GitHub Pages 的静态站点，用来维护青训球员名单、青训归属、赛事参与和外部资料链接。当前初始化版本重点放在：

- `AFC U17 Asian Cup Saudi Arabia 2026`
- `AFC U23 Asian Cup Saudi Arabia 2026`
- `Chinese Super League 2026` 青年样本
- 日本、韩国 U18 / 大学 / 职业桥梁体系与四队 92 人来源层
- 中国青训与董路足球小将专题追踪
- 中日韩留洋历史数据的建档模板
- 五大联赛亚洲教练记录，区分 AFC 主口径与土耳其 / 以色列等广义边界项
- 五大联赛之外的亚洲主教练试点，区分欧洲非五大、AFC 国字号和亚洲顶级联赛任期
- 本地 `JSON + SQLite` 双轨存储

按项目初始化时点 `2026-05-22` 来看，最近一届需要优先跟踪的是 `AFC U17 Asian Cup Saudi Arabia 2026`。项目种子数据已经按这个时间点初始化；当前维护状态见本文顶部日期。

## 本地使用

先生成站点数据和本地 SQLite：

```bash
node scripts/prepare-data.mjs
```

本地预览：

```bash
python3 -m http.server 4173
```

然后打开 [http://127.0.0.1:4173](http://127.0.0.1:4173)。

## 目录结构

```text
.
├── assets/                  # 页面样式和前端脚本
├── data/
│   ├── raw/                 # 手工维护的数据源
│   │   ├── players/         # 按年龄段分组的球员 JSON
│   │   ├── youth-development-systems.json # 日韩青训体系与赛事关系
│   │   ├── overseas-history.json
│   │   ├── projects.json
│   │   └── tournaments.json
│   └── site/                # 给静态页面直接消费的聚合 JSON
├── docs/                    # 研究说明、收集口径和待核清单
├── scripts/                 # 校验、聚合、同步 SQLite
├── storage/                 # 本地 SQLite 输出目录
└── .github/workflows/       # GitHub Pages 发布流程
```

## 数据维护约定

- 球员原始数据先按年龄段放在 `data/raw/players/*.json`。
- 每条球员记录至少带上 `birth_date`、`registration_club`、`training_pathway`、`tournament_participation`、`external_links`。
- `registration_club.organization_type` 区分高中、俱乐部梯队、大学、职业队、成年军队球队和海外梯队；韩国合作高中不能覆盖母俱乐部字段。
- `data/raw/youth-development-systems.json` 维护日韩稳定体系结构，年度队数和赛季说明只放在 `annual_snapshot`。
- 若外部资料存在冲突，以 `verification.status` 和 `verification.notes` 标记，而不是直接覆盖。
- `data/raw/overseas-history.json` 先作为中日韩留洋建档模板，后续补全五大联赛、欧洲其他、亚洲其他、美洲其他四个层级。
- 留洋国家条目可选带 `featured_records`，用于补真实个案，至少保留赛季、联赛、俱乐部、正式比赛出场与摘要。
- `data/raw/big-five-asian-coaches.json` 维护五大联赛顶级联赛亚洲教练样本，战绩优先按联赛场次统计，并用 `counted_in` 区分 AFC 主口径与广义亚洲边界口径。
- `data/raw/asian-coaches.json` 维护五大联赛之外的亚洲主教练任期，以 `role_scope` 和 `competition_scope` 区分俱乐部一线队、成年/青年国家队及赛事范围，不复制五大联赛主表战绩。
- `docs/research/data-governance-and-quality-rules.md` 固化 `verification.status`、`external_links.type`、`squad_status`、死链、重复球员和过期复核规则。
- `docs/scope.md` 明确项目是研究样本库，不是官方全量数据库；当前留洋样本不能解释为官方全量人数。
- `docs/source-policy.md` 说明来源优先级、交叉验证、冲突处理和未来生效转会口径。
- `docs/data-dictionary.md` 解释 raw JSON、site JSON、SQLite 和核心字段。
- `docs/known-limitations.md` 集中说明非官方数据库、第三方来源冲突、青年球员资料滞后和当前注册非实时转会等限制。
- `docs/snapshots.md` 定义月度、赛事节点和口径变更快照的 release/tag 流程。
- `docs/coverage-matrix.md` 维护 U 系列赛事、留洋、历史五大联赛、足球小将、亚洲对照组和教练数据的覆盖状态与缺口清单。
- `docs/research/asian-chinese-player-coach-collection.md` 记录亚洲/中国球员与教练的信息收集口径、当前覆盖和待核队列。
- `docs/research/scouting-source-directory.md` 维护海外青训、球探平台、青年球员报告和公开数据站的后续检索方向。
- `docs/research/china-league-pyramid-and-regional-super-leagues.md` 区分中国职业联赛层级、中冠通道和苏超/东北超/赣超/湘超等地方城市赛事。

## 现阶段种子范围

- 中国 U17：已补齐 2026 赛事完整报名名单，后续继续补留洋、学校和俱乐部路径。
- 日本 U17：已补齐 2026 赛事完整报名名单、组织类型和 AFC 来源层，并纳入学校/俱乐部并行体系。
- 韩国 U17：已补齐 2026 赛事完整报名名单、组织类型和 AFC 来源层；职业俱乐部 U18 与合作高中分别记录。
- 日韩 U17/U23：四队各 23 人、合计 92 人完成基础来源覆盖；16 名深度样本至少有一条不同 URL 的独立官方来源。
- 中国/日本/韩国 U23：已补齐 2026 年 1 月 AFC U23 Asian Cup 完整终报名名单，当前先保留 AFC 注册拼写。
- 男足 U20 赛事档案：完整覆盖 1985—2025 的 21 届 FIFA 世青赛周期和 21 届 AFC 亚青赛周期，保留 2021/2020 取消届快照，并收录截至 2026-07-12 已确认的两项 2027 主办信息及亚青赛 44 队资格赛抽签；其他 AFC U23 / U17 / U16 档案继续保留。
- 五大联赛亚洲教练：主口径收录 Patrick Kisnorbo、Ange Postecoglou 两名 AFC 成员协会教练；广义边界项另列 Özcan Arkoç、Fatih Terim、Avram Grant、Tayfun Korkut、Nuri Şahin 等土耳其 / 以色列样本。
- 亚洲教练扩展：首批落库 Ange Postecoglou、Tony Popovic、Hajime Moriyasu、Hong Myung-bo、Chan Yuen-ting 五名 AFC 成员协会教练，共 10 段官方来源任期。
- 中超 2026 青年样本：已开始补当前一线队 U21 和具备留洋经历的 U23，中国球员若已在库内建档则直接补中超/留洋字段，不重复建第二条。
- 乌兹别克斯坦 U17：保留 2026 赛事关键球员样本，作为东亚三队对照组。
- 董路足球小将：已补专题卡片、公开批次主干和录入规范，下一步继续拆逐名档案。

## 已知限制

- 本项目是公开资料研究样本库，不是官方、全量或实时数据库。
- 第三方资料可能改版、失效或互相冲突；重要结论应回查 raw 数据和原始来源。
- 青年球员资料公开不稳定，当前注册、学校、梯队和试训信息可能滞后。
- 当前留洋样本只统计仓库已纳入并通过当前口径复核的样本，不代表官方全量人数。

更完整说明见 [docs/known-limitations.md](docs/known-limitations.md)。

## GitHub Pages

仓库已包含 Actions 部署配置：

- push 到 `main` 后自动生成聚合 JSON
- 复制静态资源到 `dist/`
- 使用 `actions/deploy-pages` 发布
