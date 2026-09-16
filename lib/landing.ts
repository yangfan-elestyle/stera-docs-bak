import { SITE } from './site';

/**
 * 落地页文案。
 *
 * 与文档正文不同, 这里是 markdown-as-code 走发版的 —— 它不是文档页, 不进 CMS 的
 * slug 体系, 也不该出现在侧边栏与搜索里。改动频率按「年」计, 由发版承载。
 */
export interface LandingLink {
  text: string;
  href: string;
  external?: boolean;
}

export interface LandingCard {
  title: string;
  description: string;
  links: LandingLink[];
  cta: LandingLink;
}

export interface LandingFeature {
  icon: 'book' | 'code' | 'globe' | 'search' | 'shield' | 'sparkles';
  title: string;
  description: string;
}

export interface LandingCopy {
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  primary: LandingLink;
  secondary: LandingLink;
  audienceTitle: string;
  cards: LandingCard[];
  featureTitle: string;
  featureSubtitle: string;
  features: LandingFeature[];
  popularTitle: string;
  popular: LandingLink[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimary: LandingLink;
  ctaSecondary: LandingLink;
}

const ja: LandingCopy = {
  badge: '公式ドキュメント',
  title: `${SITE.brand} を`,
  titleAccent: '使いこなすための場所',
  subtitle:
    '店舗の初期設定から API 連携まで、必要な手順とリファレンスをひとつにまとめています。目的から辿って、必要なページにすぐ到達できます。',
  primary: { text: 'ドキュメントを見る', href: '/overview' },
  secondary: { text: 'API リファレンス', href: '/openapi' },
  audienceTitle: 'どちらからでも始められます',
  cards: [
    {
      title: '店舗・運営の方へ',
      description:
        'お申込みから店舗設定、日々の運用までを順番に。専門知識がなくても進められる手順書です。',
      links: [
        {
          text: 'クイックスタートガイド',
          href: '/smcc/guide/quick-start-guide',
        },
        {
          text: 'stera smart one お申込マニュアル',
          href: '/smcc/guide/stera-smart-one-app-manual',
        },
        { text: '基本機能の設定', href: '/smcc/guide/base-settings' },
      ],
      cta: { text: 'ガイドをすべて見る', href: '/overview' },
    },
    {
      title: '開発者の方へ',
      description:
        'テスト環境の準備、決済フローの実装、Webhook の受け取りまで。サンプル付きで解説します。',
      links: [
        { text: 'アカウント設定', href: '/get-started/set-up' },
        { text: '決済の流れ', href: '/get-started/process' },
        { text: 'Webhook', href: '/guides/webhook' },
      ],
      cta: { text: 'API リファレンスへ', href: '/openapi' },
    },
  ],
  featureTitle: 'このドキュメントでできること',
  featureSubtitle: '探す・読む・試すが、そのまま繋がっています。',
  features: [
    {
      icon: 'book',
      title: '手順書とリファレンス',
      description: '運用手順と API 仕様を同じ場所で参照できます。',
    },
    {
      icon: 'globe',
      title: '日本語 / English / 简体中文',
      description:
        '同じ内容を 3 言語で提供。右上からいつでも切り替えられます。',
    },
    {
      icon: 'search',
      title: '全文検索',
      description:
        '日本語・中国語の分かち書きに対応した検索で、目的の一行まで辿れます。',
    },
    {
      icon: 'code',
      title: 'そのまま使えるサンプル',
      description: '各 API に主要言語のリクエスト例を用意しています。',
    },
    {
      icon: 'shield',
      title: 'エラーコード一覧',
      description: '想定されるエラーと対処を一覧で確認できます。',
    },
    {
      icon: 'sparkles',
      title: 'AI からも読める',
      description:
        'llms.txt と Markdown 出力に対応し、AI ツールにそのまま渡せます。',
    },
  ],
  popularTitle: 'よく見られているページ',
  popular: [
    { text: 'アカウント設定', href: '/get-started/set-up' },
    { text: 'クイックスタート', href: '/get-started/quickstart' },
    { text: 'エラーコード', href: '/get-started/error-code' },
    { text: '返金処理', href: '/get-started/refunds' },
    { text: 'Checkout の実装', href: '/cases/checkout' },
    { text: 'よくある質問', href: '/smcc/faq/store-setup-manual' },
  ],
  ctaTitle: 'まずは管理画面から',
  ctaSubtitle:
    'テスト環境はすぐに利用開始できます。API キーの発行も管理画面から行えます。',
  ctaPrimary: {
    text: '管理画面を開く',
    href: SITE.dashboardUrl,
    external: true,
  },
  ctaSecondary: { text: 'ドキュメントを見る', href: '/overview' },
};

const en: LandingCopy = {
  badge: 'Official documentation',
  title: 'Everything you need to',
  titleAccent: `run ${SITE.brand}`,
  subtitle:
    'From store setup to API integration — guides and references in one place, organised so you can jump straight to what you need.',
  primary: { text: 'Browse the docs', href: '/overview' },
  secondary: { text: 'API reference', href: '/openapi' },
  audienceTitle: 'Start from either side',
  cards: [
    {
      title: 'For merchants',
      description:
        'Application, store settings and day-to-day operations, step by step. No technical background required.',
      links: [
        { text: 'Quick start guide', href: '/smcc/guide/quick-start-guide' },
        {
          text: 'Application manual',
          href: '/smcc/guide/stera-smart-one-app-manual',
        },
        { text: 'Basic function settings', href: '/smcc/guide/base-settings' },
      ],
      cta: { text: 'See all guides', href: '/overview' },
    },
    {
      title: 'For developers',
      description:
        'Set up a test environment, implement the payment flow and receive webhooks — with runnable examples.',
      links: [
        { text: 'Account setup', href: '/get-started/set-up' },
        { text: 'Payment flow', href: '/get-started/process' },
        { text: 'Webhooks', href: '/guides/webhook' },
      ],
      cta: { text: 'Go to API reference', href: '/openapi' },
    },
  ],
  featureTitle: 'What you can do here',
  featureSubtitle: 'Search, read and try — all in one flow.',
  features: [
    {
      icon: 'book',
      title: 'Guides and reference',
      description: 'Operational how-tos and API specs live side by side.',
    },
    {
      icon: 'globe',
      title: '日本語 / English / 简体中文',
      description:
        'The same content in three languages, switchable at any time.',
    },
    {
      icon: 'search',
      title: 'Full-text search',
      description:
        'Tokenised for Japanese and Chinese, so you land on the exact line.',
    },
    {
      icon: 'code',
      title: 'Copy-ready samples',
      description:
        'Every endpoint ships with request examples in major languages.',
    },
    {
      icon: 'shield',
      title: 'Error code catalogue',
      description: 'Every error you may hit, with what to do about it.',
    },
    {
      icon: 'sparkles',
      title: 'AI-readable',
      description:
        'llms.txt and Markdown output, ready to hand to your AI tooling.',
    },
  ],
  popularTitle: 'Popular pages',
  popular: [
    { text: 'Account setup', href: '/get-started/set-up' },
    { text: 'Quick start', href: '/get-started/quickstart' },
    { text: 'Error codes', href: '/get-started/error-code' },
    { text: 'Refunds', href: '/get-started/refunds' },
    { text: 'Checkout', href: '/cases/checkout' },
    { text: 'FAQ', href: '/smcc/faq/store-setup-manual' },
  ],
  ctaTitle: 'Start from the dashboard',
  ctaSubtitle:
    'The test environment is available right away, and API keys are issued from the dashboard.',
  ctaPrimary: {
    text: 'Open dashboard',
    href: SITE.dashboardUrl,
    external: true,
  },
  ctaSecondary: { text: 'Browse the docs', href: '/overview' },
};

const zh: LandingCopy = {
  badge: '官方文档',
  title: '用好',
  titleAccent: `${SITE.brand} 所需的一切`,
  subtitle:
    '从门店初始设置到 API 对接，操作手册与接口参考集中在一处，按目的检索，直达所需页面。',
  primary: { text: '查看文档', href: '/overview' },
  secondary: { text: 'API 参考', href: '/openapi' },
  audienceTitle: '从哪一侧开始都可以',
  cards: [
    {
      title: '面向门店与运营',
      description:
        '从申请、门店设置到日常运营，按顺序展开；无需技术背景也能照着做。',
      links: [
        { text: '快速入门指南', href: '/smcc/guide/quick-start-guide' },
        { text: '申请手册', href: '/smcc/guide/stera-smart-one-app-manual' },
        { text: '基本功能设置', href: '/smcc/guide/base-settings' },
      ],
      cta: { text: '查看全部指南', href: '/overview' },
    },
    {
      title: '面向开发者',
      description:
        '准备测试环境、实现支付流程、接收 Webhook，均配有可直接使用的示例。',
      links: [
        { text: '设置账号', href: '/get-started/set-up' },
        { text: '支付流程', href: '/get-started/process' },
        { text: 'Webhook', href: '/guides/webhook' },
      ],
      cta: { text: '前往 API 参考', href: '/openapi' },
    },
  ],
  featureTitle: '这份文档能做什么',
  featureSubtitle: '检索、阅读、试用，一条路径走通。',
  features: [
    {
      icon: 'book',
      title: '手册与接口参考',
      description: '运营步骤与 API 规格在同一处查阅。',
    },
    {
      icon: 'globe',
      title: '日本語 / English / 简体中文',
      description: '同一份内容三种语言，随时切换。',
    },
    {
      icon: 'search',
      title: '全文检索',
      description: '支持日文与中文分词，直接定位到那一行。',
    },
    {
      icon: 'code',
      title: '可直接复制的示例',
      description: '每个接口都提供主流语言的请求示例。',
    },
    {
      icon: 'shield',
      title: '错误码一览',
      description: '可能遇到的错误与处理方式一览可查。',
    },
    {
      icon: 'sparkles',
      title: 'AI 也能读',
      description: '提供 llms.txt 与 Markdown 输出，可直接交给 AI 工具。',
    },
  ],
  popularTitle: '常看的页面',
  popular: [
    { text: '设置账号', href: '/get-started/set-up' },
    { text: '快速入门', href: '/get-started/quickstart' },
    { text: '错误码', href: '/get-started/error-code' },
    { text: '退款处理', href: '/get-started/refunds' },
    { text: 'Checkout 实现', href: '/cases/checkout' },
    { text: '常见问题', href: '/smcc/faq/store-setup-manual' },
  ],
  ctaTitle: '先从管理后台开始',
  ctaSubtitle: '测试环境可立即使用，API 密钥同样在管理后台签发。',
  ctaPrimary: { text: '打开管理后台', href: SITE.dashboardUrl, external: true },
  ctaSecondary: { text: '查看文档', href: '/overview' },
};

const COPY: Record<string, LandingCopy> = { ja, en, zh };

export function landingCopy(locale: string): LandingCopy {
  return COPY[locale] ?? ja;
}
