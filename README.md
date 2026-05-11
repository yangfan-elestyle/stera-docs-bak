# Elepay Docs

公司对外的文档站，承载 `elepay` 与其贴牌业务线 `stera smart one`（SMCC）的全部对外说明。

这份 README 用来让同事快速了解这个站里有什么内容、提供了哪些能力。

## 现有的对外文档站

目前公司在用的对外文档站基于 readme.io 搭建：

- elepay：<https://developer.elepay.io/docs/introduction>
- stera smart one (SMCC)：<https://guides.sterasmartone.com/>

本仓库把这两个站的内容收拢到了同一份代码里，按访问域名展示对应业务。

## 站点能力

- Docs & API Reference 支持 日 / 英 / 简
- 按域名切换 elepay / SMCC 内容，共享部分共用一份
- 全文搜索支持日 / 中分词
- AI / LLM 入口：站内助手、LLM Markdown、`llms.txt`、`llms-full.txt`
- 错误码列表从后端实时拉取，失败时回退到内置快照
- 老站 URL 映射到本站对应页面
- 图片资源已迁入本仓库

## 内容覆盖

### `elepay` 侧

- **概要 — 入门**
  - Test 模式 / Live 模式与开发密钥
  - 决済（Charge）、退款（Refund）、顾客与支付方式登记（Customer / Source）的完整流程
  - 各支付方式在 iOS / Android 上的对接要点
  - 测试卡号一览
  - 错误码体系（Merchant / User / System 三类）
- **SDK 指南**
  - iOS、Android、JavaScript、服务端（Java / PHP）
  - React Native、Flutter
  - URL Scheme 取得方式
  - Webhook、Terminal 决済、决済 Extra 项设置
- **API Reference**
  - 完整 OpenAPI 规范页面，覆盖 Charge / Refund / Customer / Code / PaymentMethod / Terminal / Invoice / Dispute / Subscription / Location 等全部资源
- **Checkout — 低代码接入**
  - 托管页（Hosted）方案：跳转到 `elepay` 托管的支付页面
  - 嵌入式 QR Widget：在自有页面里嵌入支付二维码，可调样式
  - 适用场景：EC 网站、自助点单、精算机、券売機、自动售货机
- **E-Commerce 插件**
  - WooCommerce（WordPress）
  - EC-CUBE v3 / v4
  - AllValue
- **FAQ**：iOS、Android、服务端
- **资源下载**：iOS / Android SDK 文档归档

### `stera smart one`（SMCC）侧

- **SaaS Guides**：申请入驻、店舗 / 商品 / 订单 / 终端 / 营销 / 入金 / 团队等运营手册
- **SaaS FAQ**：审查、本人确认、合规（特商法等）、店内决済与在线决済申请等常见问题

## 决済方式

`elepay` 支持的决済方法（按地区与类别整理）：

<!-- prettier-ignore -->
| 区域 / 类别 | 决済方法 |
| --- | --- |
| 日本 QR 系 | PayPay、メルペイ、d 払い、au PAY、楽天ペイ、J-Coin Pay、銀行Pay、AEON Pay、スマートコード、Origami Pay、Woven City Pay |
| 日本 后払い・コンビニ | Paidy、atone、アトカラ、コンビニ决済、銀行振込 |
| 国际通用 | クレジットカード、Apple Pay、Google Pay、Amazon Pay、PayPal、Click To Pay |
| 中国 | Alipay、WeChat Pay、雲閃付（UnionPay）、Apple Pay 中国 |
| 港澳台 | Alipay HK、JKOPAY、全支付 |
| 韩国 | Kakao Pay、Naver Pay、Toss Pay |
| 东南亚 / 跨境钱包 | Alipay+、GCash、DANA、TrueMoney、TNG eWallet、EZ-Link、GrabPay、Momo Pay、BPI、Boost、HelloMoney by AUB、WellWa Points、Rabbit LINE Pay、Prompt Pay、LINE Pay |
| 電子マネー（FeliCa） | iD、QUICPay、交通系 IC |

实际可用范围以加盟店所在国家 / 地区与合同约定为准，可在 `elepay` 管理后台「简单决済 → 决済方法管理」中确认。

## 相关入口

- `elepay` 管理后台：<https://dashboard.elepay.io/>
- `stera smart one` 管理后台：<https://dashboard.sterasmartone.com/>
