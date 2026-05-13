# Repository Guidelines

## Project Structure & Module Organization

- `app/[lang]` — Next.js App Router（多语言路由、OG 与 API 路由）。
- `content/docs` — Fumadocs 渲染源。多语言采用 `index.[lang].mdx` 与 `meta.[lang].json`，无对应语言时回退到 `index.mdx`（日语，见 README）。
- `content/docs/sdks` — SDK 文档聚合：
  - `android/`：Android 集成与支付页面（如 `pays-*.mdx`）；大量 API 页面位于 `android/elepay/**`。
  - `ios/`：iOS 集成与支付页面，API 文档形如 `api-*.md`。
  - `server/`、`javascript/`：服务端与 JS SDK 指南。
- `content/docs/openapi` — OpenAPI 指南与 `(generated)` 目录（由脚本生成）。
- 其他：`components`、`lib`、`assets`、`public`；配置位于 `next.config.mjs`、`tsconfig.json`、`.prettierrc`。

## Fumadocs 特性与内容约定

- 导航与排序由 `meta.json`/`meta.[lang].json` 控制；页面使用 MDX frontmatter（schema 在 `source.config.ts`）。
- 生成的 OpenAPI 文档位于 `content/docs/openapi/(generated)`；请勿直接修改，改动 `openapi.yaml` 后重新生成。
- 多语言命名：`index.mdx`（默认日语）、`index.en.mdx`、`index.zh.mdx`；同名 `meta.*.json` 必须同步维护。
- 示例路径：`content/docs/sdks/android/pays-wechatpay.mdx`、`content/docs/sdks/ios/api-Elepay.md`。

## Build, Test, and Development Commands

```bash
bun install                       # 安装依赖（Bun）；postinstall 自动跑 fumadocs-mdx
bun run sync:openapi              # 上游 API 变更时手动拉取 openapi.yaml（仅 ja，需本地 gh 已登录；加 --translate 同步触发 en/zh 翻译）
bun run generate:data             # 生成 OpenAPI JSON/MDX 与错误码快照（clone 后或源数据变更后必跑）
bun run dev                       # 本地开发 http://localhost:3000
bun run build                     # 生产构建（运行前需先 generate:data）
bun start                         # 启动 Next 独立服务（仅本地校验用）
bun run cf-typegen                # 从 wrangler.jsonc 重新生成 cloudflare-env.d.ts
```

> 部署由 `.github/workflows/deploy.yml` 在 PR merge 时触发；Cloudflare 凭证仅存在于 GitHub Secrets，本地无法部署。

> `content/docs/openapi/(generated)/` 与 `data/` 已在 `.gitignore`，新克隆仓库后必须先运行 `bun run generate:data` 才能 `dev` 或 `build`。

本机多租户(默认访问通畅。如果访问不通，则是当前用户未配置本机 host)：

```
1. http://docs-smcc.stg.elepay.localhost:3000/
2. http://docs.stg.elepay.localhost:3000/
```

## Coding Style & Naming Conventions

- TypeScript 严格模式；React 19；Next 16 App Router。
- Prettier：2 空格、单引号、尾随逗号（见 `.prettierrc`）。
- 组件文件 PascalCase；路由段 kebab-case。
- 文档 i18n 命名按上节；使用别名 `@/*`、`@/.source`（`tsconfig.json`）。

## 框架与默认文件说明

- 框架版本
  - `next` 16.2+、`react` 19.2+、`typescript` 5.9+、`fumadocs-*` 16/14/10 系列（见 `package.json`）。
  - Tailwind CSS 4（通过 `@tailwindcss/postcss` 注入），样式入口：`app/global.css`。
  - 部署：Cloudflare Workers + OpenNext（`@opennextjs/cloudflare` 1.19+）+ Wrangler 4。

