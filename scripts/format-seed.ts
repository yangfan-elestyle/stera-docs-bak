// seed/docs/**/*.mdx 源码排版: 表格对齐 / 列表符号统一 / 硬换行显式化 / 行尾空白与多余空行清理。
// 只改排版, 不改内容: 每个文件改前改后各解析一次 mdast (去掉位置信息) 必须完全相等, 不等则该文件不写。
//
//   bun run format:seed          # 就地改写
//   bun run format:seed --check  # 只检查, 有待改文件时 exit 1
import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { Glob } from 'bun';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import stringWidth from 'string-width';

const ROOT = 'seed/docs';
// 对齐格式只用于纯半角且不超宽的表格, 其余一律紧凑格式 (`| a | b |`):
//   - 后台编辑器开了 lineWrapping, 超宽的对齐表格会折行, 对齐反而更乱
//   - 编辑器等宽字体里中日文字宽不是半角的 2 倍, 按 2 倍补空格仍对不齐
const MAX_ALIGNED_WIDTH = 80;

type Node = {
  type: string;
  children?: Node[];
  position?: { start: { offset: number; column: number }; end: { offset: number } };
  align?: (string | null)[];
  ordered?: boolean;
  [k: string]: unknown;
};
type Edit = { start: number; end: number; text: string };

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
const parse = (body: string) => processor.parse(body) as unknown as Node;

function splitFrontmatter(src: string): [string, string] {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(src);
  return m ? [m[0], src.slice(m[0].length)] : ['', src];
}

function walk(node: Node, fn: (n: Node) => void) {
  fn(node);
  for (const c of node.children ?? []) walk(c, fn);
}

// 位置与 estree 只反映排版, 比较时去掉。
function strip(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(strip);
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === 'position' || k === 'data') continue;
      out[k] = strip(v);
    }
    return out;
  }
  return node;
}

function formatTable(src: string, table: Node): Edit | null {
  const { start, end } = table.position!;
  // 嵌在列表 / 引用里的表格需要补前缀, seed 里没有, 遇到就跳过。
  if (start.column !== 1) return null;
  const rows = table.children!.map((row) =>
    row.children!.map((cell, i, cells) => {
      let s = src.slice(cell.position!.start.offset, cell.position!.end.offset);
      if (s.startsWith('|')) s = s.slice(1);
      if (i === cells.length - 1 && /(^|[^\\])\|\s*$/.test(s))
        s = s.replace(/\|\s*$/, '');
      return s.trim();
    }),
  );
  const align = table.align ?? [];
  const cols = Math.max(align.length, ...rows.map((r) => r.length));
  const widths = Array.from({ length: cols }, (_, i) =>
    Math.max(3, ...rows.map((r) => stringWidth(r[i] ?? ''))),
  );
  const delim = (i: number, w: number) => {
    const a = align[i];
    const inner = '-'.repeat(Math.max(1, w - (a === 'center' ? 2 : a ? 1 : 0)));
    return a === 'center' ? `:${inner}:` : a === 'left' ? `:${inner}` : a === 'right' ? `${inner}:` : inner;
  };
  const pad = (s: string, i: number, w: number) => {
    const gap = w - stringWidth(s);
    if (align[i] === 'right') return ' '.repeat(gap) + s;
    if (align[i] === 'center') {
      const l = Math.floor(gap / 2);
      return ' '.repeat(l) + s + ' '.repeat(gap - l);
    }
    return s + ' '.repeat(gap);
  };
  const render = (aligned: boolean) => {
    const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
    const out = rows.map((r) =>
      line(r.map((c, i) => (aligned ? pad(c, i, widths[i]) : c))),
    );
    const d = line(align.map((_, i) => delim(i, aligned ? widths[i] : 3)));
    out.splice(1, 0, d);
    return out;
  };
  let lines = render(true);
  if (lines.some((l) => stringWidth(l) > MAX_ALIGNED_WIDTH || stringWidth(l) !== l.length))
    lines = render(false);
  return { start: start.offset, end: end.offset, text: lines.join('\n') };
}

