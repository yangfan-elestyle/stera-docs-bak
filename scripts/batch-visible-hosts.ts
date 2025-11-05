/*
 简化版：批量为 meta.json 与 MDX frontmatter 追加/合并 `visibleOnHosts`。

 用法：
   bun run scripts/batch-visible-hosts.ts \
     --path content/docs/smcc                 # 可以是文件或文件夹
     --hosts docs-smcc.stg.elepay.localhost,docs-smcc.stg.elepay.dev

 规则：
 - 仅处理两类文件：meta.json（含 meta.xx.json）与 .mdx。
 - 若文件已有 `visibleOnHosts`：执行“追加合并”（去重，不覆盖）。
 - 若无：自动新增字段/frontmatter。
 - 如果传入的是文件夹，则递归处理；如果是文件，则只处理该文件。
*/

import { promises as fs } from 'fs';
import path from 'path';

interface CliOptions {
  targetPath: string;
  hosts: string[];
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    targetPath: '',
    hosts: [],
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    // no-op
    const [key, valueRaw] = arg.startsWith('--')
      ? arg.split('=')
      : [arg, undefined];
    const value = valueRaw ?? argv[i + 1];
    const shift = valueRaw ? 0 : 1;
    switch (key) {
      case '--path':
        if (!value) throw new Error('--path requires a value');
        opts.targetPath = value.trim();
        i += shift;
        break;
      case '--hosts':
        if (!value) throw new Error('--hosts requires a value');
        opts.hosts = value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        i += shift;
        break;
      default:
        if (key.startsWith('--')) {
          throw new Error(`Unknown option: ${key}`);
        }
        break;
    }
  }

  if (!opts.targetPath) {
    throw new Error(
      'Missing --path. Example: --path content/docs/smcc or --path content/docs/smcc/guide/terminal-settings/meta.zh.json',
    );
  }
  if (opts.hosts.length === 0) {
    throw new Error(
      'Missing --hosts. Example: --hosts a.example.com,b.example.com',
    );
  }
  return opts;
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile()) {
      yield full;
    }
  }
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizeHost(host: string): string {
  try {
    const url = new URL(host.startsWith('http') ? host : `http://${host}`);
    return url.hostname.toLowerCase();
  } catch {
    return host.toLowerCase();
  }
}

// ---------- meta.json updater ----------
async function updateMetaJson(file: string, hosts: string[]) {
  const raw = await fs.readFile(file, 'utf8');
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn(`[skip:invalid-json] ${file}`);
    return { changed: false };
  }

  const current: string[] | undefined = Array.isArray(data.visibleOnHosts)
    ? data.visibleOnHosts.map(String)
    : undefined;

  const next: string[] = unique([...(current ?? []), ...hosts]);

  const equal =
    current &&
    current.length === next.length &&
    current.every((h, i) => normalizeHost(h) === normalizeHost(next[i]));

  if (equal) return { changed: false };

  data.visibleOnHosts = next;

  const out = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(file, out, 'utf8');
  return { changed: true };
}

// ---------- MDX frontmatter updater ----------
function buildHostsYaml(hosts: string[], indent = ''): string {
  const lines = [
    `${indent}visibleOnHosts:`,
    ...hosts.map((h) => `${indent}  - ${h}`),
  ];
  return lines.join('\n');
}

