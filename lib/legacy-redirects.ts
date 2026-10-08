// 旧 ReadMe 站 (guides.sterasmartone.com) URL -> 新站 URL, 301 让书签 / 外链 / 搜索结果直达新页。
// 来源: 现网 llms.txt + 侧边栏 + 隐藏直链 (plan/20261007/smcc-migration.md); 目标页 / 锚点由 tests/legacy-redirects.test.ts 对照 seed 校验。
// key 一律小写: ReadMe 路径大小写不敏感。

/** 单页: 旧 slug -> 新页 (可带锚点)。`.md` 请求跟随到新页的 `.md`。 */
const PAGES = new Map<string, string>([
  ['/docs/加盟店申請マニュアル', '/smcc/guide/stera-smart-one-app-manual'],
  [
    '/docs/stera-smart-oneお申込マニュアル',
    '/smcc/guide/application-manual-saas',
  ], // hidden
  ['/docs/店舗追加マニュアルsaasサービス', '/smcc/guide/add-store-saas'],
  [
    '/docs/店舗追加マニュアル決済モジュール',
    '/smcc/guide/add-store-payment-module',
  ],
  ['/docs/クイックスタートガイド', '/smcc/guide/quick-start-guide'],
  ['/docs/アカウント管理マニュアル', '/smcc/guide/account-management-manual'],
  [
    '/docs/注文返金処理について',
    '/smcc/guide/base-settings/order-and-refund-processing',
  ],
  ['/docs/商品編集について', '/smcc/guide/base-settings/about-product-editing'],
  [
    '/docs/店舗商品やカテゴリーの表示順序の変更について',
    '/smcc/guide/base-settings/changing-the-display-order',
  ],
  [
    '/docs/クーポンコードについて-1',
    '/smcc/guide/option-settings/issuing-coupon-codes',
  ],
  [
    '/docs/キャンペーン設定について',
    '/smcc/guide/option-settings/campaign-settings',
  ],
  [
    '/docs/プロモーションoptionalについて',
    '/smcc/guide/option-settings/about-promotion',
  ],
  [
    '/docs/在庫管理optionalについて',
    '/smcc/guide/option-settings/inventory-management',
  ],
  [
    '/docs/領収書発行optionalについて',
    '/smcc/guide/option-settings/receipt-issuance',
  ],
  [
    '/docs/消費税設定optionalについて',
    '/smcc/guide/option-settings/consumption-tax-setting',
  ],
  [
    '/docs/注文メモ機能について',
    '/smcc/guide/option-settings/order-note-function',
  ],
  [
    '/docs/決済機能の請求書決済について',
    '/smcc/guide/option-settings/regarding-invoice-payment',
  ],
  [
    '/docs/端末紐付けについて',
    '/smcc/guide/terminal-settings/regarding-the-device-binding',
  ],
  [
    '/docs/smart-one-kdswaitの設定について',
    '/smcc/guide/terminal-settings/wait-settings',
  ],
  [
    '/docs/smart-one-shopのキオスクモード解除について',
    '/smcc/guide/terminal-settings/smart-one-shop-release',
  ],
  [
    '/docs/smart-one-shopのアプリ設定について',
    '/smcc/guide/terminal-settings/shop-app-settings',
  ],
  [
    '/docs/smart-one-shopのインストールについて',
    '/smcc/guide/terminal-settings/about-the-installation',
  ],
  [
    '/docs/決済申請から2週間以上経過し-まだ審査結果が出ておりません-審査プロセスを迅速化することは可能でしょうか',
    '/smcc/faq/application-review-delay',
  ],
  [
    '/docs/faq-entry-common-identification-documents',
    '/smcc/faq/id-verification-photo',
  ],
  [
    '/docs/店頭等で設置するためのマニュアルはありますか',
    '/smcc/faq/store-setup-manual',
  ],
  [
    '/docs/海外法人海外住所の審査は可能でしょうか',
    '/smcc/faq/overseas-application-policy',
  ],
  ['/docs/長期間の使用履歴が無い場合', '/smcc/faq/inactive-account-policy'],
  [
    '/docs/取引データの照会可能期間およびデータの保存期限はどれくらいですか',
    '/smcc/faq/transaction-data-retention',
  ],
  [
    '/docs/faq-entry-online-spctact',
    '/smcc/faq/specified-commercial-transactions',
  ],
  [
    '/docs/faq-entry-common-bank-account-holder',
    '/smcc/faq/bank-account-entry-guidelines',
  ],
  [
    '/docs/申込にあたり-お店側で準備が必要なものはありますか',
    '/smcc/faq/apply-in-store-pay/application-preparation',
  ],
  [
    '/docs/開業前のstera-smart-one申し込みについて',
    '/smcc/faq/apply-in-store-pay/open-business-application',
  ],
  [
    '/docs/サービス名屋号名と店舗名の違いは何ですか',
    '/smcc/faq/apply-in-store-pay/service-name-vs-store-name',
  ],
  [
    '/docs/どんな画像を用意するといいのですか',
    '/smcc/faq/apply-in-store-pay/store-photo-guidelines',
  ],
  [
    '/docs/faq-entry-common-preparation',
    '/smcc/faq/apply-in-store-pay/license-submission-guidelines',
  ],
  [
    '/docs/特定の業種や店舗で申請は制限されていますか',
    '/smcc/faq/apply-in-store-pay/apply-restriction',
  ],
  [
    '/docs/faq-entry-store-shop-photo',
    '/smcc/faq/apply-in-store-pay/store-photo-requirements',
  ],
  [
    '/docs/オンライン決済審査に向けた準備',
    '/smcc/faq/apply-online-pay/online-payment-preparation',
  ],
  [
    '/docs/オンライン決済の審査に不合格となる可能性が高い業種や商品',
    '/smcc/faq/apply-online-pay/online-payment-rejection',
  ],
  [
    '/docs/特定商取引法に基づく表記とは何ですか',
    '/smcc/faq/apply-online-pay/specified-commercial-transaction-law',
  ],
  ['/docs/payment-invoice-change-address', '/smcc/faq/invoice-address-change'],
  ['/page/クイックスタートガイド', '/smcc/faq/payout-and-fees'],
  ['/docs/introduction', '/get-started/introduction'],
  ['/docs/installtion', '/get-started/installation'],
  ['/docs/quick-start', '/get-started/quickstart'],
  ['/docs/init-setting', '/get-started/set-up'],
  ['/docs/charges', '/get-started/process'],
  ['/docs/test-card', '/get-started/test-card'],
  ['/docs/refunds', '/get-started/refunds'],
  ['/docs/custom', '/cases/customer'],
  ['/docs/api-guide', '/guides/api-guide'],
  ['/docs/copy-of-エラーコード', '/get-started/error-code'],
  ['/docs/error-code', '/get-started/error-code-legacy'], // hidden
  ['/docs/testing', '/get-started/testing'], // hidden
  ['/docs/cpm', '/cases/cpm'], // hidden
  ['/docs/easycheckout', '/cases/checkout/easycheckout'], // hidden
  ['/docs/easyqr', '/cases/checkout/easyqr'], // hidden
  ['/docs/extra-setting', '/guides/extra-setting'],
  ['/docs/webhook', '/guides/webhook'],
  ['/docs/checkout', '/cases/checkout'],
  ['/docs/sso-hosted', '/cases/checkout/elepay-hosted'],
  ['/docs/qrwidget', '/cases/checkout/qrwidget'],
  ['/docs/terminals', '/guides/terminals'],
  ['/docs/server-sdk', '/guides/server'],
  ['/docs/ios-sdk', '/guides/mobile/ios'],
  ['/docs/app-clips', '/guides/mobile/ios/app-clips'],
  ['/docs/elepay-sdk-for-ios', '/guides/mobile/ios/elepay-sdk-for-ios'], // hidden
  ['/docs/android-sdk', '/guides/mobile/android'],
  ['/docs/js-sdk', '/guides/javascript'],
  ['/docs/react-native-sdk', '/guides/other-sdk'],
  ['/docs/ios-android-sdk-url-scheme', '/guides/mobile/url-scheme'],
  ['/docs/js-sdk-reference', '/guides/javascript/api-reference'],
  ['/docs/ec-cube-plugin', '/cases/ec-cube-plugin'],
  ['/docs/woocommerce-plugin', '/cases/woocommerce-plugin'],
  ['/docs/allvalue', '/cases/allvalue'],
  ['/docs/ios-sdk-1', '/faq/faq-ios'],
  ['/docs/開発ガイドp', '/get-started/quickstart'],
  ['/docs/summary', '/guides/mobile/payment-methods-config'],
  ['/docs/line-pay', '/guides/mobile/payment-methods-config#line-pay'],
  ['/docs/paypay', '/guides/mobile/payment-methods-config#paypay'],
  ['/docs/merpay', '/guides/mobile/payment-methods-config#merpay'],
  [
    '/docs/docomo-payd払い',
    '/guides/mobile/payment-methods-config#docomo-payd払い',
  ],
  ['/docs/au-pay', '/guides/mobile/payment-methods-config#au-pay'],
  ['/docs/rakuten-pay', '/guides/mobile/payment-methods-config#rakuten-pay'],
  ['/docs/paidy', '/guides/mobile/payment-methods-config#paidy'],
  ['/docs/atone', '/guides/mobile/payment-methods-config#atone'],
  ['/docs/credit-card', '/guides/mobile/payment-methods-config#credit-card'],
  ['/docs/apple-pay', '/guides/mobile/payment-methods-config#apple-pay'],
  ['/docs/google-pay', '/guides/mobile/payment-methods-config#google-pay'],
  ['/docs/amazon-pay', '/guides/mobile/payment-methods-config#amazon-pay'],
  ['/docs/paypal', '/guides/mobile/payment-methods-config#paypal'],
  ['/docs/alipay', '/guides/mobile/payment-methods-config#alipay'],
  ['/docs/wechatpay', '/guides/mobile/payment-methods-config#wechatpay'],
  ['/docs/unionpay', '/guides/mobile/payment-methods-config#unionpay'],
  [
    '/docs/決済ステーションコンビニ支払い銀行振込',
    '/guides/mobile/payment-methods-config#決済ステーションコンビニ支払い銀行振込',
  ],
  ['/recipes/easyqrコードを作成', '/cases/checkout/create-easyqr'],
  ['/recipes/戻り先ページのurlを設定', '/cases/checkout/return-url'],
  ['/recipes/widget-ui-設定方法', '/cases/checkout/widget-ui'],
]);

