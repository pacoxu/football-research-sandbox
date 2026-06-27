# Transfermarkt 身价刷新说明

更新时间：2026-06-27

本项目把 Transfermarkt 作为外部参考来源，用于展示球员当前身价、历史峰值和是否有关联个人页。Transfermarkt 数据不属于本站开放授权的数据；引用和刷新时应遵守原站条款和项目 `LICENSE` 中的数据边界。

## 相关文件

| 文件 | 作用 |
| --- | --- |
| `scripts/sync-transfermarkt-market-values.sh` | 抽取球员 Transfermarkt ID，调用外部 API，生成临时 payload。 |
| `scripts/build-transfermarkt-market-values.mjs` | 从临时 payload 构建 `data/raw/player-market-values.json`。 |
| `data/raw/player-market-values.json` | 站内身价快照，供 loader 合并到球员对象。 |
| `scripts/lib/data-loader.mjs` | 将身价快照合并进 `data/site/players.json`。 |

## 刷新方式

```bash
./scripts/sync-transfermarkt-market-values.sh
npm run validate-data
npm run build-data
```

脚本流程：

1. 遍历 `data/raw/players/*.json`。
2. 在每名球员的 `external_links` 中查找 label 或 URL 包含 `transfermarkt` 的链接。
3. 从 URL 中提取 `/spieler/<id>`。
4. 调用 `https://tmapi-alpha.transfermarkt.technology/player/<id>/market-value-history?_x_preferred_context=com`。
5. 将每个球员的 API 返回保存到临时目录。
6. 运行 `build-transfermarkt-market-values.mjs` 写入 `data/raw/player-market-values.json`。

## 快照字段

每个球员快照包含：

- `checked_at`：刷新日期，来自脚本运行日期。
- `status`：
  - `available`：有 current 或 peak 身价。
  - `no-market-value`：API 可用但没有身价点。
  - `team-page-only`：有 Transfermarkt 链接但无法提取球员 ID。
  - `fetch-error`：API payload 缺失或请求失败。
- `source.provider`：固定为 `Transfermarkt`。
- `source.profile_url`：球员页。
- `source.market_value_url`：身价历史页。
- `source.api_url`：本次使用的 API URL。
- `history_points`：历史点数量。
- `current`：当前身价点，包含 `eur`、`currency`、`display`、`date`。
- `peak`：历史峰值身价点。
- `last_change_date`：最近身价变化日期。

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
| `fetch-error` 大量出现 | 网络、API 不可用、限流 | 稍后重试，不要把失败快照当作事实更新 |
| 单个球员 `team-page-only` | URL 不是 `/spieler/<id>` | 改为稳定个人页 |
| `no-market-value` | 球员没有公开身价历史 | 保留状态，不手工伪造身价 |
| 当前/峰值明显不合理 | 链接误配或 API 数据异常 | 回查 Transfermarkt 页面和外部来源 |

## 后续可做

- 在刷新脚本中输出 changed summary，列出新增、删除、状态变化和异常值。
- 增加 dry-run 模式，先生成临时快照供 review。
- 对 `fetch-error` 保留上一次可用值，并单独标注刷新失败，避免短时 API 故障清空展示。
- 增加同名风险检查，例如球员姓名、出生年和 Transfermarkt 页面是否匹配。
