# AGENTS

elepay / SMCC 多租户文档站 (Next 16 + Fumadocs + Cloudflare Workers)。工程总览 -> [README.md](./README.md); 部署 -> [deploy.md](./deploy.md); 文档写法 -> [llm-doc-style.md](./llm-doc-style.md)。

## 工作模式 (AI 全程闭环)

- AI 自行做最优抉择、完成需求开发(文档编辑&代码编写) & 预览部署验证。Release (版本号 + 双文件 CHANGELOG, 流程 -> [release.md](./release.md)) 仅由用户主动触发, AI MUST NOT 自启。非阻塞问题，MUST NOT 反问人类意见。
  - 全部由 AI 操作, 无需人工接入
  - MUST NOT localhost 预览验证验收, 预览部署参考 -> [deploy.md](./deploy.md)。
  - 设计决策 (架构 / 选型 / 命名 / 依赖) 以 AI 判断为准, 非必要 MUST NOT 反问。用户 = 最终验收者。

## 硬约束

- MUST NOT 直接编辑生成物: `.source/**` / `content/docs/openapi/(generated)/**` / `data/**` / `.next/**` / `.open-next/**` / `out/**` / `cloudflare-env.d.ts` / `next-env.d.ts`。
- 改 `openapi.yaml` (或 `.en` / `.zh`) 后 MUST 跑 `bun run generate:data` 刷新; 新克隆仓库 MUST 先 `generate:data` 再 `dev` / `build`。
- mdx path 变更时，同步相关 mdx 引用与 `lib/legacy-redirects.mjs`
- 改导航 / 排序 MUST 同步所有语言 `meta.[lang].json` (ja / en / zh), 否则菜单缺失或顺序错乱。
- 多语言命名: `index.mdx` (默认 ja) / `index.en.mdx` / `index.zh.mdx`; 缺失语言回退 `index.mdx`。
- **i18n 不走 URL**: `hideLocale: 'always'` (`lib/i18n.ts`) 使对外 URL 永远**不含** locale 前缀, 语言由 cookie 判断 (middleware 设置)。引用 / 构造站内 URL MUST NOT 加 `/ja` `/en` `/zh` (用 `/docs/xxx` 而非 `/en/docs/xxx`)。源码的 `app/[lang]` 段与内容文件 `index.[lang].mdx` 是内部 / 文件层 locale, 不映射到 URL。
- 导入用别名 `@/*` / `@/.source`, 避免相对路径穿越。
- Git: 暂存区 MUST NOT 写; Commit / push 仅在会话明确授权时执行; 例外: 用户主动触发的 release 流程允许 AI `git add` + commit (push 仍由用户, 不打 tag) -> [release.md](./release.md)。

## Fumadocs

- Page conventions: `meta*.json` `pages` 中, 页面/目录 = `path`; link = `[Icon][Text](url)`, 例 `"[x][x](../openapi)"`; external link = `external:[Icon][Text](url)`;
- Fumadocs 官方文档：https://www.fumadocs.dev/docs

## 文档约束

- MUST 简洁精炼, 重点突出, 零冗余; 写法规范 -> [llm-doc-style.md](./llm-doc-style.md), 审稿对照其"反模式"段。
- 单一信源: 跨文档用 link 引用, MUST NOT 复述事实。
- MUST NOT 使用 `<!-- prettier-ignore -->` 做 markdown 的 table 标记
