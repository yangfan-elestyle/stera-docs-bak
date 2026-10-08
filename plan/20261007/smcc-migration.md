# SMCC ReadMe -> seed 迁移 (2026-10-08)

来源: `docs/raw-smcc-documents/sterasmartone-v1.0-2026-10-07T10-15-41_bb38409` (ReadMe 导出 2026-10-07, 图片已本地化至 `public/docs`; 全部处理后已删除, 原文见 `d6b98da`)。对应 [roadmap](./roadmap.md) §1 / §2。

## 规则

- 结构 = seed 现有定义 (slug / 分组 / 分隔符); 正文 = SMCC ja 原文; 无 seed 对应页 -> 在同分组下新建。
- en / zh = 仅 frontmatter `title` (ja) 的空页, 待统一翻译; 导航 `meta.{en,zh}.json` 保留既有译名, `pages` 与 ja 一致。
- hidden: ReadMe `hidden: true` -> frontmatter `hidden: true` (ja / en / zh 同); 页面仍列入所在 `meta*.json` 的 `pages` (admin 树可见); 前台 = 不进侧边栏 / 搜索 / `llms.txt`, 直链 200 + `noindex`。
- 转换: ReadMe 单换行 = `<br>` -> 行尾 `\`; `<Image>` / `<Table>` / `<HTMLBlock>` -> Markdown; `<TutorialTile>` -> 对应 Recipe 页链接; `<Callout>` -> `> 📘 标题` 引用块; `excerpt` -> `description`。
- Recipes -> `cases/checkout/{create-easyqr,return-url,widget-ui}` 普通页; 交互式代码行高亮 -> 「参照コード行」列表。
- 链接: ReadMe / `developer.elepay.io` 文档链接 -> 下表新 URL; `/reference/*` -> `/openapi/*`。
- 错误码表: 全部语言数据与 `https://api.elepay.io/error-codes` 的 `items` 一致，改用 `<ErrorCodeTable>` (`error-codes.json`); 删除 API 未列出的 `M002008`，新增 `M008000`，同步 `U002001-3` 的全部语言文案。
- API: `openapi.yaml` = SMCC `reference/elepay-client-sdk.yaml` (现网 API Reference); 保留 2 处: `createInvoice` / `createReader` / `createSubscription` 成功响应 `200` (elepay-docs DEV-10733), 顶层 `Location` tag (`generate-openapi-json.ts` 要求 tag 已声明; 置末尾 = 现网顺序)。`openapi.{en,zh}.yaml` 同步结构, 新增文案译为 en / zh。
- `seed/updated-at.json` = 现网 ReadMe `updatedAt`; 无现网时间 (Recipes) -> 导出时间 2026-10-07。
- 相对 SMCC 原文的修正:
  - 口座名義 FAQ「数字（全角）」示例 -> `０１２３４５６７８９` (原文半角, 与字段要求矛盾)。
  - Recipes 代码: Ruby header 下标闭合 / curl header 行续接 / Widget 示例 SDK 地址 `stg-js.elepay.io` -> `js.elepay.io`。
  - hidden 页语法崩坏: `elepay-sdk-for-ios` 代码块围栏嵌套 (现网 2 段代码合成 1 段) -> 拆回 3 段 / `cpm` curl `--user` 行续接与带说明 `<Image>` / `easyqr` 代码外层 ReadMe JSON 包装 / `お申込マニュアル` 行内断词「お願いいたしま\nす」。
  - 失效链接: `easyqr` 的 `doc:javascript-sdkリファレンス` -> `/guides/javascript/api-reference`; `cpm` 的 `extra-setting#決済リソースは-offline-の場合` -> `#決済リソースは-cpm-の場合`; `error-code` 页「旧エラーコード一覧」`developer.elepay.io` 外链 -> 站内 `/get-started/error-code-legacy`。
  - 删除原文残留: `qrwidget` 的「ChatGPT сказал:」/ 入金・手数料 页的 `Untitled-1` `Untitled-2` / Recipes 占位 `{"success":true}` 与 `<<user>>`。

## 旧 URL -> 新 URL

<!-- prettier-ignore -->
| ReadMe | stera-docs |
|---|---|
| `/docs/加盟店申請マニュアル` | `/smcc/guide/stera-smart-one-app-manual` |
| `/docs/stera-smart-oneお申込マニュアル` (hidden) | `/smcc/guide/application-manual-saas` |
| `/docs/店舗追加マニュアルsaasサービス` | `/smcc/guide/add-store-saas` |
| `/docs/店舗追加マニュアル決済モジュール` | `/smcc/guide/add-store-payment-module` |
| `/docs/クイックスタートガイド` | `/smcc/guide/quick-start-guide` |
| `/docs/アカウント管理マニュアル` | `/smcc/guide/account-management-manual` |
| `/docs/注文返金処理について` | `/smcc/guide/base-settings/order-and-refund-processing` |
| `/docs/商品編集について` | `/smcc/guide/base-settings/about-product-editing` |
| `/docs/店舗商品やカテゴリーの表示順序の変更について` | `/smcc/guide/base-settings/changing-the-display-order` |
| `/docs/クーポンコードについて-1` | `/smcc/guide/option-settings/issuing-coupon-codes` |
| `/docs/キャンペーン設定について` | `/smcc/guide/option-settings/campaign-settings` |
| `/docs/プロモーションoptionalについて` | `/smcc/guide/option-settings/about-promotion` |
| `/docs/在庫管理optionalについて` | `/smcc/guide/option-settings/inventory-management` |
| `/docs/領収書発行optionalについて` | `/smcc/guide/option-settings/receipt-issuance` |
| `/docs/消費税設定optionalについて` | `/smcc/guide/option-settings/consumption-tax-setting` |
| `/docs/注文メモ機能について` | `/smcc/guide/option-settings/order-note-function` |
| `/docs/決済機能の請求書決済について` | `/smcc/guide/option-settings/regarding-invoice-payment` |
| `/docs/端末紐付けについて` | `/smcc/guide/terminal-settings/regarding-the-device-binding` |
| `/docs/smart-one-kdswaitの設定について` | `/smcc/guide/terminal-settings/wait-settings` |
| `/docs/smart-one-shopのキオスクモード解除について` | `/smcc/guide/terminal-settings/smart-one-shop-release` |
| `/docs/smart-one-shopのアプリ設定について` | `/smcc/guide/terminal-settings/shop-app-settings` |
| `/docs/smart-one-shopのインストールについて` | `/smcc/guide/terminal-settings/about-the-installation` |
| `/docs/決済申請から2週間以上経過し-まだ審査結果が出ておりません-審査プロセスを迅速化することは可能でしょうか` | `/smcc/faq/application-review-delay` |
| `/docs/faq-entry-common-identification-documents` | `/smcc/faq/id-verification-photo` |
| `/docs/店頭等で設置するためのマニュアルはありますか` | `/smcc/faq/store-setup-manual` |
| `/docs/海外法人海外住所の審査は可能でしょうか` | `/smcc/faq/overseas-application-policy` |
| `/docs/長期間の使用履歴が無い場合` | `/smcc/faq/inactive-account-policy` |
| `/docs/取引データの照会可能期間およびデータの保存期限はどれくらいですか` | `/smcc/faq/transaction-data-retention` |
| `/docs/faq-entry-online-spctact` | `/smcc/faq/specified-commercial-transactions` |
| `/docs/faq-entry-common-bank-account-holder` | `/smcc/faq/bank-account-entry-guidelines` |
| `/docs/申込にあたり-お店側で準備が必要なものはありますか` | `/smcc/faq/apply-in-store-pay/application-preparation` |
| `/docs/開業前のstera-smart-one申し込みについて` | `/smcc/faq/apply-in-store-pay/open-business-application` |
| `/docs/サービス名屋号名と店舗名の違いは何ですか` | `/smcc/faq/apply-in-store-pay/service-name-vs-store-name` |
| `/docs/どんな画像を用意するといいのですか` | `/smcc/faq/apply-in-store-pay/store-photo-guidelines` |
| `/docs/faq-entry-common-preparation` | `/smcc/faq/apply-in-store-pay/license-submission-guidelines` |
| `/docs/特定の業種や店舗で申請は制限されていますか` | `/smcc/faq/apply-in-store-pay/apply-restriction` |
| `/docs/faq-entry-store-shop-photo` | `/smcc/faq/apply-in-store-pay/store-photo-requirements` |
| `/docs/オンライン決済審査に向けた準備` | `/smcc/faq/apply-online-pay/online-payment-preparation` |
| `/docs/オンライン決済の審査に不合格となる可能性が高い業種や商品` | `/smcc/faq/apply-online-pay/online-payment-rejection` |
| `/docs/特定商取引法に基づく表記とは何ですか` | `/smcc/faq/apply-online-pay/specified-commercial-transaction-law` |
| `/docs/payment-invoice-change-address` | `/smcc/faq/invoice-address-change` |
| `/page/クイックスタートガイド` | `/smcc/faq/payout-and-fees` |
| `/docs/introduction` | `/get-started/introduction` |
| `/docs/installtion` | `/get-started/installation` |
| `/docs/quick-start` | `/get-started/quickstart` |
| `/docs/init-setting` | `/get-started/set-up` |
| `/docs/charges` | `/get-started/process` |
| `/docs/test-card` | `/get-started/test-card` |
| `/docs/refunds` | `/get-started/refunds` |
| `/docs/custom` | `/cases/customer` |
| `/docs/api-guide` | `/guides/api-guide` |
| `/docs/copy-of-エラーコード` | `/get-started/error-code` |
| `/docs/error-code` (hidden) | `/get-started/error-code-legacy` |
| `/docs/testing` (hidden) | `/get-started/testing` |
| `/docs/cpm` (hidden) | `/cases/cpm` |
| `/docs/easycheckout` (hidden) | `/cases/checkout/easycheckout` |
| `/docs/easyqr` (hidden) | `/cases/checkout/easyqr` |
| `/docs/extra-setting` | `/guides/extra-setting` |
| `/docs/webhook` | `/guides/webhook` |
| `/docs/checkout` | `/cases/checkout` |
| `/docs/sso-hosted` | `/cases/checkout/elepay-hosted` |
| `/docs/qrwidget` | `/cases/checkout/qrwidget` |
| `/docs/terminals` | `/guides/terminals` |
| `/docs/server-sdk` | `/guides/server` |
| `/docs/ios-sdk` | `/guides/mobile/ios` |
| `/docs/app-clips` | `/guides/mobile/ios/app-clips` |
| `/docs/elepay-sdk-for-ios` (hidden) | `/guides/mobile/ios/elepay-sdk-for-ios` |
| `/docs/android-sdk` | `/guides/mobile/android` |
| `/docs/js-sdk` | `/guides/javascript` |
| `/docs/react-native-sdk` | `/guides/other-sdk` |
| `/docs/ios-android-sdk-url-scheme` | `/guides/mobile/url-scheme` |
| `/docs/js-sdk-reference` | `/guides/javascript/api-reference` |
| `/docs/ec-cube-plugin` | `/cases/ec-cube-plugin` |
| `/docs/woocommerce-plugin` | `/cases/woocommerce-plugin` |
| `/docs/allvalue` | `/cases/allvalue` |
| `/docs/ios-sdk-1` | `/faq/faq-ios` |
| `/docs/開発ガイドp` | `/get-started/quickstart` |
| `/docs/summary` | `/guides/mobile/payment-methods-config` |
| `/docs/line-pay` | `/guides/mobile/payment-methods-config#line-pay` |
| `/docs/paypay` | `/guides/mobile/payment-methods-config#paypay` |
| `/docs/merpay` | `/guides/mobile/payment-methods-config#merpay` |
| `/docs/docomo-payd払い` | `/guides/mobile/payment-methods-config#docomo-payd払い` |
| `/docs/au-pay` | `/guides/mobile/payment-methods-config#au-pay` |
| `/docs/rakuten-pay` | `/guides/mobile/payment-methods-config#rakuten-pay` |
| `/docs/paidy` | `/guides/mobile/payment-methods-config#paidy` |
| `/docs/atone` | `/guides/mobile/payment-methods-config#atone` |
| `/docs/credit-card` | `/guides/mobile/payment-methods-config#credit-card` |
| `/docs/apple-pay` | `/guides/mobile/payment-methods-config#apple-pay` |
| `/docs/google-pay` | `/guides/mobile/payment-methods-config#google-pay` |
| `/docs/amazon-pay` | `/guides/mobile/payment-methods-config#amazon-pay` |
| `/docs/paypal` | `/guides/mobile/payment-methods-config#paypal` |
| `/docs/alipay` | `/guides/mobile/payment-methods-config#alipay` |
| `/docs/wechatpay` | `/guides/mobile/payment-methods-config#wechatpay` |
| `/docs/unionpay` | `/guides/mobile/payment-methods-config#unionpay` |
| `/docs/決済ステーションコンビニ支払い銀行振込` | `/guides/mobile/payment-methods-config#決済ステーションコンビニ支払い銀行振込` |
| `/recipes/easyqrコードを作成` | `/cases/checkout/create-easyqr` |
| `/recipes/戻り先ページのurlを設定` | `/cases/checkout/return-url` |
| `/recipes/widget-ui-設定方法` | `/cases/checkout/widget-ui` |
| `/reference/<operationid>` | `/openapi/<tag>/<operationId>` |

## 删除

- seed (无 SMCC 来源): `cases/(practices)/*` / `faq/faq-server` / `faq/faq-android` / `get-started/error-code-legacy` (elepay 版, 同路径改由 SMCC `error-code` 生成) / `smcc/guide/easy-payment-function` (= `regarding-invoice-payment` 旧版)。
- 导航: iOS / Android SDK 的 elepay Docs 下载项 (`public/docs/resources/ElepaySDK-*.zip` 文件保留, 已无引用)。
- raw: 空页 / 测试页 (`店舗/*` / `2-テスト`) / ReadMe 配置页 (`reference/ReadMeConfig`) / `reference/**/*.md` (= `/openapi` 生成页)。

## 待讨论

- SDK 页 (iOS / Android / `payment-methods-config` ×4) 的「エラーコード」链接按现网指向 hidden `/get-started/error-code-legacy` (含 SDK 错误码 `10110` 等); 可见页 `/get-started/error-code` 仅 API 错误码, 是否补 SDK 错误码待定。

## 验收

- 映射: raw 172 个 md = 97 个 -> 80 页 (69 单页 + 7 个 hidden 页 + 18 个 summary 合 1 页 + 3 个 Recipe) / 6 个目录 index -> `meta.json` title / 4 个空页与测试页删除 / 65 个 `reference` -> `/openapi`。
- 规模: 81 个 ja 页 (80 + `overview`, 其中 7 个 hidden) + 162 个 en/zh 页; 每页有 `updated-at` 记录。
- 图片: 369 处 `/docs/*` 引用, 多重集合与来源一致。
- 代码块: 来源 93 个; 删 3 个 Recipes 占位 Response Example, 补 3 个 (错误码响应 JSON / GoAllpay `build.gradle` ×2, 原文为纯文本), `elepay-sdk-for-ios` 1 个拆 2 个。
- API: `openapi.yaml` 与现网 51 个 operation + 71 个 schema 逐项一致 (除 3 个 `200`); 三语 yaml 去文案后结构一致。
- 验证: `bun test` 14/14; 243 页全部 200, 473 处站内链接 / 资源 / 锚点无错误; hidden 页不进侧边栏 / 搜索 / `llms.txt` 且带 `noindex`; Docker build + `verify-cms-http` 867 条 assertions 通过。
