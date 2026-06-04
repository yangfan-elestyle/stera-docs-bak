# elepay Docs

elepay 与业务线 stera smart one (SMCC) 的统一对外文档站: 多语言 (日 / 英 / 简)、多租户 (按域名分流)、部署于 Cloudflare Workers。一份代码替代既有两个 readme.io 站点, 按访问域名展示对应业务。

<!-- prettier-ignore -->
| 业务 | dev(配置 host) | staging | prod |
|---|---|---|---|
| elepay | <http://docs.stg.elepay.localhost:3000> | <https://staging-elepay-docs.elestyle.workers.dev> | <https://developer.elepay.io> |
| SMCC | <http://docs-smcc.stg.elepay.localhost:3000> | <https://staging-smcc-elepay-docs.elestyle.workers.dev> | <https://guides.sterasmartone.com>(暂未上线) |

## 特性

- 多语言 Docs & API Reference (日 / 英 / 简)
- 按域名切换 elepay / SMCC, 共用内容共享一份
- 全文搜索 (日 / 中分词)
- AI 入口: 站内助手、LLM Markdown、`llms.txt` / `llms-full.txt`
- 错误码从后端实时拉取, 失败回退内置快照

## 技术栈

Next.js 16 (App Router) + Fumadocs + React 19 + Tailwind CSS 4 + TypeScript + Bun。部署: Cloudflare Workers + OpenNext + Wrangler 4。

## 快速开始

```bash
export GH_PACKAGES_TOKEN=<your_github_pat>      # 拉私有依赖 @elepay-io/*, 需 read 权限的 GitHub PAT
bun install                                     # postinstall 跑 fumadocs-mdx 生成 .source/
bun run generate:data                           # clone 后必跑: 生成 OpenAPI JSON/MDX + 错误码快照
bun run dev                                     # http://localhost:3000
```

## 常用命令

<!-- prettier-ignore -->
| 命令 | 说明 |
|---|---|
| `bun run dev` | 本地开发 |
| `bun run build` | 生产构建 (需先 `generate:data`) |
| `bun run generate:data` | 生成 OpenAPI + 错误码快照 |
| `bun run sync:openapi` | 从上游私有仓库拉 ja 覆写并翻译 en / zh |
| `bun run types:check` | 类型检查 (`fumadocs-mdx` + `next typegen` + `tsc`) |
| `bun run cf-typegen` | 从 `wrangler.jsonc` 生成 `cloudflare-env.d.ts` |

> `sync:openapi` 需 `gh` 已登录 (含 `repo` scope) + `claude` 已登录 (用于翻译); 仅要 ja 时直接跑 `scripts/sync-openapi.ts` (去掉 `--translate`)。跑完 OpenAPI 变更须再 `generate:data`。

## 开发 & 部署

> 命令见 [deploy.md](./deploy.md)。

- dev - local(`bun run dev`)：**仅限开发人员本机调试**；127.0.0.1 完全本机预览（配置 host 后可通过 domain 访问 smcc）
- dev - online([deploy.md](./deploy.md))：**AI 预览验证的唯一方式**；用本机 Cloudflare 账号部署后到预览 URL 查看验收

## 项目结构

<!-- prettier-ignore -->
| 路径 | 说明 |
|---|---|
| `app/[lang]` | App Router: 路由 / 布局 / OG / LLM 入口 / search API |
| `content/docs` | 文档源 (`index.[lang].mdx` + `meta.[lang].json`) |
| `lib` | `source.ts` (loader) / `i18n.ts` / `tenant.ts` |
| `components` / `assets` / `public` | 组件 / 资源 / 静态文件 |
| `scripts` | OpenAPI 生成与同步、错误码快照 |
| `openapi*.yaml` | OpenAPI 源 (ja / en / zh) |

## 架构注意点

- **CF Worker fetch**: `global_fetch_strictly_public` 禁直连同账号资源, 拉同账号服务须走 service binding。
- **Host 信源**: 以请求 `Host` 头为唯一信源 (`lib/tenant.ts`), 勿依赖 `X-Forwarded-*`。
