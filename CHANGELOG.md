# Changelog

[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [SemVer](https://semver.org/)。面向使用者, 中文行文, 命令 / 术语保留原文。

## [0.1.5] - 2026-06-03

### Added

- 新增「快速开始」页 (日 / 英 / 简), 归入「开发准备」分组。
- Checkout 新增「最佳实践」页 (日 / 英 / 简): 集成时序图与状态生命周期图、Webhook 处理步骤、以 charge 的 Webhook 判定结果、避免过度处理中间状态、有效期与重复创建、关闭 / 取消时的行为。
- 为 EasyQR 嵌入页补充创建 EasyQR 码的 cURL 请求示例。
- 文档支持 Mermaid 图表渲染。

### Changed

- 重构文档导航与目录结构: 新增「典型用例」分组, 将 Checkout、客户管理、EC 平台插件 (allvalue / EC-CUBE / WooCommerce) 归入其中; 「最佳实践」并入「开发指南」; SDK 文档导航重新编排。
- 统一 elepay (小写) 与 API 的大小写书写。

### Fixed

- 修正 Webhook 事件发送表述, 去除具体事件类型名 (如 `charge.captured`), 统一为「发送事件通知」。

## [0.1.4] - 2026-05-27

本次集中重构 OpenAPI **API Reference**。

### Changed

- 参数与请求体的字段说明 (description、format、取值 / 长度 / 数量约束、默认值、example) 内联到 playground 对应输入框旁; 正文不再单独重复展示 parameters / 请求体 / 认证三个区块。
- 标量字段 (字符串、数字等) 的名称、类型与输入框单行横排; 对象 / 数组 / 联合 (oneOf·anyOf·allOf) 类型仍竖排展开。
- 移除 playground 字段输入旁的清除 (×) 按钮, 改由手动清空输入框。
- 取消 `additionalProperties` 自动生成的占位样例字段 (property1 / property2)。
- 右侧响应面板在 playground「Send」后自动镜像真实响应体 (按 Content-Type 染色、JSON 自动美化), 并切换到对应状态码 tab。
- 真实响应状态码不在文档声明范围内时 (如仅声明 200 却返回 500), 追加该状态码 tab 呈现真实响应, 不再被丢弃。
- 成功响应只在右侧面板展示, 不在 playground 内原位重复; 网络 / CORS 等无 HTTP 响应的错误仍在 playground 内就地反馈。
- 响应区块与认证区块默认展开; 右侧响应面板高度随视口自适应 (sticky 状态下底部贴合视口底)。

### Fixed

- 归一化 OpenAPI media type、剥离 charset 参数 (`application/json;charset=utf-8` → `application/json`), 修复 API Reference 的 cURL 代码示例把请求体误渲染成 XML 的问题。

## [0.1.3] - 2026-05-21

### Added

- 新增 GMO 支付方式说明 (日 / 英 / 简)。

### Changed

- LLM / Markdown 导出文本更规整 (Callout 转 GFM Alert、剥离 MDX 注释等)。

## [0.1.2] - 2026-05-19

### Added

- OpenAPI 文档新增 PHP 代码示例 tab。

## [0.1.1] - 2026-05-15

### Changed

- 文档按租户分流优化。
- 调整 SMCC 租户的 Apple Pay 文档。

## [0.1.0]

文档站首版, 详见 [README.md](./README.md)。

- 多语言文档站 (日 / 英 / 简), 多租户按域名切换 elepay 与 SMCC。
- 替代既有的 developer.elepay.io 与 guides.sterasmartone.com。
- 内容覆盖: elepay (入门、SDK、API Reference、Checkout、EC 插件、FAQ、资源下载) 与 SMCC (SaaS Guides、SaaS FAQ)。
- 全文搜索 (含日 / 中分词)、AI 站内助手、LLM Markdown 导出、错误码实时拉取、老站 URL 兼容。
