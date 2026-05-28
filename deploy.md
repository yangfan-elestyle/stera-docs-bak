# 部署流程

两条路径: **本地预览** (AI 默认, 个人 CF) + **公司正式发布** (Actions)。

## 本地预览部署 (AI 全程操作)

AI 改完用本地 `wrangler` (个人账号, 已登录) 部署到个人 CF, 不触及公司平台, 无需人工:

```bash
bun run generate:data              # 源数据变更后才需重跑
bunx opennextjs-cloudflare build   # OpenNext 构建 → .open-next/
bunx opennextjs-cloudflare deploy  # 个人 wrangler 登录态推送
```

**`deploy` 退出 (exit 0) 即预览部署完成, AI 到此为止**: 不确认 URL、不验证页面或后续链路, 由人类验收。

> `deploy` 末尾大量 esbuild 警告刷屏 (第三方库, 非致命), `*.workers.dev` URL 常被 `tail` 截掉, 属正常无需追查; URL 由 worker name `elepay-docs` (`wrangler.jsonc`) + 登录账号 subdomain 拼成, 随账号而变 (需 `workers_dev: true`), 供人类访问。

## 公司正式发布 (Actions)

CF 公司凭证仅在 GitHub Secrets, 本地无法部署公司账号; `master` / `develop` 禁直推, 仅靠 PR merge 触发 Actions (`.github/workflows/deploy.yml`)。

### TL;DR

1. 改动开 PR, merge 进 `develop` -> 自动上 **staging** (preview, 不切流量)
2. 在 staging 两个域名验收
3. 验收 OK -> 开 `develop -> master` PR
4. merge 进 `master` -> 自动上 **product** (100% 流量)

### 触发规则

<!-- prettier-ignore -->
| 触发 | 环境 | 行为 |
|---|---|---|
| PR merged 进 `develop` (任意 head) | staging | preview alias 覆盖更新, 不切流量 |
| PR merged 进 `master` (head 必须是 `develop`) | product | active deployment, 100% 流量 |
| `workflow_dispatch` (手动) | staging | preview alias 覆盖更新 |

> product 只能由 `develop -> master` 的 PR merge 触发, 无法手动部署。hotfix 必须先合入 `develop`, 再走 `develop -> master` PR。

### 环境与 URL

单 Worker `elepay-docs`, staging 与 product 是同一 Worker 的不同 version:

- **product**: `opennextjs-cloudflare deploy` 接管 100% 流量 (active deployment)。
- **staging**: 同一构件 upload 两次, 绑定两个 preview alias, 不切流量:

<!-- prettier-ignore -->
| 租户 | staging URL |
|---|---|
| 默认 (elepay) | `staging-elepay-docs.elestyle.workers.dev` |
| SMCC | `staging-smcc-elepay-docs.elestyle.workers.dev` |

> `--preview-alias` 是单值且仅能在 upload 时创建, 故两租户各 upload 一次; 两份构件内容一致, 仅 alias 不同。

### CI 步骤 (Actions 自动执行)

`bun install --frozen-lockfile` -> `cf-typegen` -> `generate:data` (按 `DOCS_ENV` 嵌入对应环境错误码快照) -> `types:check` -> `opennextjs-cloudflare build` -> 部署:

- product: `wrangler deploy --dry-run` 预检 -> `opennextjs-cloudflare deploy`
- staging: `opennextjs-cloudflare upload --preview-alias staging` + `... staging-smcc`

### 必需 Secrets

一次性配置 (Settings -> Secrets and variables -> Actions):

<!-- prettier-ignore -->
| Secret | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 权限: Workers Scripts Edit + Account Settings Read |
| `CLOUDFLARE_ACCOUNT_ID` | CF 账号 ID |
| `PACKAGE_READ_TOKEN` | GitHub Packages 拉私有依赖 `@elepay-io/*` (见 `bunfig.toml`) |
