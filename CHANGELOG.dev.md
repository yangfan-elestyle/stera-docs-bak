```When Editing
本文档作用: 面向开发者的发版记录; CHANGELOG.md 的超集, 1:1 镜像 + 技术变更子项
遵循 AGENTS.md 文档编写规范
- 每条主项 = CHANGELOG.md 对应条目 (原文), 下方缩进子项承载技术变更
- 子项 MAY 写路径 / 函数 / 机制; ≤ 1 行
```

# Changelog (developer, follow [CHANGELOG.md](./CHANGELOG.md))

面向开发者, 镜像 [CHANGELOG.md](./CHANGELOG.md) 每条条目并补一行技术子项 (文件 / 函数 / 机制级)。写法与流程 -> [workflow.md](./workflow.md)。

> 0.1.0 - 0.1.5 历史版本不回填技术子项, 详见 [CHANGELOG.md](./CHANGELOG.md); 自 0.1.6 起开始正式镜像。

## [0.1.10] - 2026-09-10

### Fixed

- API Reference: 创建发票 / 创建读卡器 / 创建订阅 三个接口的成功响应码由 `201` 更正为 `200` (与实装一致, 原文档记载有误)。
  - `createInvoice` / `createReader` / `createSubscription` 改 `'201'` -> `'200'`, `createInvoice` 的 `description` 同时 `Created` -> `OK`; 对应上游 `elepay-charge-api` PR #306 (`e0240b37`)。

### Changed

- API Reference 追平上游 spec, 补上已上线但未记录的字段: 客户敬称 (`honorific` / `customerHonorific`)、org 级作用域 (`scope`)、客户来源的所属客户 (`customerId`)、便利店·银行转账的付款人信息 (`billName` / `billKana` / `billEmail` / `billPhone`)。
  - `openapi.yaml` 由 `bun run scripts/sync-openapi.ts` 从上游 `client/elepay-client-sdk.yaml` 全量覆写 (脚本 `patchMissingTopLevelTags()` 自动补回 `- name: Location`); `openapi.en.yaml` / `openapi.zh.yaml` 人工同步同批字段。三份 key path 各 2988 个, 结构完全一致。
  - 补齐的是 2026-05-13 (`899abd8`) 之后上游的 8 个 commit, 全部已在 charge-api `master`, 即已上生产。
- API Reference: EasyQR 码创建的 `amount` / `orderNo` 由固定必填改为随 `shouldCreateSource` 条件必填, 并移除已废弃的 `sourceId`。
  - `CodeReq` 删除 `required: [amount, orderNo]` 与 `sourceId`, `amount` / `orderNo` / `customerId` / `shouldCreateSource` 的 description 改为条件式; 对应上游 `15c734fc`。

## [0.1.9] - 2026-08-17

### Changed

- EC-CUBE 插件说明页 (日 / 英 / 中) 更新收银台支付方式截图。
  - `content/docs/(home)/cases/(ec-platform)/ec-cube-plugin.{mdx,en.mdx,zh.mdx}` 引用改为 `public/docs/ec-cube-plugin-checkout-payment-methods.png`, 删除旧图 `fb43665-image-20200503-085731.png`。

## [0.1.8] - 2026-06-18

### Changed

- AI 提问入口的预填 prompt 改按页面语言生成 (日 / 英 / 中), 不再固定英文。
  - `components/ai/page-actions.tsx`: `ViewOptionsPopover` 经 `useParams().lang` 取语言, 新增 `PROMPT_TEMPLATES` (ja/en/zh) 生成预填问句, 缺省回退 ja。

### Removed

- 概要页 (文档首页 / API Reference 首页) 移除「查看 markdown」入口 (这些页无 Markdown 正文)。
  - `app/[lang]/(docs)/[[...slug]]/page.tsx`: `page.url === '/' || '/openapi'` 时 `markdownUrl` 置 undefined。

## [0.1.7] - 2026-06-09

### Added

- 文档详情页新增「查看 markdown」入口, 一键打开当前页的 Markdown 源文。
  - `components/DocsTitleBar.tsx` 加 markdown 链接; 新增 `lib/url.ts` 统一 `.md` / OG / 资源链接绝对化 (基于新增的 `getRequestOrigin` in `lib/tenant.ts`); `app/[lang]/(docs)/[[...slug]]/page.tsx`、`app/[lang]/layout.tsx`、`app/[lang]/llms.txt/route.ts`、`components/ai/page-actions.tsx` 切换使用。