function updateFrontmatterMerge(
  content: string,
  newHosts: string[],
): { changed: boolean; text: string } {
  const fmStart = content.startsWith('---\n')
    ? 0
    : content.startsWith('\ufeff---\n')
      ? 1
      : -1; // handle BOM
  if (fmStart !== -1) {
    // has frontmatter
    const startIdx = content.indexOf('---\n');
    const endIdx = content.indexOf('\n---', startIdx + 4);
    if (endIdx === -1) {
      // malformed, treat as no frontmatter
      return injectFrontmatter(content, unique(newHosts));
    }
    const fm = content.slice(startIdx + 4, endIdx);
    const body = content.slice(endIdx + 4); // skip "\n---"

    const lines = fm.split('\n');
    const out: string[] = [];
    let i = 0;
    let replaced = false;
    while (i < lines.length) {
      const line = lines[i];
      const m = line.match(/^(\s*)visibleOnHosts\s*:(.*)$/);
      if (m) {
        const indent = m[1] ?? '';
        const rest = (m[2] ?? '').trim();
        let existing: string[] = [];

        if (rest.startsWith('[')) {
          const idxClose = rest.indexOf(']');
          if (idxClose !== -1) {
            const inner = rest.slice(1, idxClose);
            existing = inner
              .split(',')
              .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
              .filter(Boolean);
          }
          const merged = unique([...existing, ...newHosts]);
          out.push(buildHostsYaml(merged, indent));
          replaced = true;
          i += 1;
          continue;
        } else {
          const block: string[] = [];
          let j = i + 1;
          while (j < lines.length) {
            const li = lines[j];
            const mm = li.match(/^\s*-\s*(.*)$/);
            if (!mm) break;
            const host = (mm[1] ?? '').trim().replace(/^['"]|['"]$/g, '');
            if (host) block.push(host);
            j++;
          }
          const merged = unique([...block, ...newHosts]);
          out.push(buildHostsYaml(merged, indent));
          replaced = true;
          i = j;
          continue;
        }
      }
      out.push(line);
      i++;
    }

    if (!replaced) {
      const trimmed = out.join('\n').trimEnd();
      const nextFm =
        trimmed.length > 0
          ? `${trimmed}\n${buildHostsYaml(unique(newHosts))}\n`
          : `${buildHostsYaml(unique(newHosts))}\n`;
      const next = `---\n${nextFm}---${body}`;
      if (next === content) return { changed: false, text: content };
      return { changed: true, text: next };
    }

    const next = `---\n${out.join('\n')}\n---${body}`;
    if (next === content) return { changed: false, text: content };
    return { changed: true, text: next };
  }

  // no frontmatter: inject
  return injectFrontmatter(content, unique(newHosts));
}

function injectFrontmatter(
  content: string,
  hosts: string[],
): { changed: boolean; text: string } {
  const header = `---\n${buildHostsYaml(hosts)}\n---\n\n`;
  return { changed: true, text: header + content };
}

async function updateMdx(file: string, hosts: string[]) {
  const raw = await fs.readFile(file, 'utf8');
  const { changed, text } = updateFrontmatterMerge(raw, hosts);
  if (changed) await fs.writeFile(file, text, 'utf8');
  return { changed };
}

async function main() {
  const opts = parseArgs(process.argv);
  let changedCount = 0;
  let scanned = 0;

  async function processFile(file: string) {
    const lower = file.toLowerCase();
    const isMeta = /\/meta(\.[a-z]{2})?\.json$/i.test(lower);
    const isMdx = /\.(mdx)$/i.test(lower);
    if (!isMeta && !isMdx) return;
    scanned++;

    try {
      if (isMeta) {
        const res = await updateMetaJson(file, opts.hosts);
        if (res.changed) {
          changedCount++;
          console.log(`[meta] updated ${file}`);
        }
      } else if (isMdx) {
        const res = await updateMdx(file, opts.hosts);
        if (res.changed) {
          changedCount++;
          console.log(`[mdx]  updated ${file}`);
        }
      }
    } catch (e) {
      console.warn(`[error] ${file}: ${(e as Error).message}`);
    }
  }

  const stat = await fs.stat(opts.targetPath).catch(() => undefined);
  if (!stat) throw new Error(`Path not found: ${opts.targetPath}`);
  if (stat.isDirectory()) {
    for await (const file of walk(opts.targetPath)) {
      await processFile(file);
    }
  } else if (stat.isFile()) {
    await processFile(path.resolve(opts.targetPath));
  }

  console.log(`\nScanned: ${scanned} files, Changed: ${changedCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
