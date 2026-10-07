import { afterAll, beforeAll, expect, test, spyOn } from 'bun:test';
import { mkdtempSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = process.cwd();
let temporary: string;
let cms: typeof import('../lib/cms/content');
let database: typeof import('../lib/cms/db');
let version: typeof import('../lib/cms/version');
let frontmatter: typeof import('../lib/admin/frontmatter');
let mdx: typeof import('../lib/cms/mdx');
let provider: typeof import('../lib/cms/provider');

beforeAll(async () => {
  mkdirSync(join(root, '.tmp'), { recursive: true });
  temporary = mkdtempSync(join(root, '.tmp/cms-test-'));
  symlinkSync(join(root, 'seed'), join(temporary, 'seed'));
  symlinkSync(join(root, 'public'), join(temporary, 'public'));
  process.chdir(temporary);
  cms = await import('../lib/cms/content');
  database = await import('../lib/cms/db');
  version = await import('../lib/cms/version');
  frontmatter = await import('../lib/admin/frontmatter');
  mdx = await import('../lib/cms/mdx');
  provider = await import('../lib/cms/provider');
});

afterAll(() => {
  database.getDb().close();
  delete (globalThis as { steraCmsDb?: DatabaseSync }).steraCmsDb;
  process.chdir(root);
  rmSync(temporary, { recursive: true, force: true });
});

const slug = '(home)/qa-quality';
const content = '---\ntitle: QA quality\n---\n\n## Test\n\nBody\n';

test('all seed MDX compiles with the runtime compiler and schema', async () => {
  for (const record of provider.loadSeedSync().docs) {
    expect(cms.validateDocSource(record.source)).toBeUndefined();
    await mdx.compileDoc(record.source, record.path);
  }
}, 60000);

test('invalid syntax and unknown JSX components fail compilation', async () => {
  await expect(
    mdx.compileDoc(`${content}\n<UnknownWidget />`, 'qa.mdx'),
  ).rejects.toThrow('Unknown MDX component');
  await expect(
    mdx.compileDoc(`${content}\n<Callout>`, 'qa.mdx'),
  ).rejects.toThrow();
  expect(cms.validateDocSource('---\ntitle: ""\n---\n')).toBeDefined();
  expect(
    cms.validateDocSource('---\ntitle: Title\nredirect: //evil.example\n---\n'),
  ).toBeDefined();
});

test('corrupt YAML and navigation JSON cannot poison the loader', async () => {
  const { createContentSource } = await import('../lib/cms/source');
  const { createDbProvider } = await import('../lib/cms/db-provider');
  const log = spyOn(console, 'error').mockImplementation(() => {});
  const db = database.getDb();
  const nav = cms.getNav('(home)', 'ja')!;
  try {
    const source = createContentSource({
      load: async () => ({
        docs: [
          { path: 'invalid.mdx', source: '---\ntitle: [\n---\n' },
          { path: 'valid.mdx', source: content },
        ],
        metas: [],
      }),
    });
    expect(await source.files()).toHaveLength(1);
    db.prepare(
      'UPDATE navigation SET data = ? WHERE dir = ? AND locale = ?',
    ).run('{', nav.dir, nav.locale);
    expect((await createDbProvider().load()).metas).toHaveLength(38);
  } finally {
    db.prepare(
      'UPDATE navigation SET data = ? WHERE dir = ? AND locale = ?',
    ).run(nav.data, nav.dir, nav.locale);
    log.mockRestore();
  }
});

test('seed scope, migrations and initialized marker persist', () => {
  const db = database.getDb();
  expect(database.countDocs(db)).toBe(213);
  expect(cms.listSlugs()).toHaveLength(71);
  expect(cms.listNav()).toHaveLength(39);
  database.migrate(db);
  expect(db.prepare('PRAGMA user_version').get()?.user_version).toBe(4);
  expect(
    db.prepare('SELECT initialized FROM content_state').get()?.initialized,
  ).toBe(1);
});

test('migration failure rolls back DDL and user_version', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE users (id TEXT)');
  expect(() => database.migrate(db)).toThrow();
  expect(
    db.prepare("SELECT name FROM sqlite_master WHERE name = 'docs'").get(),
  ).toBeUndefined();
  expect(db.prepare('PRAGMA user_version').get()?.user_version).toBe(0);
  db.close();
});