### Changed

- 改进 LLM / `.md` 导出: API Reference 现在输出完整的 OpenAPI 子文档 (paths / components / security / tags 按 `$ref` 递归); MDX 组件占位符渲染更稳定。
  - `source.config.ts` 启用 `mdxAsPlaceholder`; `lib/llm-postprocess.ts` 改用 fumadocs `renderPlaceholder` 替代自维护 regex / inline-code 切分; 新增 `lib/openapi-llm.ts` 将 APIPage 展开为含 paths / components / security / tags 的子文档, 按 `$ref` 递归收集; 顺手把 `components/Mermaid.tsx` 改名为 `EMermaid` 与 EHome / EText / EImg / EContainer 等自研 MDX 组件命名风格统一 (`mdx-components.tsx`、`source.config.ts` 占位符白名单、`lib/llm-postprocess.ts` 渲染分支、`lib/source.ts` 同步)。

### Fixed

- SMCC 站非 HTML 路由 (如 `/favicon.ico`) 不再错用 elepay 的 favicon。
  - `middleware.ts` 把 `/favicon.ico` 按租户 307 重定向到 `favicon-default.ico` / `favicon-smcc.ico`; `public/favicon.ico` 重命名为 `favicon-default.ico`。
- 快速开始 cURL 示例改用 `$ELEPAY_SECRET_KEY` 环境变量, 避免被 GitHub secret scanning 误判。
  - `content/docs/(home)/get-started/quickstart.{mdx,en.mdx,zh.mdx}` 把 `sk_test_xx` 替换为 `$ELEPAY_SECRET_KEY`; `components/api-page.client.tsx` playground auth 默认值改为 `sk_test_…` 让前缀结构更直观。
- Checkout 最佳实践页 Mermaid 时序图: 修复半角括号触发的 parse error; 英文版 Note 拆行避免溢出。
  - `content/docs/(home)/cases/best-practices.{mdx,en.mdx,zh.mdx}` sequenceDiagram Note 去除半角括号; 英文版用 `<br/>` 拆行。

## [0.1.6] - 2026-06-09

### Changed

- 文档导航重构: 主文档独立成「Docs」侧栏 tab, 与「API Reference」「changelog」等 tab 并列, 公开 URL 不变。
  - `content/docs/**` 整体迁入 `content/docs/(home)/` 路由组, 借 fumadocs `root:true` (新增 `(home)/meta.[lang].json`) 成为独立 tab; 顶层 `content/docs/meta.[lang].json` 精简至 tab 入口; `app/[lang]/(docs)/layout.tsx` 加 `tabs.transform` 按 host 把 `/` tab 标题替换为 `home_sidebar_title` (新增 `components/DocsTitleBar`)。同步抽出 `lib/nav-sections.ts` (`buildNavSections` + `NavSection`), `components/EHome.tsx`、`lib/llm-postprocess.ts` 不再各自拷贝 ~80 行 buildSections 逻辑; `EHome.root` 改必填, 主页 mdx 加 `root='/'`, 缺失由 TS 编译期拦截而非 silent 渲染错章节。
- OpenAPI 侧栏统一为「API Reference」分组导航 (Payments / Merchants / Subscriptions 等)。
  - `content/docs/openapi/meta.[lang].json` 顶层标题统一为 `API Reference`; `charge` / `customer` / `subscription` 等资源各自补 `meta.json` 完成分组。
- 文档底部上 / 下一页链接改用页面标题, 不再附带 description。
  - `lib/source.ts`: 上 / 下一页改读页面 `title` (回退 `name` / url 末段), 移除 description; `getFooterTitle` 删第三层 url-segment 兜底。
- SMCC 站侧栏首 tab 文案随租户切换 (elepay 站「elepay Docs」, SMCC 站「stera smart one Docs」)。
  - `lib/tenant-config.data.ts`: `elepay_docs` -> `home_sidebar_title`; `lib/layout.shared.tsx`、`app/[lang]/og/[...slug]/route.tsx` 改用 elepay 文案; `content/docs/(home)/meta.{,en,zh}.json` title 改中性 `Docs` 作为 transform 失效兜底。

### Docs

- 部署文档补 SMCC 租户的预览别名部署说明。
  - 部署 / 发布流程文档补 SMCC 预览别名部署命令与用户触发的 release 流程 (该批文档现已统一并入 [workflow.md](./workflow.md))。
</content>
