import fs from 'node:fs/promises';
import path from 'node:path';

type PerFileCounts = Map<string, number>;

type ImageUsage = {
  imagePathOnDisk: string; // absolute path to file under public/docs
  publicPath: string; // e.g. /docs/foo.png
  total: number;
  perFile: PerFileCounts; // key: content/docs file path (relative to repo root), value: occurrences
  fileSize?: number; // file size in bytes
  lastModified?: Date; // last modified time
};

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const PUBLIC_DOCS_DIR = path.resolve(ROOT_DIR, 'public', 'docs');
const CONTENT_DOCS_DIR = path.resolve(ROOT_DIR, 'content', 'docs');

const isMarkdown = (p: string) => /\.(md|mdx)$/i.test(p);

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const stack: string[] = [dir];
  while (stack.length) {
    const d = stack.pop()!;
    let ents: any[] = [];
    try {
      ents = await fs.readdir(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of ents) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.isFile()) out.push(full);
    }
  }
  return out;
}

function toPosix(p: string): string {
  return p.split(path.sep).join(path.posix.sep);
}

async function collectPublicDocsImages(): Promise<Map<string, ImageUsage>> {
  const files = await walkFiles(PUBLIC_DOCS_DIR);
  const map = new Map<string, ImageUsage>(); // key: publicPath like /docs/foo.png
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;
    const rel = toPosix(path.relative(PUBLIC_DOCS_DIR, f));
    const publicPath = '/docs/' + rel;

    // Get file stats for size and modified time
    let fileSize: number | undefined;
    let lastModified: Date | undefined;
    try {
      const stats = await fs.stat(f);
      fileSize = stats.size;
      lastModified = stats.mtime;
    } catch {
      // Skip if we can't get stats
    }

    map.set(publicPath, {
      imagePathOnDisk: f,
      publicPath,
      total: 0,
      perFile: new Map<string, number>(),
      fileSize,
      lastModified,
    });
  }
  return map;
}

// Matches /docs/...<ext> but excludes trailing query/hash and common delimiters
const DOCS_IMAGE_REGEX = /(\/docs\/[^?\s)>'"\]]+?\.(?:png|jpe?g|webp|gif|svg|avif))/gi;

async function scanMarkdownUsages(images: Map<string, ImageUsage>): Promise<{ referencedButMissing: Map<string, Set<string>> }> {
  const mdFiles = (await walkFiles(CONTENT_DOCS_DIR)).filter(isMarkdown);
  const missing = new Map<string, Set<string>>(); // path -> set of files that reference but not present

  for (const file of mdFiles) {
    let text = '';
    try {
      text = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    const relDocPath = toPosix(path.relative(ROOT_DIR, file));
    let m: RegExpExecArray | null;
    while ((m = DOCS_IMAGE_REGEX.exec(text)) !== null) {
      const ref = m[1]; // matched /docs/....ext
      const usage = images.get(ref);
      if (usage) {
        usage.total += 1;
        usage.perFile.set(relDocPath, (usage.perFile.get(relDocPath) ?? 0) + 1);
      } else {
        // referenced path not found under public/docs
        if (!missing.has(ref)) missing.set(ref, new Set());
        missing.get(ref)!.add(relDocPath);
      }
    }
  }

  return { referencedButMissing: missing };
}

// ANSI color codes
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function colorizeIfNotThree(text: string, count: number): string {
  return count !== 3 ? `${RED}${text}${RESET}` : text;
}

function printReport(images: Map<string, ImageUsage>, referencedButMissing: Map<string, Set<string>>): void {
  const all = Array.from(images.values());
  const used = all.filter((i) => i.total > 0);
  const unused = all.filter((i) => i.total === 0);

  // Calculate unused images total size
  const unusedTotalSize = unused.reduce((sum, img) => sum + (img.fileSize ?? 0), 0);

  console.log('=== Image Usage Report (public/docs) ===');
  console.log(`Scanned images: ${all.length}`);
  console.log(`Referenced: ${used.length}`);
  console.log(`Unused: ${unused.length}`);
  if (unusedTotalSize > 0) {
    console.log(`Unused images total size: ${formatBytes(unusedTotalSize)}`);
  }
  if (referencedButMissing.size > 0) {
    console.log(`Missing images referenced: ${referencedButMissing.size}`);
  }
  console.log('');

  // List unused first for easy cleanup
  console.log('--- Unused Images ---');
  if (unused.length === 0) {
    console.log('(none)');
  } else {
    // sort by path for stable output
    unused
      .sort((a, b) => a.publicPath.localeCompare(b.publicPath))
      .forEach((i) => {
        const sizeStr = i.fileSize ? ` [${formatBytes(i.fileSize)}]` : '';
        const line = `${i.publicPath}${sizeStr}`;
        console.log(colorizeIfNotThree(line, i.total)); // total is 0 for unused, so it will be red
      });
  }

  console.log('');
  console.log('--- Usage By Image ---');
  // sort by total desc, then path
  used
    .sort((a, b) => (b.total - a.total) || a.publicPath.localeCompare(b.publicPath))
    .forEach((i) => {
      const fileCount = i.perFile.size;
      const sizeStr = i.fileSize ? ` [${formatBytes(i.fileSize)}]` : '';
      const line = `${i.publicPath}${sizeStr} — ${i.total} use(s) in ${fileCount} file(s)`;
      console.log(colorizeIfNotThree(line, i.total));
      // list per-file counts, sorted by count desc then name
      const entries = Array.from(i.perFile.entries()).sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]));
      for (const [f, n] of entries) {
        console.log(`  - ${f}: ${n}`);
      }
    });

  if (referencedButMissing.size > 0) {
    console.log('');
    console.log('--- Referenced But Missing Under public/docs ---');
    const entries = Array.from(referencedButMissing.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [ref, files] of entries) {
      console.log(`${ref} — referenced in ${files.size} file(s)`);
      const fileList = Array.from(files).sort();
      for (const f of fileList) console.log(`  - ${f}`);
    }
  }
}

async function main() {
  // Prepare index of public/docs images
  const images = await collectPublicDocsImages();
  if (images.size === 0) {
    console.error(`No images found under ${PUBLIC_DOCS_DIR}`);
    process.exit(1);
  }

  // Scan content/docs for usages
  const { referencedButMissing } = await scanMarkdownUsages(images);

  // Print report
  printReport(images, referencedButMissing);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

