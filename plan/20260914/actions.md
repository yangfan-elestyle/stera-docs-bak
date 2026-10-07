# Actions

> 一步一动, 验收不过 MUST NOT 进下一步。本仓库尚无任何用户与存量数据, 不做灰度 / 兼容 / 回滚设计。
> 10/07 质量复盘与验收证据见 [review.md](./review.md)。
> 注意事项与源码结论见 [todo-from-ai.md](./todo-from-ai.md); 约束与已定事项见 [feature.md](./feature.md)。
> A 到 E 全在本机完成, 构建验证用本机 `docker build`; 部署链路 (F) 留到本机全绿之后。
> 及时 commit。没完成一个 sub task 就需要进行 commit 收工，然后进行下一项。

## 入 CMS 的范围

- 入库可编辑: 当前 `seed/docs` 213 个 mdx (71 slug × ja/en/zh) + 39 个手写 `meta*.json`
- **API Reference 整块留构建期**, 一律走发版, MUST NOT 出现在后台编辑器里:
  - `content/docs/openapi/(generated)/` 153 页 -> 脚本从 `openapi*.yaml` 生成, 手改会被下次 `generate:data` 覆盖
  - `content/docs/openapi/index*.mdx` 3 页 -> API Reference 的概要页, 正文只有一个 `<EHome />`
  - `openapi/meta*.json` + `openapi/*/meta*.json` 共 15 份 -> `pages` 直接写 `../(generated)/charge/createCharge` 引用脚本产物, 增删 API 必须与 yaml 同步改
  - 代价: `openapi/meta.json` 里 5 条 `sectionNotes` 描述文案随之留在发版侧, SMCC 改不了
- `error-codes.json` 留本地数据文件走发版; 但嵌 `<ErrorCodeTable />` 的 3 个 `error-code.*.mdx` 页是手写散文, 入 CMS

## 已完成

- [ok] Docker 镜像 (本机构建验收); GHCR workflow `docker-build.yml` 已写、未成功跑过 -> 见 F
- [ok] 去多租户, 收敛为 stera smart one 单站点
- [ok] OpenAPI + 错误码改本地源文件
- [ok] 独立为 stera-docs repo
- [ok] A 数据层 / B 运行时数据源 / C 配套改造 / D 解除 git 依赖 / E 权限与后台 / G 收尾

## A. 数据层 [ok]

A1. [ok] 接 SQLite driver, db 文件路径写死常量 (`data/cms.db`)
    - 用 `node:sqlite` -> Node 24 内置, 无原生依赖, bun 1.4 下同样可用
    - 句柄懒加载单例: 模块加载即连库会让 `next build` 在构建机上凭空造出 db 文件

A2. [ok] 拆内容集合: `openapi/(generated)` 留构建期, 手写文档独立集合 (todo 1)
    - 当前运行期 `seed/docs` 213 篇 / 构建期 `content/docs/openapi` 156 篇; 来源互斥、合计 369 篇
    - picomatch 把裸 `(` `)` 当分组, route group 目录要写成 `[(]home[)]`; 数组里的 `!pattern` 不做减法

A3. [ok] 建表 + migration 脚本 (todo 2)
    - `docs(slug, locale, content, updated_at)` / `navigation(dir, locale, data, updated_at)`
    - migration 用 `PRAGMA user_version` 记进度, 可重复执行

A4. [ok] 写导入脚本 `seed/docs` -> DB (todo 3)
    - `bun run import:seed` 与「空库首启自动灌入」共用同一个 `importSeed`
    - 灌完仍为空则抛错并点名 seed 目录

## B. 运行时数据源 [ok]

B1. [ok] 接 `@fumadocs/mdx-remote` + `dynamicLoader({ docs: 动态源, openapi: 静态源 })` (todo 4)

B2. [ok] frontmatter zod 校验 (含 `tocMaxDepth` / `redirect`)
    - 写入侧拒绝是唯一拦截点; 读取侧只跳过坏行并点名日志
    - MUST NOT 在 `files()` 里抛: dynamicLoader 会缓存 rejected promise 到下次 revalidate, 一条坏数据 = 整站持续 500

B3. [ok] `sectionNotes` 接回 fumadocs storage —— 三语言 sidebar 分段描述逐条比对一致

B4. [ok] 切到 DB 源, 手写 mdx 移出 `content/` 转为随仓 seed (`seed/docs`)
    - `seed/updated-at.json` 保住最終更新日: `git mv` 之后 `git log -- seed/docs/...` 只剩搬家那一个 commit

## C. 随 B 同批改 [ok]

