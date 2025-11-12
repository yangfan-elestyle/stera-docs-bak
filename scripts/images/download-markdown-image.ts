import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Markdown 图片匹配结果
 * 示例：![用户头像](https://example.com/user.jpg "title")
 */
type ImageMatch = {
  start: number; // 在原文本中的起始位置
  end: number; // 在原文本中的结束位置（不包含）
  raw: string; // 原始完整字符串，如：![用户头像](https://example.com/user.jpg)
  alt: string; // alt 文本，如：用户头像
  args: string; // 括号内的内容，如：https://example.com/user.jpg "title"
};

/** 延时函数，用于控制下载间隔 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 判断是否为 Markdown 文件（.md 或 .mdx） */
const isMarkdownFile = (p: string) => /\.(md|mdx)$/i.test(p);

/** 确保目录存在，不存在则递归创建 */
const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

/**
 * 图片下载目标目录：public/docs
 * 使用 import.meta.url 确保始终指向脚本所在项目的 public/docs 目录
 * 无论从哪个目录执行脚本，都会使用正确的路径
 */
const PUBLIC_DOCS_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  '..',
  'public',
  'docs',
);

/**
 * 查找 alt 文本的闭合括号 ']'
 * 示例：![用户头像] 中找到 ']' 的位置
 * @param text 原文本
 * @param openIndex '[' 的位置
 * @returns ']' 的位置，未找到返回 -1
 */
function findClosingBracket(text: string, openIndex: number): number {
  for (let i = openIndex + 1; i < text.length; i++) {
    const ch = text[i];
    // 忽略转义的括号 \]
    if (ch === ']' && text[i - 1] !== '\\') return i;
  }
  return -1;
}

/**
 * 查找 URL 部分的闭合括号 ')'
 * 示例：(https://example.com/img.jpg "title") 中找到最后的 ')' 位置
 * 需要处理：
 * - 嵌套括号：(https://example.com/img(1).jpg)
 * - 引号内容：(https://example.com/img.jpg "title with ) paren")
 * @param text 原文本
 * @param openIndex '(' 的位置
 * @returns ')' 的位置，未找到返回 -1
 */