/** `/reference/<operationid>` -> `/openapi/<tag>/<operationId>`; 值 = 生成页目录 (tag 小写)。须与 openapi.yaml 一致。 */
const OPERATIONS: Record<string, string> = {
  listCharges: 'charge',
  createCharge: 'charge',
  retrieveCharge: 'charge',
  revokeCharge: 'charge',
  captureCharge: 'charge',
  retrieveChargeStatus: 'charge',
  listChargesRefunds: 'refund',
  createRefund: 'refund',
  retrieveChargeRefund: 'refund',
  listCustomers: 'customer',
  createCustomer: 'customer',
  retrieveCustomer: 'customer',
  updateCustomer: 'customer',
  deleteCustomer: 'customer',
  listSources: 'customer',
  createSource: 'customer',
  retrieveSource: 'customer',
  deleteSource: 'customer',
  retrieveSourceStatus: 'customer',
  listPaymentMethods: 'paymentmethod',
  createCode: 'code',
  retrieveCode: 'code',
  closeCode: 'code',
  listCodePaymentMethods: 'codesetting',
  listInvoices: 'invoice',
  createInvoice: 'invoice',
  retrieveInvoice: 'invoice',
  updateInvoice: 'invoice',
  cancelInvoice: 'invoice',
  submitInvoice: 'invoice',
  sendInvoice: 'invoice',
  listLocations: 'terminal',
  listReaders: 'terminal',
  createReader: 'terminal',
  getReader: 'terminal',
  deleteReader: 'terminal',
  listDisputes: 'dispute',
  retrieveDispute: 'dispute',
  listSubscriptions: 'subscription',
  createSubscription: 'subscription',
  retrieveSubscription: 'subscription',
  updateSubscription: 'subscription',
  startSubscription: 'subscription',
  resumeSubscription: 'subscription',
  cancelSubscription: 'subscription',
  listSubscriptionPeriods: 'subscription',
  listChargeLocations: 'location',
  createChargeLocation: 'location',
  retrieveChargeLocation: 'location',
  updateChargeLocation: 'location',
  deleteChargeLocation: 'location',
};

