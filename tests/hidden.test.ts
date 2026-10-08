import { expect, test } from 'bun:test';
import { flattenTree, type Node } from 'fumadocs-core/page-tree';
import { dynamicLoader } from 'fumadocs-core/source/dynamic';
import { i18n } from '../lib/i18n';
import { createContentSource } from '../lib/cms/source';
import {
  getSitePages,
  getSiteTree,
  isHiddenPage,
} from '../lib/site-visibility';

const doc = (title: string, extra = '') =>
  `---\ntitle: ${title}\n${extra}---\n\nBody\n`;

// 只走公开 loader 接口, 不连库: docs / meta 都由内存 provider 给出
const source = dynamicLoader(
  {
    docs: createContentSource({
      load: async () => ({
        docs: [
          { path: 'guide/visible.mdx', source: doc('Visible') },
          { path: 'guide/old.mdx', source: doc('Old', 'hidden: true\n') },
          { path: 'guide/old.en.mdx', source: doc('Old EN') },
          { path: 'draft/a.mdx', source: doc('Draft A', 'hidden: true\n') },
          { path: 'draft/index.mdx', source: doc('Draft', 'hidden: true\n') },
          { path: 'tail.mdx', source: doc('Tail') },
        ],
        metas: [
          { path: 'meta.json', data: { pages: ['guide', '---Drafts---', 'draft', '---End---', 'tail'] } },
          { path: 'meta.en.json', data: { pages: ['guide', '---Drafts---', 'draft', '---End---', 'tail'] } },
          { path: 'guide/meta.json', data: { pages: ['visible', 'old'] } },
          { path: 'draft/meta.json', data: { pages: ['a'] } },
        ],
      }),
    }),
  },
  { i18n, baseUrl: '/' },
);

const urls = (nodes: Node[]) => flattenTree(nodes).map((node) => node.url);

test('hidden pages leave the site tree but stay in the raw tree', async () => {
  const src = await source.get();
  const raw = src.getPageTree('ja');
  const site = getSiteTree(src, 'ja');

  expect(urls(raw.children)).toContain('/guide/old');
  expect(urls(site.children)).toEqual(['/guide/visible', '/tail']);
  // 整组隐藏 -> 文件夹与它前面的分段标题一起消失
  expect(JSON.stringify(site)).not.toContain('Draft');
  expect(site.children.filter((n) => n.type === 'separator')).toHaveLength(1);
  // 同一棵树重复取得同一对象, 避免每次请求重算
  expect(getSiteTree(src, 'ja')).toBe(site);
});

test('hidden is per locale: an unhidden translation stays listed', async () => {
  const src = await source.get();
  expect(urls(getSiteTree(src, 'en').children)).toContain('/guide/old');
  expect(getSitePages(src, 'en').map((p) => p.url)).toContain('/guide/old');
  // zh 无译文 -> 回落 ja, 继承 ja 的 hidden
  expect(urls(getSiteTree(src, 'zh').children)).not.toContain('/guide/old');
});

test('hidden pages leave listings but keep direct access and link resolution', async () => {
  const src = await source.get();
  const listed = getSitePages(src, 'ja').map((p) => p.url);
  expect(listed).toEqual(['/guide/visible', '/tail']);
  // 不传 lang = 全语言 (搜索索引用这条路径)
  expect(getSitePages(src).some(isHiddenPage)).toBe(false);

  // 直链: 页面路由与 .md 路由都按 getPage 取
  const old = src.getPage(['guide', 'old'], 'ja');
  expect(old && isHiddenPage(old)).toBe(true);

  // 可见页里指向 hidden 页的站内链接照常解析 (createRelativeLink -> getPageByHref)
  const visible = src.getPage(['guide', 'visible'], 'ja')!;
  const target = src.getPageByHref('./old.mdx', {
    dir: 'guide',
    language: 'ja',
  });
  expect(target?.page.url).toBe('/guide/old');
  expect(visible.url).toBe('/guide/visible');
});
