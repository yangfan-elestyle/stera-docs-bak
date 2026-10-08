import { expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { dynamicLoader } from 'fumadocs-core/source/dynamic';
import { parse } from 'yaml';
import { i18n } from '../lib/i18n';
import { createContentSource } from '../lib/cms/source';
import {
  LEGACY_REDIRECTS,
  resolveLegacyRedirect,
} from '../lib/legacy-redirects';

const { PAGES, OPERATIONS, SECTIONS } = LEGACY_REDIRECTS;
// 绝对路径: cms.test.ts 会 chdir 到临时目录, 且 lib/cms/provider 的 seed 路径在其首次 import 时按 cwd 固定
const root = join(import.meta.dir, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf-8');
const readmeUrls = read('tests/fixtures/readme-urls.txt')
  .split('\n')
  .filter((line) => line && !line.startsWith('#'));
const encode = (path: string) =>
  path.split('/').map(encodeURIComponent).join('/');

test('every live ReadMe page lands on a concrete new page', () => {
  expect(readmeUrls.length).toBeGreaterThan(130);
  for (const url of readmeUrls) {
    const target = resolveLegacyRedirect(encode(url));
    expect(target, url).toBeDefined();
    // 兜底目标 (首页 / API 总览) 不算迁移成功
    expect(['/', '/openapi'], url).not.toContain(target);
  }
});

test('/reference operations match openapi.yaml exactly', () => {
  const spec = parse(read('openapi.yaml'));
  const expected: Record<string, string> = {};
  for (const operations of Object.values<Record<string, any>>(spec.paths)) {
    for (const operation of Object.values(operations)) {
      if (operation?.operationId)
        expected[operation.operationId] = operation.tags[0].toLowerCase();
    }
  }
  expect(OPERATIONS).toEqual(expected);
  expect(resolveLegacyRedirect('/reference/createcharge')).toBe(
    '/openapi/charge/createCharge',
  );
  expect(resolveLegacyRedirect('/reference/listsources')).toBe(
    '/openapi/customer/listSources',
  );
});

test('page targets and anchors exist in seed (ja)', async () => {
  const seed = join(root, 'seed/docs');
  const files = (readdirSync(seed, { recursive: true }) as string[]).map(
    (file) => file.split('\\').join('/'),
  );
  const snapshot = {
    docs: files
      .filter((file) => file.endsWith('.mdx'))
      .map((path) => ({ path, source: read(`seed/docs/${path}`) })),
    metas: files
      .filter((file) => /(^|\/)meta[^/]*\.json$/.test(file))
      .map((path) => ({ path, data: JSON.parse(read(`seed/docs/${path}`)) })),
  };
  const src = await dynamicLoader(
    { docs: createContentSource({ load: async () => snapshot }) },
    { i18n, baseUrl: '/' },
  ).get();
  const sources = new Map(snapshot.docs.map((doc) => [doc.path, doc.source]));
  const targets = [...PAGES.values(), ...SECTIONS.values()].filter(
    (target) => !target.startsWith('/openapi') && target !== '/',
  );
  for (const target of targets) {
    const [pathname, anchor] = target.split('#');
    const page = src.getPage(pathname.split('/').filter(Boolean), 'ja');
    expect(page?.url, target).toBe(pathname);
    if (anchor) {
      const source = sources.get(page!.path) ?? '';
      expect(source, target).toContain(`[#${anchor}]`);
    }
  }
});

test('keys are canonical and targets never chain into another redirect', () => {
  const keys = [...PAGES.keys(), ...SECTIONS.keys()];
  for (const key of keys) {
    expect(key).toBe(key.normalize('NFC').toLowerCase());
  }
  const targets = [
    ...PAGES.values(),
    ...SECTIONS.values(),
    ...readmeUrls.map((url) => resolveLegacyRedirect(encode(url))!),
  ];
  for (const target of targets) {
    expect(resolveLegacyRedirect(encode(target.split('#')[0])), target).toBe(
      undefined,
    );
  }
});

test('ReadMe URL variants resolve like the live site', () => {
  const introduction = '/get-started/introduction';
  for (const variant of [
    '/docs/introduction',
    '/docs/Introduction',
    '/docs/introduction/',
    '/v1.0/docs/introduction',
    '/V1.0/Docs/Introduction/',
  ]) {
    expect(resolveLegacyRedirect(variant), variant).toBe(introduction);
  }
  const manual = '/smcc/guide/stera-smart-one-app-manual';
  const japanese = '/docs/加盟店申請マニュアル';
  expect(resolveLegacyRedirect(encode(japanese))).toBe(manual);
  expect(resolveLegacyRedirect(japanese)).toBe(manual);
  // 浊音 NFD (ガ = カ + ゛)
  expect(
    resolveLegacyRedirect(
      encode('/docs/クイックスタートガイド'.normalize('NFD')),
    ),
  ).toBe('/smcc/guide/quick-start-guide');
  expect(resolveLegacyRedirect('/reference/createCharge')).toBe(
    '/openapi/charge/createCharge',
  );

  // .md -> 新页 .md, 锚点丢弃
  expect(resolveLegacyRedirect('/docs/introduction.md')).toBe(
    `${introduction}.md`,
  );
  expect(resolveLegacyRedirect('/docs/paypay.md')).toBe(
    '/guides/mobile/payment-methods-config.md',
  );
  expect(resolveLegacyRedirect('/reference/createcharge.md')).toBe(
    '/openapi/charge/createCharge.md',
  );
  expect(resolveLegacyRedirect('/docs/paypay')).toBe(
    '/guides/mobile/payment-methods-config#paypay',
  );
});

test('boundary URLs', () => {
  const cases: [string, string | undefined][] = [
    // 首页 / 新站同路径: 不跳
    ['/', undefined],
    ['/llms.txt', undefined],
    ['/llms-full.txt', undefined],
    // 入口: 现网 /docs -> 侧边栏首页, /reference -> 首个分类
    ['/docs', '/smcc/guide/stera-smart-one-app-manual'],
    ['/docs/', '/smcc/guide/stera-smart-one-app-manual'],
    ['/docs.md', '/smcc/guide/stera-smart-one-app-manual'],
    ['/v1.0/docs', '/smcc/guide/stera-smart-one-app-manual'],
    ['/reference', '/openapi'],
    ['/reference/', '/openapi'],
    ['/v1.0/reference', '/openapi'],
    ['/page', '/'],
    ['/v1.0', '/'],
    ['/v1.0/', '/'],
    ['/v1.0/unknown', '/'],
    // 分类页
    ['/reference/charge', '/openapi/charge/listCharges'],
    ['/reference/terminal', '/openapi/terminal/listLocations'],
    ['/reference/location', '/openapi/location/listChargeLocations'],
    ['/reference/codesetting', '/openapi/codesetting/listCodePaymentMethods'],
    // 未知
    ['/reference/unknown', '/openapi'],
    ['/reference/unknown.md', '/openapi'],
    ['/docs/unknown', undefined],
    ['/recipes', undefined],
    ['/recipes/unknown', undefined],
    ['/v2.0/docs/introduction', undefined],
    ['/%E0%A4%A', undefined],
    ['/docs/%E0%A4%A', undefined],
    // public/docs 静态资源与新站路由
    ['/docs/00396bce-ascreenshot.jpeg', undefined],
    ['/docs/resources/ElepaySDK-iOS.zip', undefined],
    ['/get-started/introduction', undefined],
    ['/get-started/introduction.md', undefined],
    ['/ja/docs/introduction', undefined],
    ['/en/get-started/introduction', undefined],
    ['/openapi', undefined],
    ['/openapi/charge/listCharges', undefined],
    ['/admin', undefined],
    ['/api/health', undefined],
  ];
  for (const [path, expected] of cases) {
    expect(resolveLegacyRedirect(path), path).toBe(expected);
  }
});