/** 入口 / 分类页: 现网会再跳到某页, 这里一次跳到新站对应页。不跟随 `.md`。 */
const SECTIONS = new Map<string, string>(
  [
    // 现网 /docs -> 侧边栏首页「加盟店申請マニュアル」
    ['/docs', '/smcc/guide/stera-smart-one-app-manual'],
    ['/reference', '/openapi'],
    ['/page', '/'],
    // 现网 /reference/<tag> -> 该分类首个 operation
    ['/reference/charge', 'listCharges'],
    ['/reference/refund', 'listChargesRefunds'],
    ['/reference/customer', 'listCustomers'],
    ['/reference/code', 'createCode'],
    ['/reference/codesetting', 'listCodePaymentMethods'],
    ['/reference/paymentmethod', 'listPaymentMethods'],
    ['/reference/location', 'listChargeLocations'],
    ['/reference/terminal', 'listLocations'],
    ['/reference/invoice', 'listInvoices'],
    ['/reference/dispute', 'listDisputes'],
    ['/reference/subscription', 'listSubscriptions'],
  ].map(([from, to]) => [from, to.startsWith('/') ? to : operationUrl(to)]),
);

function operationUrl(operationId: string): string {
  return `/openapi/${OPERATIONS[operationId]}/${operationId}`;
}

