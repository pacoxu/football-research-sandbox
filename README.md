# 青训球员追踪站

一个适合放到 GitHub Pages 的静态站点，用来维护青训球员名单、青训归属、赛事参与和外部资料链接。当前初始化版本重点放在：

- `AFC U17 Asian Cup Saudi Arabia 2026`
- `AFC U23 Asian Cup Saudi Arabia 2026`
- `Chinese Super League 2026` 青年样本
- 中国青训与董路足球小将专题追踪
- 中日韩留洋历史数据的建档模板
- 本地 `JSON + SQLite` 双轨存储

按今天 `2026-05-22` 来看，最近一届需要优先跟踪的是 `AFC U17 Asian Cup Saudi Arabia 2026`。项目种子数据已经按这个时间点初始化。

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
│   │   ├── overseas-history.json
│   │   ├── projects.json
│   │   └── tournaments.json
│   └── site/                # 给静态页面直接消费的聚合 JSON
├── scripts/                 # 校验、聚合、同步 SQLite
├── storage/                 # 本地 SQLite 输出目录
└── .github/workflows/       # GitHub Pages 发布流程
```

## 数据维护约定

- 球员原始数据先按年龄段放在 `data/raw/players/*.json`。
- 每条球员记录至少带上 `birth_date`、`registration_club`、`training_pathway`、`tournament_participation`、`external_links`。
- 若外部资料存在冲突，以 `verification.status` 和 `verification.notes` 标记，而不是直接覆盖。
- `data/raw/overseas-history.json` 先作为中日韩留洋建档模板，后续补全五大联赛、欧洲其他、亚洲其他、美洲其他四个层级。
- 留洋国家条目可选带 `featured_records`，用于补真实个案，至少保留赛季、联赛、俱乐部、正式比赛出场与摘要。

## 现阶段种子范围

- 中国 U17：已补齐 2026 赛事完整报名名单，后续继续补留洋、学校和俱乐部路径。
- 日本 U17：已补齐 2026 赛事完整报名名单，先以 AFC 终报名表作为基础档案源。
- 韩国 U17：已补齐 2026 赛事完整报名名单，先以 AFC 终报名表作为基础档案源。
- 中国/日本/韩国 U23：已补齐 2026 年 1 月 AFC U23 Asian Cup 完整终报名名单，当前先保留 AFC 注册拼写。
- 中超 2026 青年样本：已开始补当前一线队 U21 和具备留洋经历的 U23，中国球员若已在库内建档则直接补中超/留洋字段，不重复建第二条。
- 乌兹别克斯坦 U17：保留 2026 赛事关键球员样本，作为东亚三队对照组。
- 董路足球小将：已补专题卡片、公开批次主干和录入规范，下一步继续拆逐名档案。

## GitHub Pages

仓库已包含 Actions 部署配置：

- push 到 `main` 后自动生成聚合 JSON
- 复制静态资源到 `dist/`
- 使用 `actions/deploy-pages` 发布
