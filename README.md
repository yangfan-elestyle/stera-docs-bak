```When Editing
本文档作用: 工程总览 + 代码 / 架构 / 命令 / 结构 / 硬约束 / Fumadocs 约定 (AGENTS.md 路由指定 README 承载); MUST NOT 写调试 / 发布流程 (→ workflow.md) / LLM 约束 (→ AGENTS.md)
遵循 AGENTS.md 文档编写规范
- 章节按需增删, 只留项目真有的; 首行一行价值主张
- 短并列项用表格; 内容生成命令 fenced + `#` 注释同行
- NEVER 写面向人类的 dev server 启动 / 预部署 / 发布命令 (→ workflow.md); 内容生成命令 (generate:data) 属「命令」可留
```

# stera smart one Docs

stera smart one (SMCC) 对外文档站: 多语言 (日 / 英 / 简), 以 Docker 镜像部署。单租户, 无按域名分流。

## 使用

<!-- prettier-ignore -->
| 环境 | URL |
|---|---|
| 本机 | <http://localhost:3000> |
| prod | <https://guides.sterasmartone.com> (现为改造前的旧站, 本仓库上线后替换) |

> staging 与 prod 是同一份镜像的不同构建 (差异仅 `DOCS_ENV`); 环境域名与 ingress 配置在 `elepay-io/ele-argocd-app`。

## 特性

- 多语言 Docs & API Reference (日 / 英 / 简)
- 全文搜索 (日 / 中分词)
- AI 入口: 站内助手、LLM Markdown、`llms.txt` / `llms-full.txt`
- 错误码表 (日 / 英 / 简)

## 技术栈

Next.js 16 (App Router) + Fumadocs + React 19 + Tailwind CSS 4 + TypeScript + Bun。部署: Docker 多阶段构建 (bun 构建 → Next standalone 跑在 Node 24) → GHCR → ArgoCD。

## 项目结构

<!-- prettier-ignore -->
| 路径 | 说明 |
|---|---|
| `app/(site)/[lang]/(landing)` | 落地页 (`/`): HomeLayout, 只有顶部导航 |
| `app/(site)/[lang]/(docs)` | 文档三栏布局, 承载 `/overview` 与其余全部文档页 |
| `app/(site)/[lang]` | 站点: OG / LLM 入口 |
| `lib/landing.ts` | 首页的标题与引导语 (ja/en/zh), 走发版而非 CMS |
| `app/(admin)/admin` | 后台: 登录 / 内容编辑 / 导航编辑 / 账号管理 |
| `lib/auth` | 账号 / 会话 / 权限 |
| `components/admin` | 后台 UI: 组件层 / 内容工作区 (左树 + 编辑器 + 预览) |
| `seed/docs` | 手写文档源 (`index.[lang].mdx` + `meta.[lang].json`), 运行期编译 |
| `content/docs` | OpenAPI 脚本产物 + 其排序 `meta.json`, 构建期编译 |
| `lib/cms` | 运行时内容源: mdx 编译 / provider / dynamic source |
| `lib` | `source.ts` (loader) / `i18n.ts` / `request.ts` / `site.ts` (站点身份常量) |
| `components` / `assets` / `public` | 组件 / 资源 / 静态文件 |
| `scripts` | OpenAPI JSON / MDX 生成 |
| `openapi*.yaml` | OpenAPI 源 (ja / en / zh) |
| `error-codes.json` | 错误码表源 |

## 内容生成命令

```bash
bun run generate:data    # openapi*.yaml -> data/openapi/*.json + (generated) mdx; clone 后 / OpenAPI 变更后必跑
bun run import:seed      # seed/docs -> data/cms.db, 清空重灌; 只在新建库时用
```

> 内容库固定在 `data/cms.db` (路径写死, 不走 env), 线上由持久卷挂在 `/app/data`。
> 空库启动会自动灌一次 seed, 与 `import:seed` 是同一段代码。

## 架构注意点

- **Host 信源**: 以请求 `Host` 头为唯一信源 (`lib/request.ts`), 勿依赖 `X-Forwarded-*`。入口层 (ALB / ingress) MUST 终止 TLS 并透传原始 Host, 否则 OG / canonical / llms 的绝对 URL 全错。
- **`DOCS_ENV` 是构建期变量**: `next.config.mjs` 的 `env` 把它内联进产物 (非 product 时输出 `<meta name="docs-env">`); 运行期 `-e DOCS_ENV=` 无效, 每环境一份镜像。
- **Middleware 先于 `public/`**: i18n middleware 把裸路径 rewrite 成 `/{locale}/...`, 命中后不再回落文件系统路由。`public/` 下的静态文件 MUST 在 `middleware.ts` 的 matcher 中排除 (现排除 `favicon.ico` 与 `docs/**.{png,jpg,jpeg,webp,zip}`), 新增静态资源类型时同步更新。
- **`public/` 缓存头**: Node 运行时对 `public/` 默认发 `max-age=0`, 长缓存在 `next.config.mjs` 的 `headers()` 中声明。
- **后台是独立 root layout**: `app/(site)` 与 `app/(admin)` 各一个 `<html>`; `/admin` MUST 在 `middleware.ts` 的 matcher 里排除, 否则被 i18n rewrite 成 `/{locale}/admin` 而 404。
- **取 loader MUST 走 `getSource()`**: Next 给 page 与 route handler 打不同入口 bundle, `dynamicLoader` 的失效状态是模块级变量, 保存时的 `revalidate()` 到不了另一份实例 -> 表现为页面已更新但 `.md` / `llms.txt` 还是旧的。`getSource()` 每次对一下库里的版本指纹, MUST NOT 直接调 `source.get()`。
- **持久卷装两样东西**: `data/cms.db` 与 `data/uploads/`。后台上传的图片 MUST NOT 写进 `public/` —— 那是构建期产物, 下次发版就没了。图片按内容哈希命名, 经 `app/uploads/[name]` 路由长缓存返回; `/uploads` MUST 在 `middleware.ts` 的 matcher 里排除。
- **`/` 是文档门户首页, 不是产品介绍页**: 版式对齐 SMCC 现网 (`guides.sterasmartone.com`) —— 左对齐标题 + 两段引导语 + 两个按钮, 下面是分栏的文档索引。栏目与链接由真实导航树 (`buildNavSections`) 生成, 编辑在后台调分组或排序首页自动跟着变, MUST NOT 在 `lib/landing.ts` 里另抄一份链接清单。
- **`/` 不是文档页**: 文档总览在 `/overview` (`seed/docs/(home)/overview.mdx`), 其余文档页 URL 不变。`(home)` 文件夹没有 `index`, Docs tab 的 url 取其首个页面即 `/overview` —— 调整 `(home)/meta*.json` 的 `pages` 顺序时 MUST 让 `overview` 保持第一条, 否则 tab 会指向别处。
- **文档 MUST NOT 搬到 `/docs/*`**: 该前缀已被 `public/docs/**` 的图片与 SDK 包占用 (983 处引用), 页面挤进去会与静态资源同名空间。
- **后台左树直接由站点 pageTree 转换而来** (`lib/cms/tree.ts`): 层级、排序、分段说明与线上侧边栏逐节点一致, MUST NOT 另拼一套。树建在 `content/layout.tsx` 里, 跨页面跳转不重挂, 展开状态与滚动位置都留着; 保存后 MUST `router.refresh()` 让它跟上。
- **编辑器预览是独立路由 + iframe**: MUST NOT 改成 server action 返回 JSX —— 那要求预览用到的每个 client component 都在该 action 的 React Client Manifest 里, 而 fumadocs-ui 的 Heading / CodeBlock 只在站点路由图里注册过, 生产构建必定报 `Could not find the module ... in the React Client Manifest`。
- **草稿存库不存内存**: 预览路由与保存动作分属不同入口 bundle, 模块级变量互不可见 (与 `getSource()` 同一个坑)。
- **强制改初始密码 MUST NOT 放在 `requireUser()` 里重定向**: 改密页与其他后台页共用同一层受守卫的布局, 那样会重定向到自己。服务端硬拦截在 `requireWriter()`, 引导在 `AppShell` 客户端做。
- **首个管理员只来自部署侧**: `ADMIN_EMAIL` + `ADMIN_PASSWORD` 且仅在账号表为空时生效。MUST NOT 加自助注册或「首次访问即成为管理员」的 setup 页 —— mdx 默认允许代码执行, 拿到编辑权等于能在服务端跑代码。
- **构建不读内容**: 手写文档在运行期由 `lib/cms` 编译, 构建期只处理 `content/docs/openapi/(generated)/`。`next build` MUST NOT 依赖内容源 (含 db / git 历史) -> MUST NOT 给页面路由加 `generateStaticParams`。
- **运行期编译链 MUST 与构建期对齐**: `lib/cms/mdx.ts` 手工补齐 `remarkStructure` 与 `remarkLLMs`, 且 `remarkLLMs` MUST 在 transform 阶段、`this` 绑 processor 调用; 漏一项会让页面描述 / 搜索索引 / `.md` 输出静默降级或直接抛错。

## 硬约束

- MUST NOT 直接编辑生成产物: `.source/**` / `content/docs/openapi/(generated)/**` / `data/**` / `.next/**` / `out/**` / `next-env.d.ts`。
- `seed/updated-at.json` 是手写页最終更新日的基线 (取自内容搬家前的 git 历史), 改 `seed/docs/**` 时同步更新对应条目。
- 改 `openapi*.yaml` 后 MUST 跑 `bun run generate:data` 刷新; 新 clone 仓库 dev / build 前 MUST 先 `generate:data`。
- 改 `openapi.yaml` (ja) 时 MUST 同时改 `openapi.en.yaml` / `openapi.zh.yaml`; 三份 yaml 的 path / operationId / `$ref` / enum MUST 完全一致, 仅自然语言字段 (summary / description / example 文案) 按语言不同。
- OpenAPI 新增 tag 时 MUST 同时在三份 yaml 的顶层 `tags:` 声明, 否则 `generate:data` 直接报错。
- 改 `error-codes.json` 无需生成步骤 (组件直接 import), 但每项 `message` MUST 含 `ja` / `en` / `zh-CN` 三个 key。
- mdx 路径变更时, 同步相关 mdx 引用。
- 改导航 / 排序时, MUST 同步每种语言的 `meta.[lang].json` (ja / en / zh), 否则菜单缺失或乱序。
- 多语言命名: `index.mdx` (默认 ja) / `index.en.mdx` / `index.zh.mdx`; 缺失语言回退 `index.mdx`。
- **i18n 不走 URL**: `hideLocale: 'always'` (`lib/i18n.ts`) 使公开 URL 无 locale 前缀; 语言由 cookie 决定 (middleware 设置)。引用 / 构造站内 URL 时 MUST NOT 加 `/ja` `/en` `/zh` (用 `/docs/xxx`, 非 `/en/docs/xxx`)。源码 `app/[lang]` 段与内容文件 `index.[lang].mdx` 是内部 / 文件级 locale, 不映射到 URL。
- 经别名 `@/*` / `@/.source` 导入; 避免相对路径穿越。
- 新增 / 修改 `components/**` 下 MDX 组件时, MUST 验证其 `<path>.md` 渲染输出; 仅消费既有组件的 MDX 内容编辑除外。新增组件须同步登记到 `mdx-components.tsx` + `source.config.ts` 与 `lib/cms/mdx.ts` 两处 `mdxAsPlaceholder` + `lib/llm-postprocess.ts` 的 handler, 漏登记会让 `.md` / `llms-full.txt` 输出残留原始 JSX。
- 品牌名 / Dashboard URL 等站点身份文案集中在 `lib/site.ts`, MUST NOT 散落硬编码。

## Fumadocs 约定

- 页面约定: `meta*.json` 的 `pages` 中, 页 / 文件夹 = `path`; 链接 = `[Icon][Text](url)`, 如 `"[x][x](../openapi)"`; 外链 = `external:[Icon][Text](url)`。
- Fumadocs 文档: <https://www.fumadocs.dev/docs>
