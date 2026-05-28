# Elepay Docs

Elepay 与贴牌业务线 stera smart one (SMCC) 的统一对外文档站: 多语言 (日 / 英 / 简)、多租户 (按域名分流)、部署于 Cloudflare Workers。

替代既有的两个 readme.io 站点, 收拢进同一份代码, 按访问域名展示对应业务:

<!-- prettier-ignore -->
| 业务 | 旧站 | 管理后台 |
|---|---|---|
| elepay | <https://developer.elepay.io/docs/introduction> | <https://dashboard.elepay.io/> |
| SMCC | <https://guides.sterasmartone.com/> | <https://dashboard.sterasmartone.com/> |

## 站点能力

- Docs & API Reference 支持日 / 英 / 简
- 按域名切换 elepay / SMCC 内容, 共用部分共享一份
- 全文搜索 (含日 / 中分词)
- AI / LLM 入口: 站内助手、LLM Markdown、`llms.txt`、`llms-full.txt`
- 错误码列表从后端实时拉取, 失败回退内置快照
- 老站 URL 映射到本站对应页面

## 内容覆盖

**elepay 侧**

- 概要 — 入门: Test / Live 模式与密钥、Charge / Refund / Customer / Source 流程、各支付方式 iOS / Android 对接要点、测试卡号、错误码体系 (Merchant / User / System)
- SDK 指南: iOS、Android、JavaScript、服务端 (Java / PHP)、React Native、Flutter、URL Scheme、Webhook、Terminal 决済、决済 Extra
- API Reference: 完整 OpenAPI, 覆盖 Charge / Refund / Customer / Code / PaymentMethod / Terminal / Invoice / Dispute / Subscription / Location 等
- Checkout — 低代码接入: 托管页 (Hosted)、嵌入式 QR Widget; 适用 EC / 自助点单 / 精算机 / 券売機 / 自动售货机
- E-Commerce 插件: WooCommerce、EC-CUBE v3 / v4、AllValue
- FAQ (iOS / Android / 服务端)、资源下载 (SDK 文档归档)

**SMCC 侧**

- SaaS Guides: 申请入驻、店舗 / 商品 / 订单 / 终端 / 营销 / 入金 / 团队等运营手册
- SaaS FAQ: 审查、本人确认、合规 (特商法等)、店内 / 在线决済申请

## 决済方式

<!-- prettier-ignore -->
| 区域 / 类别 | 决済方法 |
| --- | --- |
| 日本 QR 系 | PayPay、メルペイ、d 払い、au PAY、楽天ペイ、J-Coin Pay、銀行Pay、AEON Pay、スマートコード、Origami Pay、Woven City Pay |
| 日本 后払い・コンビニ | Paidy、atone、アトカラ、コンビニ决済、銀行振込 |
| 国际通用 | クレジットカード、Apple Pay、Google Pay、Amazon Pay、PayPal、Click To Pay |
| 中国 | Alipay、WeChat Pay、雲閃付（UnionPay）、Apple Pay 中国 |
| 港澳台 | Alipay HK、JKOPAY、全支付 |
| 东南亚 / 跨境钱包 | Alipay+、GCash、DANA、TrueMoney、TNG eWallet、EZ-Link、GrabPay、Momo Pay、BPI、Boost、HelloMoney by AUB、WellWa Points、Rabbit LINE Pay、Prompt Pay、LINE Pay |
| 韩国 | Kakao Pay、Naver Pay、Toss Pay |
| 電子マネー（FeliCa） | iD、QUICPay、交通系 IC |

实际可用范围以加盟店所在国家 / 地区与合同约定为准, 可在 elepay 管理后台「简单决済 -> 决済方法管理」确认。

## 技术栈

Next.js 16 App Router + Fumadocs (16 / 14 / 10 系列) + React 19 + Tailwind CSS 4 + TypeScript 5.9 + Bun。部署: Cloudflare Workers + OpenNext (`@opennextjs/cloudflare`) + Wrangler 4。

## 项目结构

<!-- prettier-ignore -->
| 路径 | 说明 |
|---|---|
| `app/[lang]` | App Router: 多语言路由、布局、OG、LLM 入口、search API |
| `content/docs` | Fumadocs 渲染源 (`index.[lang].mdx` + `meta.[lang].json`) |
| `content/docs/sdks` | SDK 文档: `android/`、`ios/`、`server/`、`javascript/` |
| `content/docs/openapi` | OpenAPI 指南 + `(generated)/` (脚本生成) |
| `lib` | `source.ts` (loader)、`i18n.ts`、`tenant.ts` 等 |
| `components` / `assets` / `public` | 组件 / 资源 / 静态文件 |
| `scripts` | `generate-openapi*.ts`、`sync-openapi.ts`、`snapshot-error-codes.ts` |
| `docs/多租户编写指南.md` | 多租户内容编写规范 |

多语言命名: `index.mdx` (默认 ja) / `index.en.mdx` / `index.zh.mdx`, 同名 `meta.*.json` 必须同步。导入用别名 `@/*`、`@/.source`。

## 本地开发

```bash
# 1. 私有依赖 @elepay-io/* 需 read 权限的 GitHub PAT
export GH_PACKAGES_TOKEN=<your_github_pat>

# 2. 装依赖 (postinstall 跑 fumadocs-mdx 生成 .source/)
bun install

# 3. 生成 OpenAPI JSON/MDX + 错误码快照 (clone 后必跑; data/ 与 (generated)/ 在 .gitignore)
bun run generate:data

# 4. 启动 dev
bun run dev   # http://localhost:3000
```

其他命令:

