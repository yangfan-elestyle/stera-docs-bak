```When Editing
本文档作用: 工程总览 + 代码 / 架构 / 命令 / 结构 / 硬约束 / Fumadocs 约定 (AGENTS.md 路由指定 README 承载); MUST NOT 写调试 / 发布流程 (→ workflow.md) / LLM 约束 (→ AGENTS.md)
遵循 AGENTS.md 文档编写规范
- 章节按需增删, 只留项目真有的; 首行一行价值主张
- 短并列项用表格; 内容生成命令 fenced + `#` 注释同行
- NEVER 写面向人类的 dev server 启动 / 预部署 / 发布命令 (→ workflow.md); 内容生成命令 (generate:data / sync:openapi) 属「命令」可留
```

# stera smart one Docs

stera smart one (SMCC) 对外文档站: 多语言 (日 / 英 / 简), 以 Docker 镜像部署。单租户, 无按域名分流。

## 使用

<!-- prettier-ignore -->
| 环境 | URL |
|---|---|
| 本机 | <http://localhost:3000> |
| prod | <https://guides.sterasmartone.com> (暂未上线) |

> staging 与 prod 是同一份镜像的不同构建 (差异仅 `DOCS_ENV`); 环境域名与 ingress 配置在 `elepay-io/ele-argocd-app`。

## 特性

- 多语言 Docs & API Reference (日 / 英 / 简)
- 全文搜索 (日 / 中分词)
- AI 入口: 站内助手、LLM Markdown、`llms.txt` / `llms-full.txt`
- 错误码从后端实时拉取, 失败回退内置快照

## 技术栈

Next.js 16 (App Router) + Fumadocs + React 19 + Tailwind CSS 4 + TypeScript + Bun。部署: Docker 多阶段构建 (bun 构建 → Next standalone 跑在 Node 24) → GHCR → ArgoCD。

## 项目结构

<!-- prettier-ignore -->
| 路径 | 说明 |
|---|---|
| `app/[lang]` | App Router: 路由 / 布局 / OG / LLM 入口 / search API |
| `content/docs` | 文档源 (`index.[lang].mdx` + `meta.[lang].json`) |
| `lib` | `source.ts` (loader) / `i18n.ts` / `request.ts` / `site.ts` (站点身份常量) |
| `components` / `assets` / `public` | 组件 / 资源 / 静态文件 |
| `scripts` | OpenAPI 生成与同步、错误码快照 |
| `openapi*.yaml` | OpenAPI 源 (ja / en / zh) |

## 内容生成命令

```bash
bun run generate:data    # 生成 OpenAPI JSON/MDX + 错误码快照; clone 后 / OpenAPI 变更后必跑
bun run sync:openapi     # 从上游私有仓库拉 ja 覆写并翻译 en / zh
```

> `sync:openapi` 需 `gh` 已登录 (含 `repo` scope) + `claude` 已登录 (用于翻译); 仅要 ja 时直接跑 `scripts/sync-openapi.ts` (去掉 `--translate`)。跑完 OpenAPI 变更须再 `generate:data`。
> 拉私有依赖 `@elepay-io/*` 需环境变量 `GH_PACKAGES_TOKEN` = 含 read 权限的 GitHub PAT。

## 架构注意点

- **Host 信源**: 以请求 `Host` 头为唯一信源 (`lib/request.ts`), 勿依赖 `X-Forwarded-*`。入口层 (ALB / ingress) MUST 终止 TLS 并透传原始 Host, 否则 OG / canonical / llms 的绝对 URL 全错。
- **`DOCS_ENV` 是构建期变量**: `next.config.mjs` 的 `env` 把它内联进产物, 且决定 `generate:data` 抓哪个环境的错误码快照; 运行期 `-e DOCS_ENV=` 无效, 每环境一份镜像。
- **Middleware 先于 `public/`**: i18n middleware 把裸路径 rewrite 成 `/{locale}/...`, 命中后不再回落文件系统路由。`public/` 下的静态文件 MUST 在 `middleware.ts` 的 matcher 中排除 (现排除 `favicon.ico` 与 `docs/**.{png,jpg,jpeg,webp,zip}`), 新增静态资源类型时同步更新。
- **`public/` 缓存头**: Node 运行时对 `public/` 默认发 `max-age=0`, 长缓存在 `next.config.mjs` 的 `headers()` 中声明。
- **构建需要 `.git`**: `source.config.ts` 的 `lastModified()` 插件按文件跑 `git log` 取最終更新日, 构建上下文缺 `.git` 或镜像内缺 `git` 都会让 `next build` 直接失败 -> CI MUST `fetch-depth: 0`, MUST NOT 从无 `.git` 的 tarball 构建。

## 硬约束

- MUST NOT 直接编辑生成产物: `.source/**` / `content/docs/openapi/(generated)/**` / `data/**` / `.next/**` / `out/**` / `next-env.d.ts`。
- 改 `openapi.yaml` (或 `.en` / `.zh`) 后 MUST 跑 `bun run generate:data` 刷新; 新 clone 仓库 dev / build 前 MUST 先 `generate:data`。
- mdx 路径变更时, 同步相关 mdx 引用与 `lib/legacy-redirects.mjs`。
- 改导航 / 排序时, MUST 同步每种语言的 `meta.[lang].json` (ja / en / zh), 否则菜单缺失或乱序。
- 多语言命名: `index.mdx` (默认 ja) / `index.en.mdx` / `index.zh.mdx`; 缺失语言回退 `index.mdx`。
- **i18n 不走 URL**: `hideLocale: 'always'` (`lib/i18n.ts`) 使公开 URL 无 locale 前缀; 语言由 cookie 决定 (middleware 设置)。引用 / 构造站内 URL 时 MUST NOT 加 `/ja` `/en` `/zh` (用 `/docs/xxx`, 非 `/en/docs/xxx`)。源码 `app/[lang]` 段与内容文件 `index.[lang].mdx` 是内部 / 文件级 locale, 不映射到 URL。
- 经别名 `@/*` / `@/.source` 导入; 避免相对路径穿越。
- 新增 / 修改 `components/**` 下 MDX 组件时, MUST 验证其 `<path>.md` 渲染输出; 仅消费既有组件的 MDX 内容编辑除外。新增组件须同步登记到 `mdx-components.tsx` + `source.config.ts` 的 `mdxAsPlaceholder` + `lib/llm-postprocess.ts` 的 handler, 漏登记会让 `.md` / `llms-full.txt` 输出残留原始 JSX。
- 品牌名 / Dashboard URL 等站点身份文案集中在 `lib/site.ts`, MUST NOT 散落硬编码。

## Fumadocs 约定

- 页面约定: `meta*.json` 的 `pages` 中, 页 / 文件夹 = `path`; 链接 = `[Icon][Text](url)`, 如 `"[x][x](../openapi)"`; 外链 = `external:[Icon][Text](url)`。
- Fumadocs 文档: <https://www.fumadocs.dev/docs>