test('reserved, traversal, route aliases and OpenAPI writes are rejected', () => {
  for (const bad of [
    'openapi/index',
    '(home)/../admin',
    '(home)//a',
    '(home)/api/a',
    '(home)/(alias)/openapi',
    '(home)/ja/a',
    '(home)/a.en',
    '(home)/index',
  ]) {
    expect(() =>
      cms.createPage({ slug: bad, title: 'QA', locales: ['ja'] }),
    ).toThrow();
  }
  cms.createPage({ slug, title: 'QA', locales: ['ja'] });
  expect(() =>
    cms.createPage({ slug: `${slug}/index`, title: 'QA', locales: ['ja'] }),
  ).toThrow();
  expect(() => cms.saveDoc('openapi/index', 'ja', content)).toThrow();
});

test('language creation, stale edits, deletion conflicts and monotonic timestamps', () => {
  const old = cms.getDoc(slug, 'ja')!.updatedAt.getTime();
  const next = cms.saveDoc(slug, 'ja', content, old).getTime();
  expect(next).toBeGreaterThan(old);
  expect(() => cms.saveDoc(slug, 'ja', 'overwrite', old)).toThrow(
    cms.StaleWriteError,
  );
  cms.saveDoc(slug, 'en', content, null);
  expect(() => cms.saveDoc(slug, 'en', 'overwrite', null)).toThrow(
    cms.StaleWriteError,
  );
  cms.deleteDoc(slug, 'en');
  expect(() => cms.saveDoc(slug, 'en', 'resurrect', next)).toThrow(
    cms.StaleWriteError,
  );
  expect(cms.getDoc(slug, 'ja')?.content).toBe(content);
});

test('revision catches equal timestamps and mutations below the maximum', () => {
  const db = database.getDb();
  db.prepare('UPDATE docs SET updated_at = ? WHERE slug = ?').run(
    Date.now() + 100000,
    slug,
  );
  const before = version.contentVersion();
  db.prepare('UPDATE docs SET content = content WHERE slug <> ?').run(slug);
  expect(version.contentVersion()).not.toBe(before);
});

test('navigation conflicts and page cleanup preserve unrelated entries', () => {
  const nav = cms.getNav('(home)', 'ja')!;
  const data = JSON.parse(nav.data);
  expect(data.pages).toContain('qa-quality');
  const changed = JSON.stringify({ ...data, title: 'Changed' });
  cms.saveNav('(home)', 'ja', changed, nav.data);
  expect(() => cms.saveNav('(home)', 'ja', nav.data, nav.data)).toThrow(
    cms.StaleWriteError,
  );
  cms.deletePage(slug);
  expect(cms.slugExists(slug)).toBe(false);
  expect(JSON.parse(cms.getNav('(home)', 'ja')!.data).pages).not.toContain(
    'qa-quality',
  );
});

test('empty initialized database does not resurrect deleted content on restart', () => {
  const db = database.getDb();
  db.exec('DELETE FROM docs');
  db.close();
  delete (globalThis as { steraCmsDb?: DatabaseSync }).steraCmsDb;
  expect(database.countDocs(database.getDb())).toBe(0);
});

test('malformed YAML is a validation error, multiline frontmatter edits stay valid', () => {
  expect(cms.validateDocSource('---\ntitle: [\n---\n')).toBeDefined();
  const original =
    '---\ntitle: Title\ndescription: |\n  First\n  Second\nicon: Book\n---\n\n';
  const changed = frontmatter.setFrontmatterValue(
    original,
    'description',
    'New description',
  );
  expect(cms.validateDocSource(changed)).toBeUndefined();
  expect(changed).toContain('icon: Book');
  expect(changed).not.toContain('  Second');
});
