# fumadocs-openapi 配置指南

OpenAPI 文档页的全部可调参数 + 项目落点 + 微调速查。当前 `fumadocs-openapi@10.8.1`。

> **10.8.x 的 API 与网上多数旧教程差异大** (旧 `<APIPage>` 的 `hasHead` / `disablePlayground` 等 props 已移除)。一切以本地类型为准: `node_modules/fumadocs-openapi/dist/**/*.d.ts`。

## 配置分层

<!-- prettier-ignore -->
| 层 | 函数 | 文件 | 管什么 |
|---|---|---|---|
| 渲染层 ★ | `createAPIPage()` | `components/api-page.tsx` | 页面长什么样: 区块 / 示例 / 高亮 / playground / 布局 |
| 客户端 | `defineClientConfig()` | `components/api-page.client.tsx` | 客户端侧配置 (含 patch 的 playground 留空) |
| schema 层 | `createOpenAPI()` | `lib/openapi.ts` | schema 源 / 代理, 很薄 |
| 生成层 | `generateFiles()` | `scripts/generate-openapi.ts` | 生成哪些 mdx / 目录结构; 改后须 `bun run generate:data` |
| 单页 props | `<APIPage>` | `content/docs/openapi/(generated)/**` (生成物, MUST NOT 手改) | 单页粒度 |

微调 90% 落在渲染层。改生成层会动文件结构 / 导航, 须重生成。

## 微调速查 (想改 X -> 动哪里)

<!-- prettier-ignore -->
| 想做 | 改 | 层 |
|---|---|---|
| 只留示例+TS, 不铺完整响应 schema | `showResponseSchema: false` | 渲染 |
| 关闭 playground "试一试" | `playground.enabled: false` | 渲染 |
| 关闭响应区 TS 类型 | `generateTypeScriptDefinitions: false` | 渲染 |
| 换高亮主题 | `shikiOptions.themes` | 渲染 |
| 增删 / 调序代码示例语言 tab | `generateCodeSamples` / `codeUsages` | 渲染 |
| schema 字段下带示例 | `schemaUI.showExample: true` | 渲染 |
| 隐藏 / 重排操作页区块 (参数 / 响应 / body...) | `content.renderOperationLayout` | 渲染 |
| 整页不显示标题 / 描述 | `showTitle` / `showDescription` | 单页 |
| 改文件分组 (按 tag / route) | `groupBy` | 生成 -> `generate:data` |
| 改每页粒度 (每端点 / 每 tag) | `per` | 生成 -> `generate:data` |
| 给生成页注入组件 | `imports` | 生成 -> `generate:data` |
| playground 跨域失败 | `proxyUrl` | schema |

## 1. 渲染层 `createAPIPage()` ★

类型 `CreateAPIPageOptions` (`dist/ui/base.d.ts`)。控制页面外观的主战场。

<!-- prettier-ignore -->
| 选项 | 类型 | 默认 | 控制 |
|---|---|---|---|
| `showResponseSchema` | `boolean` | `true` | 完整响应 schema vs 仅示例+TS 定义 |
| `generateCodeSamples` | `(method)=>Gen[]` | — | 每端点代码示例 tab (✅ 已加 PHP) |
| `codeUsages` | registry | — | 内置代码用例 (curl / js / python / go / java / csharp) |
| `generateTypeScriptDefinitions` | `fn \| false` | 启用 | 响应区 TS 类型; `false` 关闭 |
| `shiki` / `shikiOptions` | factory / opts | 内置默认 | 高亮引擎 / 主题语言 (改主题传 `shikiOptions.themes`) |
| `renderMarkdown` | `(md)=>node` | — | 描述文本的 MD 渲染 |
| `schemaUI.showExample` | `boolean` | `false` | JSON schema 字段下是否带示例 |
| `schemaUI.render` | `fn` | — | 完全自定义 schema 信息 UI |
| `playground.enabled` | `boolean` | `true` | "试一试"交互面板开关 |
| `playground.provider` | `fn` | — | 页级 provider (注入 auth) |
| `playground.render` | `fn` | — | 替换 playground 服务端渲染 |
| `content.renderOperationLayout` | `fn` | — | 重排 / 隐藏操作页区块 (见下) |
| `content.renderWebhookLayout` | `fn` | — | 同上, webhook 版 |
| `content.renderPageLayout` | `fn` | — | 整页布局 (所有 operations + webhooks) |
| `content.renderResponseTabs` / `renderRequestTabs` | `fn` | — | 响应 / 请求 tab 渲染 |
| `content.renderAPIExampleLayout` / `renderAPIExampleUsageTabs` | `fn` | — | 右侧示例区布局 / 用例 tab |
| `renderHeading` | `(props, depth)=>node` | — | 标题渲染 |
| `renderCodeBlock` | `({lang, code})=>node` | — | 代码块容器 |
| `mediaAdapters` | `Record<string, MediaAdapter>` | — | 额外媒体类型编码 / codegen |
| `client` | client 配置 | ✅ | 接 `api-page.client.tsx` |
| `generateTypeScriptSchema` | deprecated | — | 旧版, 改用 `generateTypeScriptDefinitions` |

