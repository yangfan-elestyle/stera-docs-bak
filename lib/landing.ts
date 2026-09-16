import { SITE } from './site';

/**
 * 首页文案。只有「标题 + 两段引导语 + 两个按钮」这点固定文字, 下面的栏目链接全部
 * 由真实导航树生成 —— 这是一个文档门户首页, 不是产品介绍页。
 *
 * 走发版而非 CMS: 它不是文档页, 不进 slug 体系, 也不该出现在侧边栏与搜索里。
 */
export interface LandingCopy {
  title: string;
  lead: string[];
  primary: { text: string; href: string };
  secondary: { text: string; href: string };
  /** 栏目底部的「查看全部」 */
  more: string;
  /** API 栏目组的小标题 */
  apiHeading: string;
  docsHeading: string;
}

const ja: LandingCopy = {
  title: `${SITE.brand} 利用ガイド`,
  lead: [
    `${SITE.brand} のドキュメントへようこそ。店舗のお申込みから日々の運用まで、必要な手順をまとめています。`,
    '開発者向けには API リファレンスと SDK も用意しています。複数の決済方法を一度の開発でまとめて扱えます。',
  ],
  primary: { text: 'はじめる', href: '/overview' },
  secondary: { text: 'API リファレンス', href: '/openapi' },
  more: 'すべて見る',
  docsHeading: 'ドキュメント',
  apiHeading: 'API リファレンス',
};

const en: LandingCopy = {
  title: `${SITE.brand} documentation`,
  lead: [
    `Welcome to the ${SITE.brand} docs. Everything from store application to day-to-day operations, in one place.`,
    'For developers there is a full API reference and SDKs — integrate once and support the major payment methods.',
  ],
  primary: { text: 'Get started', href: '/overview' },
  secondary: { text: 'API reference', href: '/openapi' },
  more: 'View all',
  docsHeading: 'Documentation',
  apiHeading: 'API reference',
};

const zh: LandingCopy = {
  title: `${SITE.brand} 使用指南`,
  lead: [
    `欢迎查阅 ${SITE.brand} 文档。从门店申请到日常运营，所需步骤都集中在这里。`,
    '面向开发者另有完整的 API 参考与 SDK，一次对接即可覆盖主流支付方式。',
  ],
  primary: { text: '开始使用', href: '/overview' },
  secondary: { text: 'API 参考', href: '/openapi' },
  more: '查看全部',
  docsHeading: '文档',
  apiHeading: 'API 参考',
};

const COPY: Record<string, LandingCopy> = { ja, en, zh };

export function landingCopy(locale: string): LandingCopy {
  return COPY[locale] ?? ja;
}
