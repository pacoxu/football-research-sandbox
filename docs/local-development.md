# 本地开发与故障排查

更新时间：2026-06-27

## 环境要求

- Node.js `>=25`，因为 `scripts/sync-sqlite.mjs` 使用内置 `node:sqlite`。
- Python 3，用于本地静态文件服务。
- 能访问 GitHub Pages workflow 所需的 GitHub Actions 环境。

检查版本：

```bash
node -v
python3 --version
```

## 常用命令

```bash
npm run validate-data
npm run build-data
npm run sync-sqlite
npm run prepare-data
npm run serve
```

本地预览：

```bash
npm run prepare-data
npm run serve
```

然后打开 `http://127.0.0.1:4173`。

不要直接用 `file://` 打开 HTML 来验证数据加载；页面需要通过 HTTP fetch `data/site/*.json`。

## Node 版本问题

现象：

- `Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite`
- `SyntaxError` 或 Node 内置 SQLite 相关错误

原因：

- Node 版本低于项目要求。
- 本地 shell 使用了旧的 Node，而不是版本管理器里安装的新版本。

处理：

```bash
node -v
npm run validate-data
npm run sync-sqlite
```

如果只有 `validate-data` 能过、`sync-sqlite` 失败，优先检查 Node 版本和 `node:sqlite` 支持。

## `node:sqlite` 与 SQLite 输出

`npm run sync-sqlite` 会写入 `storage/youth-football.sqlite`。该文件：

- 是本地输出。
- 不提交仓库。
- 不发布到 GitHub Pages。
- 每次运行都会重建。

如果 SQLite 文件被其他程序打开，可能出现锁或写入失败。关闭数据库查看器后重试。

## Python 静态服务

`npm run serve` 等价于：

```bash
python3 -m http.server 4173
```

常见问题：

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `Address already in use` | 4173 端口已被占用 | 换端口：`python3 -m http.server 4174` |
| 页面显示数据加载失败 | 未运行 `npm run build-data` 或 `prepare-data` | 先生成 `data/site/*.json` |
| 页面还是旧数据 | 浏览器缓存或脚本版本参数未变化 | 强刷新，或确认 `assets/app.js` 的 `_v` 参数 |
| 直接打开 HTML 后 fetch 失败 | `file://` 不适合 fetch 相对 JSON | 用本地 HTTP 服务 |

## GitHub Pages 构建失败

Pages workflow 在 `.github/workflows/deploy-pages.yml` 中：

1. checkout 仓库。
2. setup Node 25。
3. 运行 `node scripts/prepare-data.mjs`。
4. 复制 HTML、`assets/`、`data/` 到 `dist/`。
5. 上传并部署 Pages artifact。

常见失败点：

| 阶段 | 可能原因 | 本地复现 |
| --- | --- | --- |
| Setup Node | GitHub Actions 暂时无法安装 Node 25 | 重新运行 workflow，或检查 actions/setup-node 状态 |
| Prepare data | JSON 结构错误、未知 `competition_id`、非法 URL、重复球员 | `npm run validate-data` |
| SQLite sync | Node 版本或 `node:sqlite` 行为问题 | `npm run sync-sqlite` |
| Stage static files | 缺少 HTML、`assets/` 或 `data/` | `ls *.html assets data` |
| Deploy Pages | Pages 权限或环境问题 | 检查 repository Pages 设置和 workflow permissions |

## 生成文件 review

如果修改 `data/raw/**` 或生成脚本：

```bash
npm run prepare-data
git diff -- data/site
```

需要 review：

- `data/raw/**` 源数据变化。
- `data/site/**` 聚合变化。
- 相关文档或脚本变化。

不应提交：

- `storage/youth-football.sqlite`
- `storage/*.sqlite-shm`
- `storage/*.sqlite-wal`
- `dist/**`
- 临时抓取目录、截图和本地报告，除非对应任务明确要求。

## 后续可做

- 给 `npm run serve` 增加可配置端口。
- 增加 `npm run check`，统一执行 validate、build 和生成结果一致性检查。
- 在 GitHub Actions 里上传 `prepare-data` 失败时的最小诊断信息。
- 增加一个只校验 Markdown 链接和 Mermaid 代码块的文档检查脚本。
