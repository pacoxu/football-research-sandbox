# Transfermarkt 身价刷新说明

更新时间：2026-07-12

本项目把 Transfermarkt 作为外部参考来源，用于展示球员当前身价、历史峰值和是否有关联个人页。Transfermarkt 数据不属于本站开放授权的数据；引用和刷新时应遵守原站条款和项目 `LICENSE` 中的数据边界。

## 相关文件

| 文件 | 作用 |
| --- | --- |
| `scripts/sync-transfermarkt-market-values.sh` | 全量同步入口；默认 dry-run，传入 `--apply` 后才写文件。 |
| `scripts/sync-transfermarkt-market-values.mjs` | 审计身份、发现青年国家队个人页、抓取历史并生成覆盖报告。 |
| `scripts/build-transfermarkt-market-values.mjs` | 兼容旧临时 payload 工作流，并保留完整历史。 |
| `data/raw/player-market-values.json` | 站内身价快照，供 loader 合并到球员对象。 |
| `scripts/lib/data-loader.mjs` | 将身价快照合并进 `data/site/players.json`。 |
| `docs/research/transfermarkt-market-value-coverage.md` | 按状态和国家/地区生成的覆盖报告。 |

## 刷新方式

```bash
./scripts/sync-transfermarkt-market-values.sh
./scripts/sync-transfermarkt-market-values.sh --apply
./scripts/sync-transfermarkt-market-values.sh --country=Australia --competition=afc-u20-2025 --apply
npm run validate-data
npm run build-data
```

脚本流程：

1. 遍历 `data/raw/players/*.json`，确保每个唯一球员都有覆盖记录。
2. 先核验已有个人页；再从配置的中日韩乌澳青年国家队阵容端点发现候选 ID。
3. 用完整生日、国籍以及姓名或位置验证身份；冲突候选不自动写入链接。
4. 调用 `https://tmapi-alpha.transfermarkt.technology/player/<id>/market-value-history?_x_preferred_context=com`。
5. 对历史点按日期排序和去重，派生 `current`、`peak` 与 `last_change_date`。
6. 临时抓取失败时保留上一次成功值并标为 `stale`；写入采用临时文件原子替换。
7. 更新确认后的 `external_links`、身价快照和覆盖报告。

可用参数：

- 不带 `--apply`：只读 dry-run，输出状态和变更汇总。
- `--no-discovery`：不重新扫描国家队阵容，仅刷新现有和人工核验的个人页。
- `--player=<id>`：只刷新一名球员，同时保留其余覆盖记录。
- `--country=<country>`：只刷新该国家/地区球员，同时原样保留未选中的覆盖记录。
- `--competition=<id>`：只刷新参加该赛事的球员；可与 `--country` 组合使用。

## 快照字段

每个球员快照包含：

- `checked_at`：刷新日期，来自脚本运行日期。
- `status`：
  - `available`：有 current 或 peak 身价。
  - `no-market-value`：API 可用但没有身价点。
  - `profile-not-found`：已检索配置的候选池，但没有通过身份规则的个人页。
  - `ambiguous-profile`：存在候选，但姓名、生日、国籍、位置等字段有冲突。
  - `team-page-only`：有 Transfermarkt 链接但无法提取球员 ID。
  - `fetch-error`：API payload 缺失或请求失败。
  - `stale`：本次刷新失败，继续保留上一次成功历史。
- `source.provider`：固定为 `Transfermarkt`。
- `source.profile_url`：球员页。
- `source.market_value_url`：身价历史页。
- `source.api_url`：本次使用的 API URL。
- `lookup`：检索日期、匹配方式、匹配字段和候选链接。
- `history`：完整历史点；每点包含 EUR 金额、显示值、日期，并在可用时保留俱乐部 ID、赛季 ID 和年龄。
- `history_points`：必须与 `history.length` 一致。
- `current`：当前身价点，包含 `eur`、`currency`、`display`、`date`。
- `peak`：历史峰值身价点。
- `last_change_date`：最近身价变化日期。
- `alternatives`：其他平台的独立估值序列；不与 Transfermarkt 排行混算。

## 刷新频率

没有自动定时刷新。建议：

- 新增或修正 Transfermarkt 球员链接后刷新。
- 发布身价排行或市场价值相关页面前刷新。
- 普通维护周期按月或按重要赛事节点刷新即可。
- 如果只是改文档、样式、非身价字段，不需要刷新。

## 手工校验责任

刷新脚本只能说明“这个 URL 当时返回了这些点位”，不能证明：

- 球员链接一定匹配本人。
- Transfermarkt 数据没有重名误配。
- 当前俱乐部和注册状态是最新官方状态。
- 身价可以作为官方估值或真实转会价格。

刷新后应人工检查：

- 新增的 Transfermarkt 链接是否是个人页，不是搜索页、球队页或同名球员页。
- `team-page-only` 和 `fetch-error` 是否需要修正链接。
- 身价异常跳变是否来自误配球员。
- `data/site/players.json` 的排行展示是否符合预期。

## 失败处理

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| `fetch-error` 大量出现 | 网络、API 不可用、限流 | 稍后重试；有旧值时脚本自动保留并标记 `stale` |
| 单个球员 `team-page-only` | URL 不是 `/spieler/<id>` | 改为稳定个人页 |
| `no-market-value` | 球员没有公开身价历史 | 保留状态，不手工伪造身价 |
| 当前/峰值明显不合理 | 链接误配或 API 数据异常 | 回查 Transfermarkt 页面和外部来源 |

## 后续可做

- 为 FootballTransfers 等公开替代来源增加可重复运行的 provider adapter。
- 为不在当前国家队候选池的俱乐部球员增加经过限速的搜索发现适配器。