function findClosingParen(text: string, openIndex: number): number {
  let depth = 1; // 括号嵌套深度
  let inQuote: '"' | "'" | '' = ''; // 当前是否在引号内
  for (let i = openIndex + 1; i < text.length; i++) {
    const ch = text[i];
    const prev = text[i - 1];
    // 处理引号内的内容，引号内的括号不算数
    if (inQuote) {
      if (ch === inQuote && prev !== '\\') inQuote = '';
      continue;
    }
    // 进入引号
    if (ch === '"' || ch === "'") {
      if (prev !== '\\') inQuote = ch as '"' | "'";
      continue;
    }
    // 处理括号嵌套
    if (ch === '(' && prev !== '\\') depth++;
    else if (ch === ')' && prev !== '\\') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * 解析文本中所有的 Markdown 图片语法
 * 示例输入：
 *   "这是一张图片 ![用户头像](https://example.com/user.jpg) 和另一张 ![logo](./logo.png)"
 * 示例输出：
 *   [
 *     { start: 7, end: 48, raw: "![用户头像](https://example.com/user.jpg)", alt: "用户头像", args: "https://example.com/user.jpg" },
 *     { start: 52, end: 71, raw: "![logo](./logo.png)", alt: "logo", args: "./logo.png" }
 *   ]
 * @param text 原文本
 * @returns 所有图片匹配结果数组
 */
function parseImageOccurrences(text: string): ImageMatch[] {
  const result: ImageMatch[] = [];
  let i = 0;
  while (i < text.length - 1) {
    // 查找 "!["
    if (text[i] === '!' && text[i + 1] === '[') {
      const altOpen = i + 1; // '[' 的位置
      const altClose = findClosingBracket(text, altOpen);
      if (altClose === -1) {
        i += 2;
        continue;
      }
      const afterAlt = altClose + 1;
      // 必须紧跟 '(' 才是图片语法，否则可能是引用式图片 ![alt][ref]
      if (text[afterAlt] !== '(') {
        i = afterAlt;
        continue;
      }
      const parenOpen = afterAlt;
      const parenClose = findClosingParen(text, parenOpen);
      if (parenClose === -1) {
        i = parenOpen + 1;
        continue;
      }
      // 提取各部分内容
      const raw = text.slice(i, parenClose + 1); // 完整的 ![...](...) 字符串
      const alt = text.slice(altOpen + 1, altClose); // alt 文本
      const args = text.slice(parenOpen + 1, parenClose); // 括号内的内容（URL + 可选的 title）
      result.push({ start: i, end: parenClose + 1, raw, alt, args });
      i = parenClose + 1;
    } else {
      i++;
    }
  }
  return result;
}

/**
 * 从 args 中提取 URL
 * args 格式：URL [title]
 * 示例：
 *   - "https://example.com/img.jpg" → "https://example.com/img.jpg"
 *   - "https://example.com/img.jpg \"图片标题\"" → "https://example.com/img.jpg"
 *   - "<https://example.com/path with spaces.jpg>" → "https://example.com/path with spaces.jpg"
 * @param args 括号内的内容
 * @returns URL 字符串，提取失败返回 null
 */
function extractUrlFromArgs(args: string): string | null {
  let s = args.trim();
  if (!s) return null;
  // 处理尖括号包裹的 URL（用于包含空格的 URL）
  if (s.startsWith('<')) {
    const end = s.indexOf('>');
    if (end === -1) return null;
    return s.slice(1, end).trim();
  }
  // 提取到第一个非转义的空白符之前的内容作为 URL
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (/\s/.test(ch) && s[i - 1] !== '\\') {
      return s.slice(0, i).trim();
    }
  }
  return s;
}

/**
 * 规范化 URL：去除查询参数和 hash
 * 示例：
 *   - "https://example.com/img.jpg?width=100&height=200#section" → "https://example.com/img.jpg"
 *   - "//example.com/img.png" → "https://example.com/img.png"
 *   - "data:image/png;base64,..." → null（跳过 data URI）
 * @param urlStr 原始 URL 字符串
 * @returns 规范化后的 URL，无效 URL 返回 null
 */
function normalizeUrl(urlStr: string): string | null {
  let u = urlStr.trim();
  if (!u) return null;
  // 跳过 data URI（如：data:image/png;base64,...）
  if (u.startsWith('data:')) return null;
  // 支持协议相对 URL（//example.com/a.png），自动补充 https:
  if (u.startsWith('//')) u = 'https:' + u;
  // 只处理 http 和 https 协议
  if (!/^https?:\/\//i.test(u)) return null;
  try {
    const uo = new URL(u);
    // 清除 hash 和查询参数，保留纯净的 URL
    uo.hash = '';
    uo.search = '';
    return uo.toString();
  } catch {
    return null;
  }
}

/**
 * 从 HTTP Content-Type 头推断文件扩展名
 * 用于处理 URL 没有扩展名的情况
 * @param ct Content-Type 头的值，如 "image/jpeg; charset=utf-8"
 * @returns 文件扩展名（带点），如 ".jpg"，无法识别返回空字符串
 */
function extFromContentType(ct?: string | null): string {
  if (!ct) return '';
  const mime = ct.split(';')[0].trim().toLowerCase();
  switch (mime) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    case 'image/avif':
      return '.avif';
    default:
      return '';
  }
}

/**
 * 清理文件名，使其适合保存到文件系统
 * 示例：
 *   - "my%20image%20(1).jpg?v=2" → "my image (1).jpg"
 *   - "图片<测试>.png" → "图片_测试_.png"
 *   - "" → "image"
 * @param name 原始文件名
 * @returns 清理后的安全文件名
 */
function sanitizeFilename(name: string): string {
  // 解码 URL 编码（如 %20 → 空格）
  try {
    name = decodeURIComponent(name);
  } catch {}
  // 移除查询参数和 hash（防止残留）
  name = name.replace(/[?#].*$/, '');
  // 替换路径分隔符和控制字符
  name = name.replace(/[\\/\0]/g, '_');
  // 去除首尾空格
  name = name.trim();
  // 替换文件系统不允许的字符：< > : " | ? *
  name = name.replace(/[<>:"|?*]/g, '_');
  // 避免空文件名
  if (!name) name = 'image';
  return name;
}

/**
 * 从 URL 生成唯一的文件名
 * 策略：使用原始文件名 + URL 的 hash 前缀，确保唯一性
 * 示例：
 *   - "https://site1.com/logo.png" → "abc123-logo.png"
 *   - "https://site2.com/logo.png" → "def456-logo.png"
 *   - "https://example.com/" → "abc123-image.png"（无文件名时使用 hash）
 * @param u URL 对象
 * @returns 唯一的清理后的文件名
 */
function basenameFromUrl(u: URL): string {
  // 生成 URL 的 hash 前缀（取前 8 位）
  const urlHash = crypto
    .createHash('sha256')
    .update(u.toString())
    .digest('hex')
    .slice(0, 8);

  let base = path.posix.basename(u.pathname);

  // 如果 URL 没有有效的文件名（如根路径 /），使用 hash 作为文件名
  if (!base || base === '/' || base.startsWith('.')) {
    base = 'image.png'; // 默认扩展名，后续会根据 Content-Type 修正
  }

  // 清理文件名
  base = sanitizeFilename(base);

  // 分离文件名和扩展名
  const ext = path.extname(base);
  const nameWithoutExt = ext ? base.slice(0, -ext.length) : base;

  // 组合：hash-文件名.扩展名
  return ext
    ? `${urlHash}-${nameWithoutExt}${ext}`
    : `${urlHash}-${nameWithoutExt}`;
}

/**
 * 如果本地不存在则下载图片
 * 核心功能：
 * 1. 检查文件是否已存在，存在则跳过下载
 * 2. 发起 HTTP 请求下载图片
 * 3. 如果文件名没有扩展名，从 Content-Type 推断扩展名
 * 4. 保存文件到本地
 * 5. 下载完成后延时 1 秒（重要！防止请求过快）
 *
 * @param urlStr 图片 URL
 * @param localDir 本地保存目录（如 public/docs）
 * @returns 本地文件名（不含路径），下载失败返回 null
 */
async function downloadIfNeeded(
  urlStr: string,
  localDir: string,
): Promise<string | null> {
  const u = new URL(urlStr);
  let base = basenameFromUrl(u);
  let target = path.join(localDir, base);

  // 检查文件是否已存在
  try {
    await fs.access(target);
    return base; // 文件已存在，直接返回，不重复下载
  } catch {}

  // 发起 HTTP 请求
  let res: Response;
  try {
    res = await fetch(urlStr);
  } catch (e) {
    console.error(`Fetch failed for ${urlStr}:`, e);
    return null;
  }
  if (!res.ok) {
    console.error(`HTTP ${res.status} for ${urlStr}`);
    return null;
  }

  // 如果文件名没有扩展名，尝试从 Content-Type 推断
  const hasExt = path.extname(base).length > 0;
  if (!hasExt) {
    const ext = extFromContentType(res.headers.get('content-type')) || '';
    if (ext) {
      base = base + ext;
      target = path.join(localDir, base);
      // 再次检查带扩展名的文件是否已存在
      try {
        await fs.access(target);
        return base; // 文件已存在
      } catch {}
    }
  }

  // 下载并保存文件
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  await ensureDir(localDir);
  await fs.writeFile(target, buf);

  // ⚠️ 重要：下载完成后强制延时 1 秒，防止请求过快被限制
  await sleep(1000);
  return base;
}

/**
 * 处理单个 Markdown 文件
 * 主要流程：
 * 1. 读取文件内容
 * 2. 解析出所有图片语法 ![...](...)
 * 3. 提取并规范化 URL
 * 4. 下载图片到 public/docs（利用缓存避免重复下载）
 * 5. 替换原文中的 URL 为本地路径 ![](/docs/xxx)
 * 6. 如果有修改，保存文件
 *
 * @param filePath Markdown 文件路径
 * @param cache URL 到本地文件名的缓存（避免同一 URL 重复下载）
 */
async function processMarkdownFile(
  filePath: string,
  cache: Map<string, string>,
): Promise<void> {
  const orig = await fs.readFile(filePath, 'utf8');
  const matches = parseImageOccurrences(orig);
  if (matches.length === 0) return; // 没有图片，跳过

  let changed = false;
  let output = '';
  let cursor = 0; // 当前处理位置

  for (const m of matches) {
    // 追加当前匹配之前的内容
    if (cursor < m.start) output += orig.slice(cursor, m.start);

    // 提取并规范化 URL
    const rawUrl = extractUrlFromArgs(m.args);
    const normalized = rawUrl ? normalizeUrl(rawUrl) : null;
    if (!normalized) {
      // 无法解析/规范化，保留原始内容
      output += m.raw;
      cursor = m.end;
      continue;
    }

    // 使用缓存或下载图片
    let localName: string | undefined;
    if (cache.has(normalized)) {
      // 缓存命中，直接使用
      localName = cache.get(normalized);
    } else {
      // 下载图片
      const name = await downloadIfNeeded(normalized, PUBLIC_DOCS_DIR);
      if (name) {
        cache.set(normalized, name);
        localName = name;
      }
    }

    if (!localName) {
      // 下载失败，保留原始内容
      output += m.raw;
    } else {
      // 替换为本地路径
      output += `![](/docs/${localName})`;
      changed = true;
    }
    cursor = m.end;
  }

  // 追加剩余内容
  if (cursor < orig.length) output += orig.slice(cursor);

  // 如果有修改，保存文件
  if (changed && output !== orig) {
    await fs.writeFile(filePath, output, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

/**
 * 遍历并处理目标路径
 * 支持两种模式：
 * 1. 单个文件：直接处理该 Markdown 文件
 * 2. 目录：递归处理目录下所有 .md 和 .mdx 文件
 *
 * @param targetPath 文件或目录的绝对路径
 */
async function walkAndProcess(targetPath: string): Promise<void> {
  const stat = await fs.stat(targetPath);
  const cache = new Map<string, string>(); // URL 到本地文件名的缓存

  // 处理单个文件
  if (stat.isFile()) {
    if (isMarkdownFile(targetPath)) {
      await processMarkdownFile(targetPath, cache);
    } else {
      console.warn(`Skipped non-markdown file: ${targetPath}`);
    }
    return;
  }

  // 处理目录：递归遍历所有文件
  if (stat.isDirectory()) {
    const stack: string[] = [targetPath]; // 待处理的目录栈
    while (stack.length) {
      const dir = stack.pop()!;
      const ents = await fs.readdir(dir, { withFileTypes: true });
      for (const ent of ents) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          stack.push(full); // 子目录入栈
        } else if (ent.isFile()) {
          if (isMarkdownFile(full)) {
            await processMarkdownFile(full, cache);
          }
        }
      }
    }
    return;
  }

  console.warn(`Unsupported path type: ${targetPath}`);
}

/**
 * 主函数
 * 用法：bun run scripts/images/index.ts <文件或目录路径>
 * 示例：
 *   - bun run scripts/images/index.ts content/docs/guide.mdx
 *   - bun run scripts/images/index.ts content/docs
 */
async function main() {
  const arg = process.argv.slice(2).find((a) => !a.startsWith('-'));
  if (!arg) {
    console.error(
      'Usage: bun run scripts/images/index.ts <path-to-md-or-directory>',
    );
    process.exit(1);
  }
  const target = path.resolve(process.cwd(), arg);
  await walkAndProcess(target);
}

// 执行脚本
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
