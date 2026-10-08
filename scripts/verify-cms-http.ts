import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolveLegacyRedirect } from '../lib/legacy-redirects';

// 仅操作本脚本创建的本机容器/卷; 不读取现有 data/cms.db。
const name = `stera-cms-test-${randomUUID().slice(0, 8)}`;
const image = process.argv[2] ?? 'stera-docs:review';
const volume = `${name}-data`;
let origin = '';
let actions: Record<string, string> = {};
let checks = 0;
function docker(...args: string[]): string {
  const result = Bun.spawnSync(['docker', ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (result.exitCode) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim();
}
function check(condition: unknown, label: string): void {
  assert(condition, label);
  checks++;
}
function rows(sql: string, ...params: unknown[]): any[] {
  return JSON.parse(
    docker(
      'exec',
      name,
      'node',
      '-e',
      'const {DatabaseSync}=require("node:sqlite"); const db=new DatabaseSync("data/cms.db"); console.log(JSON.stringify(db.prepare(process.argv[1]).all(...JSON.parse(process.argv[2]))));',
      sql,
      JSON.stringify(params),
    ),
  );
}
async function request(path: string, cookie = '') {
  const locale = /^\/(ja|en|zh)(?=\/|$)/.exec(path);
  if (locale) {
    path = path.slice(locale[0].length) || '/';
    cookie = [cookie, `FD_LOCALE=${locale[1]}`].filter(Boolean).join('; ');
  }
  return fetch(`${origin}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: 'manual',
  });
}
async function action(
  key: string,
  args: unknown[],
  cookie = '',
  fields?: Record<string, string | Blob>,
) {
  let body: string | FormData;
  if (fields) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value instanceof Blob) form.set(`_1_${key}`, value, 'qa.svg');
      else form.set(`_1_${key}`, value);
    }
    form.set('0', JSON.stringify(args));
    body = form;
  } else body = JSON.stringify(args);
  const response = await fetch(`${origin}/admin/content`, {
    method: 'POST',
    headers: {
      'Next-Action': actions[key],
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(typeof body === 'string'
        ? { 'Content-Type': 'text/plain;charset=UTF-8' }
        : {}),
    },
    body,
    redirect: 'manual',
  });
  const text = await response.text();
  const line = text.split('\n').find((line) => line.startsWith('1:'));
  let result: any;
  if (line && !line.startsWith('1:E')) {
    try {
      result = JSON.parse(line.slice(2));
    } catch {
      /* redirect result */
    }
  }
  return {
    response,
    result,
    cookie: response.headers.get('set-cookie')?.split(';')[0],
    text,
  };
}
async function login(email: string, password: string) {
  return action('login', [{}, '$K1'], '', { email, password });
}
async function change(cookie: string, current: string, next: string) {
  const result = await action('changePassword', [{}, '$K1'], cookie, {
    current,
    next,
    confirm: next,
  });
  check(
    result.result?.ok && result.cookie,
    'password changes and rotates session',
  );
  return result.cookie!;
}
async function ready() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await request('/api/health')).ok) return;
    } catch {
      /* booting */
    }
    await Bun.sleep(200);
  }
  throw new Error('Container did not become ready');
}

async function verifyLegacyRedirects() {
  const readme = readFileSync(
    new URL('../tests/fixtures/readme-urls.txt', import.meta.url),
    'utf-8',
  )
    .split('\n')
    .filter((line) => line && !line.startsWith('#'));
  const pages = new Map<string, { status: number; html: string }>();
  for (const path of [
    ...readme,
    '/docs',
    '/reference',
    '/reference/charge',
    '/v1.0',
    '/page',
  ]) {
    const response = await request(path);
    const location = decodeURI(response.headers.get('location') ?? '');
    check(
      response.status === 301 && location === resolveLegacyRedirect(path),
      `legacy ${path} -> 301 ${location}`,
    );
    const [target, anchor] = location.split('#');
    if (!pages.has(target)) {
      const page = await request(target);
      pages.set(target, { status: page.status, html: await page.text() });
    }
    const page = pages.get(target)!;
    check(page.status === 200, `legacy target ${target} 200`);
    if (anchor)
      check(page.html.includes(`id="${anchor}"`), `anchor ${location}`);
  }
  // 新站路由 / public/docs 静态资源 / 未知旧页: 不跳
  for (const [path, status] of [
    ['/', 200],
    ['/get-started/introduction', 200],
    ['/docs/00396bce-ascreenshot.jpeg', 200],
    ['/docs/unknown', 404],
  ] as const) {
    check(
      (await request(path)).status === status,
      `no legacy redirect ${path}`,
    );
  }
}

try {
  docker(
    'run',
    '-d',
    '--name',
    name,
    '-p',
    '127.0.0.1::3000',
    '-v',
    `${volume}:/app/data`,
    image,
  );
  origin = `http://${docker('port', name, '3000/tcp')}`;
  await ready();
  actions = JSON.parse(
    docker(
      'exec',
      name,
      'node',
      '-e',
      'const m=require("./.next/server/server-reference-manifest.json"); console.log(JSON.stringify(Object.fromEntries(Object.entries(m.node).map(([id,x])=>[x.exportedName,id]))));',
    ),
  );
  check(
    rows('SELECT count(*) AS n FROM docs')[0].n === 243,
    'empty volume seeds 243 documents',
  );
  check(
    rows('SELECT count(*) AS n FROM navigation')[0].n === 36,
    'empty volume seeds 36 navigation rows',
  );
  check(
    docker(
      'exec',
      name,
      'node',
      '-e',
      'console.log(require("fs").existsSync(".git"))',
    ) === 'false',
    'runner has no .git',
  );
  for (const path of [
    '/',
    '/favicon.ico',
    '/admin/login',
    '/get-started/set-up.md',
    '/llms.txt',
    '/api/health',
  ]) {
    check((await request(path)).status === 200, `smoke ${path}`);
  }
  await verifyLegacyRedirects();
  check(
    (await request('/admin')).status === 307,
    'anonymous admin requires login',
  );
  const unauthorized = await action('createPageAction', [
    { slug: '(home)/qa-denied', title: 'Denied', locales: ['ja'] },
  ]);
  check(
    !unauthorized.result?.ok &&
      !rows('SELECT slug FROM docs WHERE slug = ?', '(home)/qa-denied').length,
    'anonymous action cannot mutate',
  );
  check(
    !(await login('admin@sterasmartone.com', 'wrong')).cookie,
    'incorrect password rejected',
  );
  let admin = (await login('admin@sterasmartone.com', '123456'))
    .cookie!;
  check(admin, 'fixed initial admin logs in');
  const initial = await action(
    'createPageAction',
    [{ slug: '(home)/qa-denied', title: 'Denied', locales: ['ja'] }],
    admin,
  );
  check(!initial.result?.ok, 'initial password cannot write');
  const oldAdmin = admin;
  admin = await change(admin, '123456', 'Quality-Review-2026');
  check(
    (await request('/admin', oldAdmin)).status === 307,
    'old session revoked after password change',
  );
  console.log(
    'PASS bootstrap, login, password, anonymous and initial-password guards',
  );

  const slug = '(home)/qa-http-quality';
  const create = await action(
    'createPageAction',
    [{ slug, title: 'HTTP Quality', locales: ['ja'] }],
    admin,
  );
  check(create.result?.ok, `create: ${create.text}`);
  let stamp = rows(
    'SELECT updated_at FROM docs WHERE slug = ? AND locale = ?',
    slug,
    'ja',
  )[0].updated_at;
  const published =
    '---\ntitle: HTTP Quality\n---\n\n## Verification\n\nUniquequalityalpha\n\n| A | B |\n| - | - |\n| One | Two |\n\n<Callout title="Note">Valid content</Callout>\n';
  const save = await action(
    'saveDocAction',
    [{ slug, locale: 'ja', content: published, expectedUpdatedAt: stamp }],
    admin,
  );
  check(save.result?.ok, `save: ${save.text}`);
  check(save.result.updatedAt > stamp, 'save advances version');
  const stale = await action(
    'saveDocAction',
    [
      {
        slug,
        locale: 'ja',
        content: published + 'stale',
        expectedUpdatedAt: stamp,
      },
    ],
    admin,
  );
  check(
    stale.result?.ok === false && stale.result.conflictAt,
    'stale content is rejected',
  );
  stamp = save.result.updatedAt;
  for (const body of [
    '<Callout>',
    '<UnknownWidget />',
    '---\ntitle: [\n---\n',
  ]) {
    const source = body.startsWith('---') ? body : published + body;
    const invalid = await action(
      'saveDocAction',
      [{ slug, locale: 'ja', content: source, expectedUpdatedAt: stamp }],
      admin,
    );
    check(invalid.result?.ok === false, `invalid MDX rejected: ${body}`);
  }
  check(
    rows(
      'SELECT content FROM docs WHERE slug = ? AND locale = ?',
      slug,
      'ja',
    )[0].content === published,
    'invalid writes preserve published body',
  );
  for (const slug of [
    'openapi/index',
    '(home)/../admin',
    '(home)/api/probe',
    '(home)/qa-http-quality/index',
  ]) {
    const bad = await action(
      'createPageAction',
      [{ slug, title: 'Bad', locales: ['ja'] }],
      admin,
    );
    check(bad.result?.ok === false, `reserved/colliding path rejected ${slug}`);
  }
  const jaBefore = await request('/ja/qa-http-quality.md');
  check(
    (await jaBefore.text()).includes('Uniquequalityalpha'),
    'Markdown follows publication',
  );
  check(
    (await (await request('/ja/qa-http-quality')).text()).includes(
      'Uniquequalityalpha',
    ),
    'HTML follows publication',
  );
  check(
    (await (await request('/ja/llms-full.txt')).text()).includes(
      'Uniquequalityalpha',
    ),
    'llms-full follows publication',
  );
  check(
    (await (await request('/ja/llms.txt')).text()).includes('HTTP Quality'),
    'llms index follows publication',
  );
  const search = (await (
    await request('/api/search?query=Uniquequalityalpha&locale=ja')
  ).json()) as any[];
  check(
    search.some((entry) => JSON.stringify(entry).includes('qa-http-quality')),
    'search rebuilds after publication',
  );
  const en = await action(
    'saveDocAction',
    [
      {
        slug,
        locale: 'en',
        content: published.replace(
          'Uniquequalityalpha',
          'Uniquequalityenglish',
        ),
        expectedUpdatedAt: null,
      },
    ],
    admin,
  );
  check(en.result?.ok, 'missing locale can be created');
  const enConflict = await action(
    'saveDocAction',
    [{ slug, locale: 'en', content: published, expectedUpdatedAt: null }],
    admin,
  );
  check(
    enConflict.result?.ok === false,
    'simultaneous locale creation conflicts',
  );
  check(
    (await (await request('/en/qa-http-quality.md')).text()).includes(
      'Uniquequalityenglish',
    ),
    'English body is independent',
  );
  check(
    (await (await request('/zh/qa-http-quality.md')).text()).includes(
      'Uniquequalityalpha',
    ),
    'missing Chinese falls back to Japanese',
  );
  const invalidDraft = published + '<Callout>';
  const draft = await action(
    'stageDraftAction',
    [{ slug, locale: 'ja', content: invalidDraft }],
    admin,
  );
  check(draft.result?.ok === false, 'invalid draft reports preview error');
  check(
    rows('SELECT content FROM drafts WHERE slug = ?', slug)[0].content ===
      invalidDraft,
    'invalid draft remains recoverable',
  );
  check(
    (await (await request('/ja/qa-http-quality.md')).text()).includes(
      'Uniquequalityalpha',
    ),
    'draft does not publish',
  );
  await action('discardDraftAction', [{ slug, locale: 'ja' }], admin);
  check(
    rows('SELECT content FROM drafts WHERE slug = ?', slug).length === 0,
    'discard clears draft',
  );
  console.log(
    'PASS page CRUD guards, conflicts, locales, draft and live HTML/Markdown/LLMs/search',
  );

  const nav = rows(
    'SELECT data FROM navigation WHERE dir = ? AND locale = ?',
    '(home)',
    'ja',
  )[0].data;
  const navData = JSON.parse(nav);
  navData.sectionNotes['SaaS FAQ'] = 'QA navigation note';
  const navSave = await action(
    'saveNavAction',
    [
      {
        dir: '(home)',
        locale: 'ja',
        json: JSON.stringify(navData),
        expectedJson: nav,
      },
    ],
    admin,
  );
  check(navSave.result?.ok, 'navigation saves');
  const navStale = await action(
    'saveNavAction',
    [{ dir: '(home)', locale: 'ja', json: nav, expectedJson: nav }],
    admin,
  );
  check(navStale.result?.ok === false, 'stale navigation rejected');
  check(
    (await (await request('/overview')).text()).includes('QA navigation note'),
    'navigation updates frontend',
  );
  const upload = await action('uploadImageAction', ['$K1'], admin, {
    file: new Blob(
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><!--',
        'a'.repeat(2 * 1024 * 1024),
        '--></svg>',
      ],
      { type: 'image/svg+xml' },
    ),
  });
  check(upload.result?.ok, `2 MB image upload: ${upload.text}`);
  const imageResponse = await request(upload.result.url);
  check(
    imageResponse.ok &&
      imageResponse.headers.get('content-type') === 'image/svg+xml',
    'uploaded image is publicly readable',
  );
  check(
    imageResponse.headers.get('content-security-policy')?.includes('sandbox'),
    'SVG response forbids scripts',
  );
  check(
    imageResponse.headers.get('x-content-type-options') === 'nosniff',
    'uploaded resources disable MIME sniffing',
  );
  const oversized = await action('uploadImageAction', ['$K1'], admin, {
    file: new Blob(['a'.repeat(8 * 1024 * 1024 + 1)], {
      type: 'image/svg+xml',
    }),
  });
  check(
    oversized.result?.ok === false,
    'over 8 MB fails at application boundary',
  );
  const repeated = await action('uploadImageAction', ['$K1'], '', {
    file: new Blob(['<svg/>'], { type: 'image/svg+xml' }),
  });
  check(!repeated.result?.ok, 'anonymous upload rejected');
  console.log('PASS navigation, 2 MB upload, 8 MB limit and SVG headers');

  const account = await action(
    'createAccountAction',
    [
      {
        email: 'qa-editor@example.com',
        password: 'Initial-Editor-2026',
        role: 'editor',
      },
    ],
    admin,
  );
  check(account.result?.ok, 'admin creates editor');
  let editor = (await login('qa-editor@example.com', 'Initial-Editor-2026'))
    .cookie!;
  editor = await change(editor, 'Initial-Editor-2026', 'Quality-Editor-2026');
  const denied = await action(
    'createAccountAction',
    [
      {
        email: 'qa-denied@example.com',
        password: 'Initial-Editor-2026',
        role: 'admin',
      },
    ],
    editor,
  );
  check(
    !denied.result?.ok &&
      !rows('SELECT id FROM users WHERE email = ?', 'qa-denied@example.com')
        .length,
    'editor cannot create accounts',
  );
  check(
    (await request('/admin/users', editor)).status === 307,
    'editor cannot access accounts UI',
  );
  const edit = await action(
    'saveDocAction',
    [
      {
        slug,
        locale: 'ja',
        content: published.replace('Uniquequalityalpha', 'Uniquequalitybeta'),
        expectedUpdatedAt: stamp,
      },
    ],
    editor,
  );
  check(edit.result?.ok, 'editor can publish content');
  check(
    !(
      await action(
        'saveDocAction',
        [{ slug: 'openapi/index', locale: 'ja', content: published }],
        editor,
      )
    ).result?.ok,
    'editor cannot write OpenAPI',
  );
  const me = rows(
    'SELECT id FROM users WHERE email = ?',
    'admin@sterasmartone.com',
  )[0].id;
  check(
    (await action('deleteAccountAction', [{ id: me }], admin)).result?.ok ===
      false,
    'admin cannot delete self',
  );
  check(
    (await action('updateRoleAction', [{ id: me, role: 'editor' }], admin))
      .result?.ok === false,
    'admin cannot downgrade self',
  );
  const editorId = rows(
    'SELECT id FROM users WHERE email = ?',
    'qa-editor@example.com',
  )[0].id;
  check(
    (
      await action(
        'resetPasswordAction',
        [{ id: editorId, password: 'Reset-Editor-2026' }],
        admin,
      )
    ).result?.ok,
    'admin resets editor password',
  );
  check(
    (await request('/admin', editor)).status === 307,
    'password reset revokes existing editor session',
  );
  check(
    !(await login('qa-editor@example.com', 'Quality-Editor-2026')).cookie,
    'old password rejected after reset',
  );
  check(
    (await action('deleteAccountAction', [{ id: editorId }], admin)).result?.ok,
    'admin deletes editor',
  );
  check(
    rows('SELECT token_hash FROM sessions WHERE user_id = ?', editorId)
      .length === 0,
    'account deletion cascades sessions',
  );
  console.log(
    'PASS editor/admin authorization, self protection, password reset and deletion',
  );

  docker('restart', name);
  origin = `http://${docker('port', name, '3000/tcp')}`;
  await ready();
  check(
    (await (await request('/qa-http-quality.md')).text()).includes(
      'Uniquequalitybeta',
    ),
    'published content persists after restart',
  );
  check(
    (await request(upload.result.url)).ok,
    'uploaded image persists after restart',
  );
  check(
    (await request('/admin', admin)).status === 200,
    'session persists after restart',
  );
  const deleted = await action('deletePageAction', [{ slug }], admin);
  check(deleted.result?.ok, 'page deletion succeeds');
  check(
    (await request('/qa-http-quality.md')).status === 404,
    'deleted page is 404',
  );
  check(
    !rows('SELECT slug FROM docs WHERE slug = ?', slug).length,
    'all locale versions deleted',
  );
  check(
    !JSON.parse(
      rows(
        'SELECT data FROM navigation WHERE dir = ? AND locale = ?',
        '(home)',
        'ja',
      )[0].data,
    ).pages.includes('qa-http-quality'),
    'navigation cleans deleted page',
  );
  const loggedOut = await action('logout', [], admin);
  check(
    loggedOut.response.headers.has('x-action-redirect'),
    'logout redirects',
  );
  check(
    (await request('/admin', admin)).status === 307,
    'logout revokes session',
  );
  console.log('PASS restart persistence, deletion and logout');
  let pageCount = 0;
  for (const locale of ['ja', 'en', 'zh']) {
    const index = await (await request(`/${locale}/llms.txt`)).text();
    const paths = [...index.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(
      (match) => new URL(match[1]).pathname,
    );
    check(paths.length === 126, `${locale} exposes 74 CMS and 52 API pages`);
    for (const markdown of paths) {
      check(
        (await request(`/${locale}${markdown}`)).status === 200,
        `${locale} Markdown ${markdown}`,
      );
      const path = markdown.replace(/\.md$/, '').replace(/\/index$/, '/');
      const html = await request(`/${locale}${path}`);
      const text = await html.text();
      check(
        html.status === 200 &&
          !text.includes('"digest":') &&
          text.includes('<h1'),
        `${locale} HTML ${path}`,
      );
      pageCount++;
    }
    const results = (await (
      await request(`/api/search?query=stera&locale=${locale}`)
    ).json()) as unknown[];
    check(results.length > 0, `${locale} search returns results`);
    check(
      (await request(`/${locale}/og/get-started/set-up/image.png`)).status ===
        200,
      `${locale} dynamic OG`,
    );
  }
  console.log(
    `PASS ${pageCount} pages HTML + Markdown, 3 language search and OG`,
  );
  rows('UPDATE docs SET content = ? WHERE slug = ? AND locale = ? RETURNING slug', '---\ntitle: [\n---\n', '(home)/get-started/set-up', 'ja');
  rows('UPDATE navigation SET data = ? WHERE dir = ? AND locale = ? RETURNING dir', '{', '(home)', 'ja');
  check((await request('/ja/get-started/quickstart')).status === 200, 'corrupt records do not poison unrelated HTML');
  check((await request('/ja/get-started/set-up.md')).status === 404, 'corrupt YAML row is skipped');
  check((await request('/api/search?query=stera&locale=ja')).status === 200, 'search tolerates skipped corrupt records');
  console.log('PASS corrupt YAML/JSON isolated from healthy pages and search');
  // 本脚本自己的测试卷, 不操作项目现存库。
  docker(
    'exec',
    name,
    'node',
    '-e',
    'require("fs").writeFileSync("data/cms.db", "invalid database"); for (const p of ["data/cms.db-wal", "data/cms.db-shm"]) require("fs").rmSync(p, {force:true});',
  );
  docker('restart', name);
  origin = `http://${docker('port', name, '3000/tcp')}`;
  let unhealthy = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      unhealthy = (await request('/api/health')).status === 503;
      if (unhealthy) break;
    } catch {
      /* booting */
    }
    await Bun.sleep(200);
  }
  check(unhealthy, 'corrupt database health is 503');
  const fdCount = () => Number(docker('exec', name, 'node', '-e', 'console.log(require("fs").readdirSync("/proc/1/fd").length)'));
  const beforeFailures = fdCount();
  for (let attempt = 0; attempt < 25; attempt++) {
    const response = await request('/api/health');
    check(response.status === 503, 'repeated corrupt database health remains 503');
    await response.text();
  }
  check(fdCount() <= beforeFailures + 2, 'failed database opens do not leak file descriptors');
  console.log(`PASS ${checks} HTTP assertions; image ${image}`);
} catch (error) {
  console.error(docker('logs', name));
  console.error(docker('port', name, '3000/tcp'));
  throw error;
} finally {
  Bun.spawnSync(['docker', 'rm', '-f', name], {
    stdout: 'ignore',
    stderr: 'ignore',
  });
  Bun.spawnSync(['docker', 'volume', 'rm', volume], {
    stdout: 'ignore',
    stderr: 'ignore',
  });
}
