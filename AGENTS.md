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
bun install                       # 安装依赖（Bun）
bun run dev                       # 本地开发 http://localhost:3000
bun run build                     # 生产构建（含 OpenAPI 预生成）
bun start                         # 启动 Next 独立服务
bun run scripts/generate-openapi.ts   # 仅重新生成 OpenAPI 文档
# Docker
docker build -t elepay-docs . && docker run -p 3000:3000 elepay-docs
```

## Coding Style & Naming Conventions

- TypeScript 严格模式；React 19；Next 15 App Router。
- Prettier：2 空格、单引号、尾随逗号（见 `.prettierrc`）。
- 组件文件 PascalCase；路由段 kebab-case。
- 文档 i18n 命名按上节；使用别名 `@/*`、`@/.source`（`tsconfig.json`）。

## 框架与默认文件说明

- 框架版本
  - `next` 15.x、`react` 19.x、`typescript` 5.9、`fumadocs-*` 12–15 系列（见 `package.json`）。
  - Tailwind CSS 4（通过 `@tailwindcss/postcss` 注入），样式入口：`app/global.css`。

- 默认/生成文件（请勿直接修改）
  - `next-env.d.ts`：Next 自动生成的类型声明。
  - `.next/`、`out/`：构建产物。
  - `.source/index.ts`：由 `fumadocs-mdx` 在 `postinstall` 阶段生成，对应 `@/.source` 别名，仅供读取。
  - `content/docs/openapi/(generated)/**`：由脚本生成的 OpenAPI 文档。修改 `openapi.yaml` 后运行 `bun run scripts/generate-openapi.ts` 或在构建时自动生成（`prebuild`）。

- Next.js App Router 约定
  - 入口目录：`app/[lang]`，`[lang]` 为动态语言段。默认语言与列表在 `lib/i18n.ts`。
  - 页面渲染：`app/[lang]/(docs)/[[...slug]]/page.tsx` 负责加载 MDX 页面；目录树来源 `lib/source.ts` -> `source.pageTree`。
  - 布局：`app/[lang]/layout.tsx`（全局）、`app/[lang]/(docs)/layout.tsx`（文档页）。使用 `fumadocs-ui` 的 `RootProvider` 与 `DocsLayout`。
  - 中间件：`middleware.ts` 使用 `createI18nMiddleware` 处理多语言路由与静态资源排除。
  - OG 图片：`app/[lang]/og/[...slug]/route.tsx` 基于 `fumadocs-ui/og` 生成；站点 URL 基于 `lib/metadata.ts` 的 `DOCS_BASE_URL`。
  - LLM 入口：`app/[lang]/llms-full.txt/route.ts` 与 `app/[lang]/llms.mdx/[[...slug]]/route.ts` 用于导出纯文本/单页 MDX 文本。
  - 搜索 API：`app/api/search/route.ts` 使用 `fumadocs-core/search` 与 Orama 分词（含日/中）。

- Fumadocs 关键文件
  - `source.config.ts`：定义 frontmatter 与 `meta.json` 的校验 schema（Zod）与 MDX 选项。
  - `lib/source.ts`：装配 `fumadocs-core` 的 `loader`，挂载 `openapiPlugin` 与图标插件；提供 `getLLMText` 与 OG 图片工具。
  - `mdx-components.tsx`：扩展 MDX 组件，注册 `APIPage` 以渲染 OpenAPI 页面。
  - 文档源：`content/docs/**` 使用 `index.[lang].mdx` 与同名 `meta.[lang].json` 组织导航；缺失语言回退到 `index.mdx`（默认日语）。

- TypeScript 与别名
  - `tsconfig.json`：`paths` 定义 `@/*`（项目根）与 `@/.source`（生成索引）。`moduleResolution: bundler` 适配 Next 15。
  - 代码导入请优先使用别名，避免相对路径穿越（便于重构与移动）。

- 构建与运行脚本（Bun）
  - `bun install`：安装依赖并触发 `postinstall`（生成 `.source`）。
  - `bun run dev`：本地开发（`next dev --turbo`）。
  - `bun run build`：生产构建，预执行 `prebuild` -> 生成 OpenAPI 文档。
  - `bun run scripts/generate-openapi.ts`：仅重新生成 OpenAPI 页面。

## 常见修改任务速查

- 新增一篇文档
  - 在合适目录下创建 `index.mdx` 或 `*.mdx`；补充 frontmatter；同步/新增 `meta.json` 排序与标题。
  - 若需多语言：并列创建 `index.en.mdx`、`index.zh.mdx` 与对应 `meta.en.json`、`meta.zh.json`。

- 新增导航分组
  - 编辑同层 `meta.json`，新增 `items` 条目（遵循 `source.config.ts` 的 schema）。

- 更新 OpenAPI 文档
  - 修改根目录 `openapi.yaml`，执行 `bun run scripts/generate-openapi.ts` 或直接 `bun run build`。

- 增加语言或修改默认语言
  - 更新 `lib/i18n.ts` 中的 `languages`、`defaultLanguage` 与 `fallbackLanguage`；检查 `content/docs/**` 是否存在对应 `index.[lang].mdx` 与 `meta.[lang].json`。

- 自定义主题/样式
  - 在 `app/global.css` 中引入 Tailwind 与 Fumadocs 预设；额外样式建议在此文件维护（Tailwind v4 原子化，无需单独配置）。

## 注意事项

- 不要直接编辑生成文件：`.source/**`、`content/docs/openapi/(generated)/**`、`.next/**`、`out/**`。
- 变更导航或排序请务必同步所有语言版本的 `meta.[lang].json`，否则会出现菜单缺失或顺序不一致。
- 组件命名使用 PascalCase；路由段与文件夹使用 kebab-case；遵循 Prettier 配置（2 空格、单引号、尾随逗号）。
- Docker 构建使用 `next output: standalone`（见 `next.config.mjs`）；如需外部域名预览，设置环境变量 `DOCS_BASE_URL` 以修正 OG 链接。
