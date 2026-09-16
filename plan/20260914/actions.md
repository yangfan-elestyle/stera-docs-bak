# Actions

> 一步一动, 验收不过 MUST NOT 进下一步。站点尚未上线, 无存量线上数据与用户, 不做灰度 / 兼容 / 回滚设计。
> 注意事项与源码结论见 [todo-from-ai.md](./todo-from-ai.md); 约束与已定事项见 [feature.md](./feature.md)。
> A 到 E 全在本机完成, 构建验证用本机 `docker build`; 部署链路 (F) 留到本机全绿之后。

## 入 CMS 的范围

- 入库可编辑: 全部手写内容 = 210 个 mdx (70 slug × ja/en/zh) + 36 个手写 `meta*.json`
- 留构建期: `content/docs/openapi/(generated)/` 153 页 + 其 15 个 `meta*.json` -> 脚本从 `openapi*.yaml` 生成, 手改会被下次 `generate:data` 覆盖
- `error-codes.json` 留本地数据文件走发版; 但嵌 `<ErrorCodeTable />` 的 3 个 `error-code.*.mdx` 页本身入 CMS
- `content/docs/openapi/index.*.mdx` 3 页是手写落地页, 入 CMS

## 已完成

- [ok] 迁移 Docker 部署 (GHCR 镜像 + ArgoCD)
- [ok] 去多租户, 收敛为 stera smart one 单站点
- [ok] OpenAPI + 错误码改本地源文件
- [ok] 独立为 stera-docs repo

## A. 数据层

A1. 接 SQLite driver, db 文件路径写死常量
    - 优先 `node:sqlite` -> Node 24 内置, 无原生依赖; 选 `better-sqlite3` 则注意 deps 阶段是 bun 镜像而 runner 是 `node:24`, 原生模块 ABI 会对不上
    - 句柄 MUST 单例复用, MUST NOT 每请求新建 -> dev HMR 会泄漏

A2. 拆内容集合: `openapi/(generated)` 留构建期, 手写文档独立集合 (todo 1)
    - 现为单 collection 同时覆盖 `(home)` + `openapi/(generated)`
    - 验收: `bun run generate:data` + `bun run types:check` + `bun run build` 通过, openapi 页与 sidebar 不变

A3. 建表 + migration 脚本 (todo 2)
    - 正文表: 正文 / frontmatter / `updated_at`; 唯一键 `(slug, locale)`
    - 导航表: `meta.json` 同样按语言三份, MUST 含非标准字段 `sectionNotes`
    - 验收: migration 可重复执行且结果一致

A4. 写导入脚本 `content/` -> DB (todo 3)
    - 建库即重跑, 不做增量与幂等
    - 验收: 入库 210 行正文 + 36 份 meta; 抽样比对正文 + frontmatter + meta 排序 + `sectionNotes`

## B. 运行时数据源

B1. 接 `@fumadocs/mdx-remote` + `dynamicLoader({ docs: 动态源, openapi: 静态源 })` (todo 4)

B2. frontmatter 补 zod 校验 -> `compile()` 返回值不经校验
    - MUST 覆盖自定义字段 `tocMaxDepth` (3 处在用) 与 `redirect` (schema 有, 内容 0 处)

B3. `sectionNotes` 接回 fumadocs storage
    - `lib/plugins/section-notes.ts` 走 `this.storage.read(metaPath)` 读 meta; 入库后读不到会让分隔符描述静默消失且不报错
    - 验收: 三语言 sidebar 分段描述与切换前一致

B4. 切到 DB 源, 删文件态手写 mdx 与旧集合配置
    - 切之前先跑一遍文件态产物留作比对基准, 切完逐页 diff
    - 验收: 正文 / TOC / sidebar / 面包屑 / previous-next / 图片 全一致; 141 处无语言前缀的站内绝对链接 (`](/openapi/refund/createRefund)` 形态) 仍走通 i18n rewrite
    - 验收: `content/docs/openapi/(generated)/` 之外无手写 mdx

## C. 随 B 同批改, 漏掉会静默坏掉

C1. 全文搜索改传函数 `createFromSource(getSource)` (todo 5)
    - `@orama/tokenizers` 的 japanese / mandarin `localeMap` 配置可原样保留
    - `app/api/search/route.ts` 的 `staticGET` 导出现已无消费方, 一并删

C2. llms 链路改喂 DB 正文
    - `lib/source.ts:126` 的 `page.data.getText('processed')` 在 DB 源下取不到: `raw` 读文件系统, `processed` 依赖构建期 `includeProcessedMarkdown`
    - 影响 `llms.txt` / `llms-full.txt` / `llms.mdx/[[...slug]]`, 以及 `next.config.mjs` rewrite 过来的 `<path>.md`
    - 顺带清 `mdxAsPlaceholder` 白名单死项 `EContainer` / `EImg` / `EText`
    - 验收: 四类输出与切换前一致

C3. 导航数据改渲染期注入 (todo 6)
    - `components/EHome.tsx` 与 `lib/llm-postprocess.ts` 都 `import { source }` 后取 `source.pageTree[lang]`, 两处都要改 (todo 6 只写了 EHome)