<!-- prettier-ignore -->
| 命令 | 说明 |
|---|---|
| `bun run build` | 生产构建 (需先 `generate:data`) |
| `bun start` | 启动 Next 独立服务 (本地校验) |
| `bun run types:check` | `fumadocs-mdx` + `next typegen` + `tsc --noEmit` |
| `bun run cf-typegen` | 从 `wrangler.jsonc` 生成 `cloudflare-env.d.ts` |

`bun run dev` 本机多租户访问 (需配置本机 host, 默认通常通畅; 一般由 AI 用本地预览部署验证, 此为开发人员极端手动调试):

```text
http://docs.stg.elepay.localhost:3000/
http://docs-smcc.stg.elepay.localhost:3000/
```

## 同步上游 OpenAPI

`openapi.yaml` (ja) 源头是私有仓库 `elepay-io/elepay-charge-api` 的 `client/elepay-client-sdk.yaml`。上游 API 变更后:

```bash
bun run sync:openapi    # 拉 ja 覆写 openapi.yaml, 并自动翻译 en/zh (脚本已内置 --translate)
bun run generate:data   # 重新生成 data/openapi/*.json 与 (generated)/**
```

`sync:openapi` 需本地 `gh` 已登录 (含 `repo` scope, 用于拉取) + `claude` 命令已交互登录 (走 keychain OAuth, 用于翻译)。脚本幂等补全上游缺失的顶层 `tags`; 目标语言文件已存在时翻译走 `git diff` 增量。仅要 ja、不翻译时直接跑 `bun run scripts/sync-openapi.ts` (去掉 `--translate`)。

## 关键文件导航

**App Router** (`app/[lang]`)

- 页面渲染: `(docs)/[[...slug]]/page.tsx`; 目录树来源 `lib/source.ts -> source.pageTree`
- 布局: `layout.tsx` (全局) / `(docs)/layout.tsx` (文档, 用 `fumadocs-ui`)
- 中间件: `middleware.ts` (`createI18nMiddleware` 多语言路由 + 静态资源排除); `hideLocale: 'always'` (`lib/i18n.ts`) 使对外 URL 不含 locale 前缀, 语言由 cookie 判断, **URL 不带 `/ja` `/en` `/zh`**
- OG: `og/[...slug]/route.tsx`; LLM: `llms-full.txt/route.ts`、`llms.mdx/[[...slug]]/route.ts`
- 搜索: `api/search/route.ts` (`fumadocs-core/search` + Orama 日 / 中分词)

**Fumadocs**

- `source.config.ts`: frontmatter / `meta.json` 的 Zod schema 与 MDX 选项
- `lib/source.ts`: 装配 loader, 挂 `openapiPlugin` 与图标插件
- `mdx-components.tsx`: 注册 `APIPage` 渲染 OpenAPI 页面
- `lib/i18n.ts`: 默认语言与语言列表

**Cloudflare**

- `wrangler.jsonc`: 单 Worker `elepay-docs`; `DOCS_ENV` 在 build 注入 (staging / product)
- `open-next.config.ts`: OpenNext adapter (默认配置)
- `public/_headers`: Static Assets 头部 (动态响应不受影响)

## 生成文件 (勿手改, 见 AGENTS 硬约束)

<!-- prettier-ignore -->
| 文件 | 来源 |
|---|---|
| `.source/index.ts` | `postinstall` 跑 `fumadocs-mdx` |
| `content/docs/openapi/(generated)/**` | `bun run generate:data` |
| `data/openapi/*.json` | `bun run generate:data` (.gitignore) |
| `data/error-codes.snapshot.json` | `snapshot-error-codes.ts` 从后端拉取 (.gitignore) |
| `cloudflare-env.d.ts` | `bun run cf-typegen` |
| `next-env.d.ts` | Next 自动生成 |

## Coding Style

- TypeScript 严格模式; React 19; Next 16 App Router
- Prettier: 2 空格 / 单引号 / 尾随逗号 (`.prettierrc`)
- 组件 PascalCase; 路由段 / 文件夹 kebab-case
- `output: 'standalone'` (`next.config.mjs`) 由 OpenNext 消费, 保留

## Architecture Notes

- `compatibility_flags` 含 `global_fetch_strictly_public`: Worker 内 `fetch()` 禁直连同账号 Workers / Pages / R2。新增 SSR 拉同账号服务 (含本站自身) 必须走 service binding, 不能 `fetch('https://docs.elepay.io/...')`。`WORKER_SELF_REFERENCE` 为预留 binding, 当前源码未用。
- Host / Proto 以请求 `Host` 头为唯一信源 (`lib/tenant.ts`)。CF Custom Domain 直连后 `X-Forwarded-Host` / `X-Forwarded-Proto` 不可信, 禁止依赖。

## 常见修改任务速查

- **新增文档**: 建 `index.mdx` 或 `*.mdx` + frontmatter; 同步 `meta.json` 排序 / 标题。多语言并列建 `.en` / `.zh` 与对应 `meta.*.json`。
- **新增导航分组**: 编辑同层 `meta.json` 的 `items` (遵循 `source.config.ts` schema)。
- **更新 OpenAPI**: 改 `openapi.yaml` (或 `.en` / `.zh`) -> `bun run generate:data`; 上游同步见上节。
- **增 / 改语言**: 改 `lib/i18n.ts` 的 `languages` / `defaultLanguage` / `fallbackLanguage`; 检查 `content/docs/**` 对应文件。
- **主题 / 样式**: 在 `app/global.css` 引入 Tailwind 与 Fumadocs 预设 (Tailwind v4 原子化)。

## 部署

- **本地预览** (AI 默认): 本地 `wrangler` 部署到个人 CF (deploy 后命令输出 `*.workers.dev` URL), 直接访问验证, 无需人工。
- **公司正式发布**: PR merge -> Actions (CF 公司凭证仅在 GitHub Secrets)。

命令、触发规则、Secrets -> [deploy.md](./deploy.md)。
