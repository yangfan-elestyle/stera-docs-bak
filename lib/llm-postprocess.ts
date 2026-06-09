import {
  type ErrorCodesResponse,
  type Lang,
  LANG_MAP,
  loadErrorCodes,
} from '@/components/ErrorCodeTable';
import { getFilteredTreeByHost } from './source';
import { detectTenantByHost } from './tenant';
import { getImageAsset, getTextValue } from './tenant-config';
import { buildNavSections, type NavSection } from './nav-sections';

type HomeLang = 'ja' | 'en' | 'zh';

const E_TEXT_RE = /<EText\s+name=("|')([^"']+)\1\s*\/>/g;
const E_IMG_RE = /<EImg\b([^>]*?)\/>/g;
const E_HOME_RE = /<EHome\b([^>]*?)\/>/g;
const E_CONTAINER_RE =
  /<EContainer\s+tenant=("|')([^"']+)\1\s*>([\s\S]*?)<\/EContainer>/g;
const CALLOUT_RE = /<Callout\b([^>]*?)>([\s\S]*?)<\/Callout>/g;
const API_PAGE_RE = /<APIPage\b([^>]*?)\/>/g;
const ERROR_CODE_TABLE_RE = /<ErrorCodeTable\s+lang=("|')(ja|en|zh)\1\s*\/>/g;
// MDX expression-style comments: `{/* ... */}` (fumadocs-openapi 生成的文件首行有此注释)
const MDX_COMMENT_RE = /\{\/\*[\s\S]*?\*\/\}/g;

// Callout type → GFM Alert 类型映射 (https://github.com/orgs/community/discussions/16925)
const CALLOUT_ALERT_MAP: Record<string, string> = {
  warn: 'WARNING',
  warning: 'WARNING',
  error: 'CAUTION',
  danger: 'CAUTION',
  info: 'NOTE',
  note: 'NOTE',
  tip: 'TIP',
  success: 'TIP',
};

const FENCE_RE = /^[ \t]{0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
const INLINE_CODE_RE = /(`+)(?:(?!\1)[\s\S])+?\1/g;
const ATTR_RE = /(\w+)\s*=\s*("|')([^"']*)\2/g;
const BLANK_LINES_RE = /(?:^[ \t]*\r?\n){2,}/gm;

export async function resolveLLMTags(
  markdown: string,
  host: string,
): Promise<string> {
  const segments = splitByFence(markdown);
  for (let i = 0; i < segments.length; i += 2) {
    segments[i] = transformProse(segments[i], host);
  }
  if (segments.some((s, i) => i % 2 === 0 && s.includes('<ErrorCodeTable'))) {
    const data = await loadErrorCodes();
    for (let i = 0; i < segments.length; i += 2) {
      segments[i] = segments[i].replace(
        ERROR_CODE_TABLE_RE,
        (_m, _q, lang: string) => buildErrorCodeTable(data, lang as Lang),
      );
    }
  }
  return segments.join('').replace(BLANK_LINES_RE, '\n');
}

function buildErrorCodeTable(data: ErrorCodesResponse, lang: Lang): string {
  const key = LANG_MAP[lang];
  const lines = [
    '| Code | HTTP | Category | Message |',
    '| --- | --- | --- | --- |',
  ];
  for (const item of data.items) {
    const raw = item.message[key] ?? item.message.ja ?? item.message.en ?? '';
    const msg = raw.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    lines.push(
      `| \`${item.code}\` | ${item.httpStatus} | ${item.category} | ${msg} |`,
    );
  }
  return lines.join('\n');
}

// 按 fenced code block 切片，返回 [prose, code, prose, code, ..., prose]。
// 偶数下标为正文（需要替换），奇数下标为 code block（保持原样）。
function splitByFence(input: string): string[] {
  return splitByPattern(input, FENCE_RE);
}

function transformProse(text: string, host: string): string {
  // 块级标签必须在 inline-code 切分之前解开,否则 inner 中的反引号片段
  // (如 Callout 内的 `10001`) 会把容器拆到不同 part,导致跨段匹配失败。
  const opened = openBlockTags(text, host);
  const parts = splitByPattern(opened, INLINE_CODE_RE);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = replaceLeafTags(parts[i], host);
  }
  return parts.join('');
}

// 解开/移除「块级」结构: MDX 注释、EContainer、Callout。
// 这些结构的 inner 可能含 inline code 或叶子标签,需要在 inline-code 切分前先处理外壳。
function openBlockTags(text: string, host: string): string {
  const tenant = detectTenantByHost(host).toLowerCase();
  return text
    .replace(MDX_COMMENT_RE, '')
    .replace(E_CONTAINER_RE, (_m, _q, tenants: string, inner: string) => {
      const allow = tenants
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      return allow.length === 0 || allow.includes(tenant) ? inner : '';
    })
    .replace(CALLOUT_RE, (_m, attrs: string, inner: string) =>
      renderCallout(attrs, inner),
    );
}

// 替换叶子标签 (无 inner、不含跨段反引号风险),在 inline-code 切分后的 prose 段上执行。
function replaceLeafTags(text: string, host: string): string {
  return text
    .replace(
      E_TEXT_RE,
      (_m, _q, name: string) => getTextValue(name, host) ?? '',
    )
    .replace(E_IMG_RE, (_m, attrs: string) => {
      const a = parseAttrs(attrs);
      const asset = a.src ? getImageAsset(a.src, host) : undefined;
      if (!asset) return '';
      return `![${a.alt ?? ''}](${asset.src})`;
    })
    .replace(E_HOME_RE, (_m, attrs: string) => {
      const a = parseAttrs(attrs);
      const lang = normalizeHomeLang(a.lang);
      const tree = getFilteredTreeByHost(lang, host);
      return renderHomeSections(buildNavSections(tree, a.root ?? '/'));
    })
    .replace(API_PAGE_RE, (_m, attrs: string) => renderAPIPage(attrs));
}

// Callout → GFM Alert (`> [!TYPE]` 块). inner 内的 EText/EImg 等会被后续 replace 处理。
function renderCallout(attrs: string, inner: string): string {
  const a = parseAttrs(attrs);
  const alert = CALLOUT_ALERT_MAP[(a.type ?? '').toLowerCase()] ?? 'NOTE';

  const body = inner
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s+/, '').trimEnd());
  while (body.length > 0 && body[0] === '') body.shift();
  while (body.length > 0 && body[body.length - 1] === '') body.pop();

  const out: string[] = [`> [!${alert}]`];
  if (a.title) out.push(`> **${decodeHtmlEntities(a.title)}**`);
  for (const line of body) out.push(line === '' ? '>' : `> ${line}`);
  return out.join('\n');
}