C4. 最終更新日取 DB `updated_at` (todo 7)

C5. 删 `app/[lang]/og/[...slug]/route.tsx:106` 的 `generateStaticParams`
    - 它在构建期调 `source.getPages()`; 内容进 DB 后会让 `next build` 反过来依赖 db 文件, 而线上 db 在运行期挂载卷上, 构建机看不到
    - OG 路由已是 `revalidate = false`, 改按需生成后首次访问渲染一次即长期缓存
    - 验收: 构建全程不碰 db 文件

C6. 运行时 MDX preset 的 `remarkStructureOptions` MUST NOT 关成 `false`, 传对象时 MUST NOT 带 `exportAs`
    - `structuredData` 同时支撑 `getPageDescription` (`lib/source.ts:101`) 与搜索索引
    - 导出名由 preset 覆写而来, 非插件默认: `fumadocs-core/dist/content/mdx/preset-runtime.js:18-20` 传 `{ exportAs: 'structuredData', ...remarkStructureOptions }`, 而 `remarkStructure` 自身默认 `exportAs: false`
    - 展开顺序在后 -> 传 `{ exportAs: ... }` 会盖掉导出名, 效果等同关闭; 传不含 `exportAs` 的对象安全

## D. 解除 git 构建依赖 (todo 12)

D1. 确认构建期只剩 openapi 集合后, 去掉 `source.config.ts` 的 `lastModified()`
    - 该插件对每个文件跑 `git log`, 是已知唯一的构建期 git 依赖

D2. 拆掉为它存在的三处基建
    - Dockerfile 删 `apt-get install git`; `.dockerignore` 删「`.git` MUST NOT 排除」约定; CI 删 `fetch-depth: 0`; README 硬约束同步删
    - 动手前 MUST 全仓复核还有没有别的地方读 git 历史, 漏一处会静默坏
    - 验收: 从无 `.git` 的构建上下文能构建成功

## E. 权限 + 在线编辑

E1. 用户表 + 会话: admin / editor 两角色, 账号名 = 邮箱 (todo 9)
    - MUST NOT 接邮件服务, MUST NOT 开放自助注册
    - mdx-remote 默认允许代码执行 -> 能写库 = 能在服务端执行代码, 按 RCE 边界设计而非普通内容权限

E2. `/admin` 路由骨架 + `middleware.ts` matcher 排除 `/admin` (todo 8)
    - 不排除会被 i18n rewrite 成 `/{locale}/admin`
    - MUST NOT 重写整段 matcher: `.md` 与 `llms.txt` 是真实路由, 依赖这个 rewrite

E3. 登录 + 鉴权, admin 建账号与授权
    - 待定: 初始密码如何交给 editor, 首次登录是否强制改密

E4. 编辑页 UI: ja / en / zh 分别编辑 + 各自独立保存 (todo 10)
    - 被阻塞: SMCC 侧 UI 排版未回复前 MUST NOT 定稿布局
    - 需能看出某 slug 缺哪些语言

E5. 保存后调 `revalidate(name)` 刷新动态源
    - 验收: 保存后前台正文 + 搜索结果同步更新

## F. 部署链路 (本机全绿之后再打通, 但卷要早申请)

F1. 申请持久卷并挂进 pod
    - 跨 repo: 卷与部署策略在 `elepay-io/ele-argocd-app` 侧; 只卡上线不卡开发, SHOULD 尽早发起
    - MUST 是块存储, MUST NOT 落在 NFS / EFS -> SQLite 的文件锁在网络文件系统上会损坏库, 且不报错
    - MUST replicas=1 + 部署策略 `Recreate` -> 滚动更新时两个 pod 抢同一块 RWO 卷

F2. repo 正式落位 `elepay-io` 组织
    - 现状: origin = `yangfan-elestyle/stera-docs-bak`, 个人备份 repo; workflow run 在 develop 上 `queued` 从未启动 -> 个人 org 下无 self-hosted runner, 属预期内

F3. CI/CD 逐项核对并跑通
    - self-hosted runner / `PACKAGE_READ_TOKEN` / `DEPLOY_PAT_TOKEN` / `elepay-io/ele-argocd-app` 侧 image 引用 (`image_name: ${{ github.repository }}` 随 repo 名变)
    - workflow 文件本身在 D2 已被改过, 这里只是首次真跑
    - 验收: develop 一次 push 走完 build + 推 GHCR + dispatch, 并真正部署上

## G. 收尾

G1. 删 `lib/legacy-redirects.mjs` (237 行) + `next.config.mjs` 的 `redirects()`
    - 映射的是已下线 elepay 文档站的 `/docs/*` `/sdks/*` 旧路径; stera-docs 是新域名新站, 没有历史外链要接

G2. 删 `docs/多租户编写指南.md`

G3. 定 `@elepay-io/chatbot` 依赖去留 -> Chatbot 不在本 PJ 范围
    - 若删, Dockerfile + CI 的 `PACKAGE_READ_TOKEN` / `gh_packages_token` 私有源链路可一并去掉

G4. README / workflow.md 同步改造后事实

## 需回复 SMCC

- Chatbot 可对应时期
- UI 排版 -> 阻塞 E4