const OPERATION_URLS = new Map(
  Object.keys(OPERATIONS).map((id) => [
    `/reference/${id.toLowerCase()}`,
    operationUrl(id),
  ]),
);

/** ReadMe 的版本前缀, 现网 302 去掉。 */
const VERSION_PREFIX = /^\/v1\.0(?=\/|$)/;

/**
 * 旧 URL 的 pathname (未解码) -> 新站目标 (pathname + 可选 #fragment); 非旧 URL 返回 undefined。
 * 只做精确查表: `/docs/*` 同时是 public/docs 静态资源前缀, MUST NOT 通配。
 */
export function resolveLegacyRedirect(pathname: string): string | undefined {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  // NFC: 日文浊音可能以分解形式 (NFD) 编码进 URL
  path = path.normalize('NFC').toLowerCase().replace(/\/+$/, '');
  const versioned = VERSION_PREFIX.test(path);
  if (versioned) path = path.replace(VERSION_PREFIX, '');
  const markdown = path.endsWith('.md');
  if (markdown) path = path.slice(0, -'.md'.length);

  const page = PAGES.get(path) ?? OPERATION_URLS.get(path);
  if (page) return markdown ? `${page.split('#')[0]}.md` : page;
  const section = SECTIONS.get(path);
  if (section) return section;
  // 已下线 / 改名的 API 页 -> API 总览; /docs/* 未命中交给 404 (-> 首页)
  if (path.startsWith('/reference/')) return '/openapi';
  return versioned ? '/' : undefined;
}

/** 测试用: 全部旧 URL key 与目标。 */
export const LEGACY_REDIRECTS = { PAGES, OPERATIONS, SECTIONS } as const;