// APIPage 是由 fumadocs-openapi 注入的渲染组件,无法静态展开.
// 退化为「端点标识 + yaml 来源」一行,保证喂给 LLM 的 .md 至少包含 method/path.
function renderAPIPage(attrs: string): string {
  const a = parseAttrs(attrs);
  const opsRaw = a.operations ? decodeHtmlEntities(a.operations) : '';
  let ops: unknown;
  try {
    ops = JSON.parse(opsRaw);
  } catch {
    return '';
  }
  if (!Array.isArray(ops)) return '';

  const lines = ops
    .filter(
      (op): op is { path: string; method: string } =>
        !!op &&
        typeof (op as any).path === 'string' &&
        typeof (op as any).method === 'string',
    )
    .map((op) => `**Endpoint**: \`${op.method.toUpperCase()} ${op.path}\``);
  return lines.join('\n\n');
}

// fumadocs 把 MDX 属性表达式序列化到 HTML 属性时会做 entity 编码,例如
// `operations={[{"path":"/x"}]}` → `operations="[{&#x22;path&#x22;:&#x22;/x&#x22;}]"`.
// 仅解码我们实际遇到的几种,避免引入完整 HTML entities 表.
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#x22;/gi, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function renderHomeSections(sections: NavSection[]): string {
  const out: string[] = [];
  for (const section of sections) {
    if (section.title) out.push(`## ${section.title}`);
    if (section.description) out.push('', section.description);
    out.push('');
    for (const item of section.items) {
      out.push(`- [${item.title}](${item.url})`);
    }
    out.push('');
  }
  return out.join('\n').trimEnd();
}

function normalizeHomeLang(v?: string): HomeLang {
  const s = (v ?? '').trim().toLowerCase();
  if (s.startsWith('zh') || s.startsWith('cn')) return 'zh';
  if (s.startsWith('en')) return 'en';
  return 'ja';
}

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of raw.matchAll(ATTR_RE)) out[m[1]] = m[3];
  return out;
}

function splitByPattern(input: string, pattern: RegExp): string[] {
  const out: string[] = [];
  let last = 0;
  for (const m of input.matchAll(pattern)) {
    out.push(input.slice(last, m.index));
    out.push(m[0]);
    last = (m.index ?? 0) + m[0].length;
  }
  out.push(input.slice(last));
  return out;
}
