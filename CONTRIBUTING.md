# Contributing

更新时间：2026-06-28

本项目维护的是青训球员、赛事、留洋和教练研究资料，不是官方数据库。贡献时请优先保证来源、口径和可复核性，而不是只增加记录数量。

## 先确认改动类型

| 类型 | 典型文件 | 必做事项 |
| --- | --- | --- |
| 新增或修改球员 | `data/raw/players/*.json` | 补来源、`verification`、赛事参与和训练路径；运行校验和必要的聚合生成。 |
| 新增或修改赛事 | `data/raw/tournaments.json`、`data/raw/tournament-archive.json` | 说明赛事版本、官方来源、日期范围和中国队相关字段。 |
| 新增或修改留洋记录 | `data/raw/players/china-overseas-current.json`、`data/raw/overseas-history.json` | 区分当前注册、未来生效、试训观察、回流和历史样本。 |
| 新增或修改教练记录 | `data/raw/big-five-asian-coaches.json`、后续扩展表 | 明确统计范围、联赛层级、任期和战绩来源。 |
| 改页面或脚本 | `assets/**`、`scripts/**`、根目录 HTML | 说明是否影响 `data/site/**` 聚合结果。 |
| 改文档 | `README.md`、`docs/**` | 更新相关入口和 changelog。 |

## 数据贡献流程

1. 先查 `docs/scope.md`，确认该资料属于本站范围。
2. 查 `docs/source-policy.md`，确认来源等级和交叉验证要求。
3. 查 `docs/data-dictionary.md`，按现有字段补齐结构。
4. 修改 `data/raw/**`，不要手写 `data/site/**`。
5. 每条关键事实都要有 `external_links` 或等价来源说明，并补 `verification.last_checked`。
6. 遇到冲突时，不要直接覆盖旧事实；用 `verification.status` 和 `verification.notes` 说明分歧。
7. 运行校验：

```bash
npm run validate-data
```

8. 如果改动影响页面聚合，再运行：

```bash
npm run build-data
```

9. 如果需要确认 SQLite 同步，再运行：

```bash
npm run sync-sqlite
```

`storage/youth-football.sqlite` 是本地生成物，不提交。

## 来源要求

优先使用官方赛事、足协、俱乐部、联赛注册和官方比赛报告。新闻、Transfermarkt、Wikipedia、统计站和球探平台可以作为交叉验证或线索，但不应单独支撑强事实。当前留洋样本尤其要避免把试训、未来生效转会或短期传闻提前计入当前注册。

每个数据 PR 至少说明：

- 改了哪些 raw 文件。
- 新增或变更了哪些来源链接。
- 是否改变统计口径或覆盖范围。
- 是否运行 `npm run validate-data`。
- 是否需要同步 `data/site/**`。

## 生成文件规则

- `data/raw/**` 是源数据，人工维护。
- `data/site/**` 是生成但提交的站点数据，只有 raw 或聚合逻辑变化时才更新。
- `storage/**`、`dist/**`、`outputs/**` 不随普通数据 PR 提交。
- 只改文档时，不更新 `data/site/**` 和 `generated_at`。

## 隐私和风险

项目涉及青年球员资料。不要加入非公开个人信息、联系方式、家庭住址、证件信息、私人社媒截图或无法公开验证的敏感材料。发现错误收录或敏感信息风险时，按 `SECURITY.md` 处理。

## 协作、审查与发布

- 新任务应选择数据新增、数据纠错、来源失效、页面问题或口径讨论模板，不使用无结构空白 issue。
- PR 按 `.github/pull_request_template.md` 列出 raw 文件、生成文件、来源、校验和口径影响。
- `.github/CODEOWNERS` 区分数据、脚本、页面和治理文档审查责任；跨层改动需要同时检查 raw、生成数据和页面影响。
- `validate-data` workflow 会在 PR 和 `main` push 上运行 JavaScript 语法检查、数据校验、测试及生成物一致性检查。
- 月度或赛事节点 release 按 `docs/snapshots.md` 创建；普通 PR 不手工提交 `.snapshot/**`、`storage/**` 或 `dist/**`。