C1. [ok] 全文搜索改传函数 `createFromSource(getSource)`
C2. [ok] llms 链路改喂运行期编译产出的 `_markdown`
C3. [ok] 导航数据改渲染期注入 (EHome 与 `lib/llm-postprocess.ts` 两处)
C4. [ok] 最終更新日取内容源 `updated_at`
C5. [ok] 删 OG 路由的 `generateStaticParams` —— 构建期不再读内容源
C6. [ok] 运行期编译链补齐 `remarkStructure` 与 `remarkLLMs`, 与构建期逐项对齐

## D. 解除 git 构建依赖 [ok] (todo 12)

D1. [ok] 去掉 `source.config.ts` 的 `lastModified()`
D2. [ok] Dockerfile 去 `git` / `.dockerignore` 反过来排除 `.git` / CI 去 `fetch-depth: 0` / README 同步
    - 验收: 从 `git ls-files` 导出的无 `.git` 上下文能 `docker build`, 产物与本机全等

## E. 权限 + 在线编辑

E1. [ok] 用户表 + 会话: admin / editor 两角色, 账号名 = 邮箱 (todo 9)
E2. [ok] `/admin` 路由骨架 + `middleware.ts` matcher 排除 `/admin` (todo 8)
E3. [ok] 登录 + 鉴权, admin 建账号与授权
    - 已定: 初始密码由 admin 当场设定、线下交付, 首次登录强制改密
    - 账号表为空时建代码内固定初始管理员; 首次登录强制改密, 改密前服务端禁止写入 (10/07 确认)
E4. [ok] 后台整体 UI (todo 10)
    - 侧栏 + 顶栏骨架 / 深浅色 / ⌘K 命令面板 / toast
    - 编辑器: CodeMirror 6 + 格式工具栏 + 实时预览 (走站点真实渲染) + 三语言分页签
    - frontmatter 表单化, 保留未修改字段; 多行值随对应字段整体替换
    - 草稿落库 + 并发保护 + ⌘S / ⌘⇧S
    - 新建 / 删除页面 (自动挂到所在分组导航), 图片上传 (粘贴截图 / 拖入 / 选文件)
    - 导航编辑器结构化, 分隔符改名自动搬 sectionNotes 的 key
    - 内容与导航合并为一个工作区: 左侧就是站点侧边栏本身, 点页面改正文, 点分组齿轮改排序与分段说明
    - SMCC 10/07 确认 UI 排版无意见, 沿用现有设计
E5. [ok] 保存后刷新前台
    - `getSource()` 比对库里的版本指纹 + `revalidatePath`
    - Next 给 page 与 route handler 打不同入口 bundle, 只靠 `revalidate()` 到不了另一份模块实例

## F. 部署链路 -> 已并入 [roadmap.md](../20261007/roadmap.md)

## H. 落地页 [ok]

H1. [ok] `/` 改为文档门户首页 (fumadocs `HomeLayout`), 文档总览移到 `/overview`
    - 版式对齐 SMCC 现网 guides.sterasmartone.com: 左对齐标题 + 引导语 + 两个按钮 + 分栏索引
    - 栏目由真实导航树生成, 不另维护一份链接清单
    - 顶部导航 首页 / 文档 / API 参考 三条主入口, 首页与文档页共用同一份 links
    - 只有标题与两段引导语是固定文案 (`lib/landing.ts`, 三语言), 走发版而非 CMS
      (它不是文档页, 不进 slug 体系, 也不该出现在侧边栏与搜索里)
    - MUST NOT 把文档搬到 `/docs/*`: 该前缀已被 `public/docs/**` 的图片占用

## G. 收尾 [ok]

G1. [ok] 删 `lib/legacy-redirects.mjs` + `next.config.mjs` 的 `redirects()`
G2. [ok] 删 `docs/多租户编写指南.md`
G3. [ok] 删 `@elepay-io/chatbot` 与 ChatbotLauncher -> 连的是 elepay 的知识库, 挂在 SMCC 站上会用错知识源; 私有 registry 链路一并拆掉
G4. [ok] README / workflow.md 同步改造后事实
G5. [ok] 健康检查 `app/api/health/route.ts` + Dockerfile `HEALTHCHECK`
    - 只跑 `SELECT 1 FROM docs`, 不碰编译 / 搜索索引; 不可读 -> 503
    - MUST `force-dynamic`, 否则构建期预渲染会连库
    - runner 无 curl, 探针用 `node -e fetch`
    - 验收: 空卷首启 healthy; 坏库文件 -> 503 `file is not a database`

## 需回复 SMCC -> 已并入 [roadmap.md](../20261007/roadmap.md)