- 默认/生成文件（请勿直接修改）
  - `next-env.d.ts`：Next 自动生成的类型声明。
  - `cloudflare-env.d.ts`：由 `bun run cf-typegen` 从 `wrangler.jsonc` 生成。
  - `.next/`、`.open-next/`、`out/`：构建产物。
  - `.source/index.ts`：由 `fumadocs-mdx` 在 `postinstall` 阶段生成，对应 `@/.source` 别名，仅供读取。
  - `content/docs/openapi/(generated)/**`：由脚本生成的 OpenAPI 文档。修改 `openapi.yaml` 后运行 `bun run generate:data` 刷新（构建不再隐式触发，需显式执行）。
  - `data/openapi/*.json`：每语言切分后的 OpenAPI JSON，`bun run generate:data` 自动生成；`.gitignore` 不进库。
  - `data/error-codes.snapshot.json`：由 `scripts/snapshot-error-codes.ts` 从后端拉取的错误码快照，`bun run generate:data` 会刷新；`.gitignore` 不进库。

- Next.js App Router 约定
  - 入口目录：`app/[lang]`，`[lang]` 为动态语言段。默认语言与列表在 `lib/i18n.ts`。
  - 页面渲染：`app/[lang]/(docs)/[[...slug]]/page.tsx` 负责加载 MDX 页面；目录树来源 `lib/source.ts` -> `source.pageTree`。
  - 布局：`app/[lang]/layout.tsx`（全局）、`app/[lang]/(docs)/layout.tsx`（文档页）。使用 `fumadocs-ui` 的 `RootProvider` 与 `DocsLayout`。
  - 中间件：`middleware.ts` 使用 `createI18nMiddleware` 处理多语言路由与静态资源排除。
  - OG 图片：`app/[lang]/og/[...slug]/route.tsx` 基于 `fumadocs-ui/og` 生成；页面 metadata URL 优先基于请求 Host，异常兜底为本地 URL。
  - LLM 入口：`app/[lang]/llms-full.txt/route.ts` 与 `app/[lang]/llms.mdx/[[...slug]]/route.ts` 用于导出纯文本/单页 MDX 文本。
  - 搜索 API：`app/api/search/route.ts` 使用 `fumadocs-core/search` 与 Orama 分词（含日/中）。

- Fumadocs 关键文件
  - `source.config.ts`：定义 frontmatter 与 `meta.json` 的校验 schema（Zod）与 MDX 选项。
  - `lib/source.ts`：装配 `fumadocs-core` 的 `loader`，挂载 `openapiPlugin` 与图标插件；提供 `getLLMText` 与 OG 图片工具。
  - `mdx-components.tsx`：扩展 MDX 组件，注册 `APIPage` 以渲染 OpenAPI 页面。
  - 文档源：`content/docs/**` 使用 `index.[lang].mdx` 与同名 `meta.[lang].json` 组织导航；缺失语言回退到 `index.mdx`（默认日语）。

- TypeScript 与别名
  - `tsconfig.json`：`paths` 定义 `@/*`（项目根）与 `@/.source`（生成索引）。`moduleResolution: bundler` 适配 Next 16。
  - 代码导入请优先使用别名，避免相对路径穿越（便于重构与移动）。

- 构建与运行脚本（Bun）
  - `bun install`：安装依赖并触发 `postinstall`（生成 `.source`）。
  - `bun run sync:openapi`：从上游 `elepay-io/elepay-charge-api` 私有仓库拉取 `client/elepay-client-sdk.yaml`，覆写根目录 `openapi.yaml`（默认仅 ja）。脚本经 `gh api` 访问，需本地 `gh` 已登录有 `repo` scope；幂等补全上游缺失的顶层 `tags`。不进 `generate:data` 链路，仅在上游 API 变更时手动跑。加 `--translate`（`bun run sync:openapi --translate`）会在同步完成后调用 `claude -p --append-system-prompt-file .claude/skills/translate/SKILL.md ...`，让 translate skill 翻出 `openapi.en.yaml` / `openapi.zh.yaml`（需本地装好 `claude` 命令并完成交互登录，因为脚本不带 `--bare`，靠 keychain OAuth 复用登录态；已存在目标语言文件时 skill 走 `git diff` 增量模式）。
  - `bun run generate:data`：生成 OpenAPI JSON/MDX 与错误码快照。clone 后或修改源数据后必跑；`dev` 与 `build` 均依赖其产物。
  - `bun run dev`：本地开发（`next dev`）。
  - `bun run build`：生产构建。不再隐式调用 `generate:data`，需显式提前运行。
  - `bun run cf-typegen`：从 `wrangler.jsonc` 生成 `cloudflare-env.d.ts`，供 `types:check` 使用。

