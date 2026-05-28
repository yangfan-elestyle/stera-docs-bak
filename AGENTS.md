# AGENTS

Elepay / SMCC 多租户文档站 (Next 16 + Fumadocs + Cloudflare Workers)。工程总览 -> [README.md](./README.md); 部署 -> [deploy.md](./deploy.md); 文档写法 -> [llm-doc-style.md](./llm-doc-style.md)。

## 工作模式 (AI 全程闭环)

- 编辑文档 / 改代码 / OpenAPI 同步与重生成 / CHANGELOG / **本地预览部署** 全部由 AI 操作, 一般无需人工接入。
- **预览部署**: 用本地 `wrangler` (个人账号, 已登录) 跑 `bunx opennextjs-cloudflare deploy`, 发到个人 CF, deploy 退出即完成 (AI 不验证 URL/链路, 人类验收), 不触及公司平台。流程 -> [deploy.md](./deploy.md)。
- **公司正式发布**: 走 PR merge -> Actions, CF 公司凭证仅在 GitHub Secrets, 本地无法部署公司账号。
- 极端情况开发人员本地手动调试: `bun run dev` + 两个 localhost。
- 设计决策 (架构 / 选型 / 命名 / 依赖) 以 AI 判断为准, 非必要 MUST NOT 反问。用户 = 触发者 + 验收者。

## 硬约束

- MUST NOT 直接编辑生成物: `.source/**` / `content/docs/openapi/(generated)/**` / `data/**` / `.next/**` / `.open-next/**` / `out/**` / `cloudflare-env.d.ts` / `next-env.d.ts`。
- 改 `openapi.yaml` (或 `.en` / `.zh`) 后 MUST 跑 `bun run generate:data` 刷新; 新克隆仓库 MUST 先 `generate:data` 再 `dev` / `build`。
- 改导航 / 排序 MUST 同步所有语言 `meta.[lang].json` (ja / en / zh), 否则菜单缺失或顺序错乱。
- 多语言命名: `index.mdx` (默认 ja) / `index.en.mdx` / `index.zh.mdx`; 缺失语言回退 `index.mdx`。
- **i18n 不走 URL**: `hideLocale: 'always'` (`lib/i18n.ts`) 使对外 URL 永远**不含** locale 前缀, 语言由 cookie 判断 (middleware 设置)。引用 / 构造站内 URL MUST NOT 加 `/ja` `/en` `/zh` (用 `/docs/xxx` 而非 `/en/docs/xxx`)。源码的 `app/[lang]` 段与内容文件 `index.[lang].mdx` 是内部 / 文件层 locale, 不映射到 URL。
- CF Worker 内 `fetch()` 禁直连同账号资源 (`global_fetch_strictly_public`); Host / Proto 以请求 `Host` 头为唯一信源 (`lib/tenant.ts`), MUST NOT 依赖 `X-Forwarded-*`。
- 导入用别名 `@/*` / `@/.source`, 避免相对路径穿越。
- Git: 暂存区 MUST NOT 写 (可能存 diff, 可读); MUST NOT 主动 push; MUST NOT 直推 `master` / `develop` (仅 PR merge)。

## 文档约束

- 全部根目录 md MUST 简洁精炼, 重点突出, 零冗余; 写法规范 -> [llm-doc-style.md](./llm-doc-style.md), 审稿对照其"反模式"段。
- 单一信源: 跨文档用 link 引用, MUST NOT 复述事实。
- 能一行不写两行, 能列表不写段落。
