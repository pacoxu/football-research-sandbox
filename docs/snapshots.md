# Release 与数据快照机制

更新时间：2026-07-12

本文定义项目如何形成可追溯的数据快照。快照用于记录某一维护时点的 raw 数据、生成数据、口径文档和校验状态，不代表官方名单、实时数据或第三方数据授权。

## 快照类型

| 类型 | 建议频率 | 触发条件 | 命名建议 |
| --- | --- | --- | --- |
| 月度快照 | 每月一次 | 常规数据维护完成，且 `npm run validate-data` 通过。 | `snapshot-YYYY-MM` |
| 赛事节点快照 | 赛事报名、开赛、结束后 | AFC/FIFA final registration、重要集训名单或正赛数据入库。 | `snapshot-competition-id-YYYY-MM-DD` |
| 口径变更快照 | 数据模型或统计口径变化时 | 新增关键字段、状态枚举、覆盖矩阵或验证规则。 | `snapshot-scope-scope-id-YYYY-MM-DD` |

## 已实现的自动化

`.github/workflows/data-snapshot.yml` 是正式快照入口：

- 每月 1 日 `02:17 UTC` 自动创建 `snapshot-YYYY-MM`，避开 GitHub Actions 每小时整点的高负载时段。
- 赛事节点通过 Actions 页手动选择 `event`，并填写小写 kebab-case 标识，例如 `afc-u20-2027`。
- 口径变更通过 Actions 页手动选择 `scope`，并填写模型或口径标识，例如 `source-layers`。
- 工作流只允许在 `main` 上发布，并使用 `contents: write` 的仓库令牌创建 tag 和 GitHub Release。
- 相同 tag 已存在时保持原 release 不变，避免重跑覆盖历史快照。

也可以用 GitHub CLI 触发赛事节点快照：

```bash
gh workflow run data-snapshot.yml \
  --ref main \
  -f snapshot_kind=event \
  -f snapshot_slug=afc-u20-2027
```

工作流发布前会运行数据校验、单元测试和生成物一致性检查。任何一步失败都不会创建 release。

## 快照前检查

数据类快照至少完成：

```bash
npm run validate-data
npm run build-data
```

如果本次需要验证本地查询库，再运行：

```bash
npm run sync-sqlite
```

注意：`storage/youth-football.sqlite` 是本地生成物，不提交、不发布，也不作为快照附件的默认内容。

## 快照内容

每个快照应能追溯：

- 对应 commit SHA。
- `data/raw/**` 源数据。
- `data/site/**` 聚合数据。
- `docs/**`、`README.md`、`CHANGELOG.md` 中的数据口径说明。
- 本次是否运行 `npm run validate-data` 和 `npm run build-data`。
- 本次是否改变统计口径、来源优先级或字段模型。

`scripts/create-snapshot-manifest.mjs` 会生成：

- `.snapshot/snapshot-manifest.json`：快照类型、tag、日期、commit、数据生成日期、统计摘要、校验命令和排除项。
- `.snapshot/snapshot-release-notes.md`：GitHub Release 使用的可读摘要。
- `data/raw/**`、`data/site/**`、`docs/**` 与根目录治理文件四组内容的 SHA-256，用于确认同一 commit 的快照内容没有被替换。

本地可以先预览月度清单；`.snapshot/**` 是临时输出，不提交：

```bash
SNAPSHOT_DATE=2026-07-12 npm run snapshot:manifest
```

建议在 GitHub Release 或 tag 说明中写清：

```text
Snapshot: snapshot-YYYY-MM
Commit:
Generated data date:
Validation:
Scope changes:
Major data additions:
Known limitations:
```

## 推荐流程

1. 完成数据或口径变更。
2. 更新相关文档和 `CHANGELOG.md`。
3. 运行 `npm run validate-data`。
4. 若 raw 或聚合逻辑变化，运行 `npm run build-data` 并 review `data/site/**`。
5. 确认工作区只包含本次快照需要的改动。
6. 合并到主分支后，运行 `data-snapshot` 工作流；月度节点由 schedule 自动触发。
7. 检查 release 中的 manifest，并在 release notes 中补充关键 issue、PR、来源和已知限制。

## 不进入快照的内容

默认不把以下内容作为正式快照资产：

- `storage/**`
- `dist/**`
- 临时抓取目录
- 本地截图、报告和调试输出
- 未经授权再发布的第三方 PDF、图片、数据库导出或媒体文件

如果某个任务确实需要保存人工报告，应先确认版权、隐私和来源条款，并在 release notes 中说明它是辅助材料，不是官方数据。

## 与 GitHub Pages 的关系

GitHub Pages 每次部署都会重新运行 `scripts/prepare-data.mjs` 并生成部署 artifact。Pages 部署不是数据快照；快照必须绑定到明确 commit 或 release，才能保证后续可追溯。

## 后续可自动化项

- 增加 `npm run check-generated`，确认 `data/site/**` 与当前 raw 一致。
- 增加 `data/site/meta.json`，在站点 API 内暴露 schema version、commit SHA 和最近快照标签。
- 增加历史 release 的 manifest 验签或独立校验工具。