- Cloudflare 关键文件
  - `wrangler.jsonc`：单 Worker `elepay-docs`（`workers_dev: true`）。production 通过 `wrangler deploy` 接管 100% 流量；staging 通过 `wrangler versions upload --preview-alias staging` 暴露为 `staging-elepay-docs.<account-subdomain>.workers.dev`，不接管主流量。`DOCS_ENV` 在 build 步骤注入（staging vs product），每个 version 各自嵌入对应环境的错误码快照。
  - `open-next.config.ts`：OpenNext Cloudflare adapter 配置（当前为默认）。
  - `public/_headers`：Cloudflare Static Assets 头部（动态响应不受此影响）。
  - `.dev.vars.example`：`wrangler dev` 本地 secrets 模板。

- Architecture Notes
  - `compatibility_flags` 含 `global_fetch_strictly_public`（见 `wrangler.jsonc`）：Worker 内 `fetch()` 禁止直连同账号 Workers/Pages/R2 等资源。新增 SSR 拉取同账号服务（含 elepay-docs 自身）必须走 `WORKER_SELF_REFERENCE` binding 或新增 service binding，不能写 `fetch('https://docs.elepay.io/...')`。`WORKER_SELF_REFERENCE` 当前源码未实际使用，仅作为预留 binding；若未来启用 SSR 自调用，需重新评估 preview version 内 service binding 的路由语义（CF 文档未明确 preview 调 self-binding 是否会跨到 active deployment）。
  - Host / Proto 来源以请求 `Host` 头为唯一信源（`lib/tenant.ts`）。CF Custom Domain 直连后 `X-Forwarded-Host` / `X-Forwarded-Proto` 不再可信，禁止依赖。

## 常见修改任务速查

- 新增一篇文档
  - 在合适目录下创建 `index.mdx` 或 `*.mdx`；补充 frontmatter；同步/新增 `meta.json` 排序与标题。
  - 若需多语言：并列创建 `index.en.mdx`、`index.zh.mdx` 与对应 `meta.en.json`、`meta.zh.json`。

- 新增导航分组
  - 编辑同层 `meta.json`，新增 `items` 条目（遵循 `source.config.ts` 的 schema）。

- 更新 OpenAPI 文档
  - 上游同步（ja）：`bun run sync:openapi` 自动拉 `elepay-io/elepay-charge-api/client/elepay-client-sdk.yaml` 覆写 `openapi.yaml`（需 `gh` 已登录）。
  - 同步 + 翻译（ja → en/zh）：`bun run sync:openapi --translate`（需本地装好 `claude`）。
  - 修改根目录 `openapi.yaml`（或 `openapi.en.yaml`/`openapi.zh.yaml`），执行 `bun run generate:data` 刷新生成产物。

- 增加语言或修改默认语言
  - 更新 `lib/i18n.ts` 中的 `languages`、`defaultLanguage` 与 `fallbackLanguage`；检查 `content/docs/**` 是否存在对应 `index.[lang].mdx` 与 `meta.[lang].json`。

- 自定义主题/样式
  - 在 `app/global.css` 中引入 Tailwind 与 Fumadocs 预设；额外样式建议在此文件维护（Tailwind v4 原子化，无需单独配置）。

## 注意事项

- 不要直接编辑生成文件：`.source/**`、`content/docs/openapi/(generated)/**`、`data/**`、`.next/**`、`.open-next/**`、`out/**`、`cloudflare-env.d.ts`。
- 变更导航或排序请务必同步所有语言版本的 `meta.[lang].json`，否则会出现菜单缺失或顺序不一致。
- 组件命名使用 PascalCase；路由段与文件夹使用 kebab-case；遵循 Prettier 配置（2 空格、单引号、尾随逗号）。
- 部署形态：Cloudflare Workers + OpenNext。Next 的 `output: 'standalone'`（见 `next.config.mjs`）由 OpenNext 适配器消费，请保留。