`content.renderOperationLayout` 的 slot (按需重排 / 置空即隐藏): `header` / `description` / `apiExample` / `apiPlayground` / `authSchemes` / `parameters` / `body` / `responses` / `callbacks`。

改法示例:

```tsx
// components/api-page.tsx
export const APIPage = createAPIPage(openapi, {
  client,
  showResponseSchema: false,        // 只留示例+TS, 不铺完整响应 schema
  playground: { enabled: false },   // 关闭"试一试"
  schemaUI: { showExample: true },  // schema 字段下带示例
  shikiOptions: { themes: { light: 'github-light', dark: 'github-dark' } },
  generateCodeSamples: () => [/* ... */],
});
```

## 2. 单页 `<APIPage>` props

类型 `ServerApiPageProps` (`dist/ui/api-page.d.ts`)。生成物里逐页写入, 手改无效, 须经生成层模板影响。

<!-- prettier-ignore -->
| prop | 类型 | 控制 |
|---|---|---|
| `document` | `string` | schema id (必填) |
| `showTitle` | `boolean` | 标题显隐 |
| `showDescription` | `boolean` | 描述显隐 |
| `operations` | `[{path, method}]` | 只渲染指定 operation 子集 |
| `webhooks` | `[{name, method}]` | 指定 webhook 子集 |

## 3. 生成层 `generateFiles()`

类型合并 `GenerateFilesConfig + SchemaToPagesOptions + PagesToTextOptions` (`dist/generate-file.d.ts` / `dist/utils/pages/*.d.ts`)。改后 MUST `bun run generate:data`。

<!-- prettier-ignore -->
| 选项 | 类型 | 默认 | 控制 |
|---|---|---|---|
| `per` | `'operation' \| 'tag' \| 'file' \| 'custom'` | `operation` | 每页粒度 |
| `groupBy` | `'tag' \| 'route' \| 'none' \| fn` | `none` | operation 模式文件夹分组 (✅ `tag`) |
| `name` / `slugify` | `fn \| {algorithm}` | v2 | 输出文件名算法 |
| `includeDescription` | `boolean` | `false` | description 写入正文 (✅ `true`) |
| `addGeneratedComment` | `boolean \| string` | `true` | 顶部"自动生成"注释 |
| `imports` | `[{names, from}]` | — | 给生成 mdx 注入额外 import |
| `frontmatter` | `fn` | — | 自定义 frontmatter |
| `index` | `{items, url}` | — | 生成卡片索引页 |
| `meta` | `boolean \| {folderStyle}` | — | 自动 `meta.json` (项目自管, 未用) |
| `beforeWrite` | `fn` | — | 写盘前改文件 (✅ 加语言后缀) |
| `watch` | `boolean` | — | schema 变更重生成 |

## 4. schema 层 `createOpenAPI()`

类型 `OpenAPIOptions` (`dist/server/create.d.ts`)。10.8.x 已把高亮 / 渲染全迁到渲染层, 此层很薄。

<!-- prettier-ignore -->
| 选项 | 类型 | 控制 |
|---|---|---|
| `input` | `string[] \| ()=>SchemaMap` | schema 源 (✅ 三语言) |
| `disableCache` | `boolean` | 禁缓存 |
| `proxyUrl` | `string` | playground 跨域代理 URL |

## 约束

- **生成物 MUST NOT 手改** + 改生成层后须重生成 -> [AGENTS.md](../AGENTS.md) 硬约束。
- **patch 层已有定制** (playground 输入留空 / scalar 空态等) 在 `patches/fumadocs-openapi@10.8.1.patch`; 动 `client` / `playground` 前先看 patch, 打 patch 方式见 [README.md](../README.md)。
- **核对源**: 渲染层 `dist/ui/base.d.ts` / 单页 `dist/ui/api-page.d.ts` / 生成层 `dist/generate-file.d.ts` + `dist/utils/pages/*.d.ts` / schema 层 `dist/server/create.d.ts`。

## 参考 (可能领先于 10.8.1)

- 总览: https://www.fumadocs.dev/docs/integrations/openapi
- `createOpenAPI()`: https://www.fumadocs.dev/docs/integrations/openapi/server
- `generateFiles()`: https://www.fumadocs.dev/docs/integrations/openapi/generate-files
- `<APIPage />`: https://www.fumadocs.dev/docs/integrations/openapi/api-page