function collectEdits(body: string, tree: Node) {
  const tables: Edit[] = [];
  const markers: Edit[] = [];
  const breaks: Edit[] = [];
  // 这些节点的原文按字节保留: 代码 / HTML / JSX 表达式 / ESM。
  const frozen: [number, number][] = [];

  walk(tree, (n) => {
    const p = n.position;
    if (!p) return;
    if (['code', 'html', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm', 'inlineCode'].includes(n.type))
      frozen.push([p.start.offset, p.end.offset]);
    if (n.type === 'table') {
      const e = formatTable(body, n);
      if (e) tables.push(e);
      frozen.push([p.start.offset, p.end.offset]);
    }
    if (n.type === 'list' && !n.ordered) {
      for (const item of n.children ?? []) {
        const o = item.position!.start.offset;
        if (body[o] === '*' || body[o] === '+') markers.push({ start: o, end: o + 1, text: '-' });
      }
    }
    // 行尾两个空格的硬换行在编辑器里看不见, 统一成显式的 `\`。
    if (n.type === 'break') {
      const s = body.slice(p.start.offset, p.end.offset);
      const m = /^[ \t]{2,}(\r?\n)$/.exec(s);
      if (m) breaks.push({ start: p.start.offset, end: p.end.offset, text: `\\${m[1]}` });
    }
  });

  const isFrozen = (o: number) => frozen.some(([s, e]) => o >= s && o < e);
  const breakAt = new Set(breaks.map((b) => b.start));
  const whitespace: Edit[] = [];
  for (const m of body.matchAll(/[ \t]+(?=\r?\n|$)/g)) {
    if (!breakAt.has(m.index!) && !isFrozen(m.index!))
      whitespace.push({ start: m.index!, end: m.index! + m[0].length, text: '' });
  }
  for (const m of body.matchAll(/\n{3,}/g)) {
    if (!isFrozen(m.index!) && !isFrozen(m.index! + m[0].length - 1))
      whitespace.push({ start: m.index!, end: m.index! + m[0].length, text: '\n\n' });
  }
  return { tables, markers, breaks, whitespace };
}

function apply(body: string, edits: Edit[]) {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = body;
  let last = Infinity;
  for (const e of sorted) {
    if (e.end > last) continue; // 重叠的编辑只保留靠后的那个
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    last = e.start;
  }
  return out.trim() ? out.replace(/\n*$/, '\n') : out;
}

const check = process.argv.includes('--check');
const pending: string[] = [];
const failed: string[] = [];

for (const rel of new Glob('**/*.mdx').scanSync(ROOT)) {
  const file = `${ROOT}/${rel}`;
  const src = readFileSync(file, 'utf8');
  const [fm, body] = splitFrontmatter(src);
  const tree = parse(body);
  const groups = collectEdits(body, tree);
  const expected = strip(tree);

  // 整体改写的 AST 不等时, 逐组退回, 只保留不改语义的那几组。
  let next = apply(body, Object.values(groups).flat());
  if (!isDeepStrictEqual(strip(parse(next)), expected)) {
    const kept = Object.entries(groups).filter(([, edits]) =>
      isDeepStrictEqual(strip(parse(apply(body, edits))), expected),
    );
    next = apply(body, kept.flatMap(([, e]) => e));
    const dropped = Object.keys(groups).filter((k) => !kept.some(([g]) => g === k));
    if (!isDeepStrictEqual(strip(parse(next)), expected)) {
      failed.push(`${file} (all groups)`);
      continue;
    }
    failed.push(`${file} (skipped: ${dropped.join(', ')})`);
  }

  const out = fm + next;
  if (out === src) continue;
  pending.push(file);
  if (!check) writeFileSync(file, out);
}

console.log(`${check ? 'would format' : 'formatted'}: ${pending.length}`);
for (const f of pending) console.log(`  ${f}`);
if (failed.length) {
  console.log(`partially skipped (AST changed): ${failed.length}`);
  for (const f of failed) console.log(`  ${f}`);
}
if (check && pending.length) process.exit(1);
