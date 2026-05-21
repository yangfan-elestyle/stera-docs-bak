# Changelog

## [0.1.3] - 2026-05-21

### Added

- 新增 elepay 版本与 GMO 支付方式说明（`pays.*`、`sdks/android/index.*`、`sdks/ios/index.*` 三语同步）。

### Changed

- LLM 导出后处理增强：`<Callout>` → GFM Alert、`<APIPage>` → `**Endpoint**`、剥离 `{/* ... */}` MDX 注释，并修正含反引号 Callout 跨段匹配问题。

## [0.1.2] - 2026-05-19

### Added

- OpenAPI 文档新增 PHP 代码示例 tab（基于 `@scalar/snippetz` 的 `phpCurl` 插件，封装为客户端代码生成器并补齐 `CURLOPT_RETURNTRANSFER` / 响应捕获 / `echo $response`）。

## [0.1.1] - 2026-05-15

### Changed

- 文档按租户分流优化。
- SMCC 租户的 Apple Pay 文档调整。

## [0.1.0]

详见 `README.md`。

- 多语言文档站：日 / 英 / 简。
- 多租户：按域名切换 elepay 与 SMCC（stera smart one）内容。
- 替代既有的 `developer.elepay.io` 与 `guides.sterasmartone.com`。
- 内容覆盖：elepay（入门、SDK、API Reference、Checkout、EC 插件、FAQ、资源下载）与 SMCC（SaaS Guides、SaaS FAQ）。
- 能力：全文搜索（含日 / 中分词）、AI 站内助手、LLM Markdown 导出、错误码实时拉取、老站 URL 兼容。
