import {
  type ErrorCodesResponse,
  type Lang,
  LANG_MAP,
  loadErrorCodes,
} from '@/components/ErrorCodeTable';
import { getFilteredTreeByHost } from './source';
import { detectTenantByHost } from './tenant';
import { getImageAsset, getTextValue } from './tenant-config';

type HomeLang = 'ja' | 'en' | 'zh';

type HomeSection = {
  title: string;
  description?: string;
  items: { title: string; url?: string; external?: boolean }[];
};

const E_TEXT_RE = /<EText\s+name=("|')([^"']+)\1\s*\/>/g;
const E_IMG_RE = /<EImg\b([^>]*?)\/>/g;
const E_HOME_RE = /<EHome\b([^>]*?)\/>/g;
const E_CONTAINER_RE =
  /<EContainer\s+tenant=("|')([^"']+)\1\s*>([\s\S]*?)<\/EContainer>/g;
const ERROR_CODE_TABLE_RE =
  /<ErrorCodeTable\s+lang=("|')(ja|en|zh)\1\s*\/>/g;

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
    const raw =
      item.message[key] ?? item.message.ja ?? item.message.en ?? '';
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
  const parts = splitByPattern(text, INLINE_CODE_RE);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = applyETagReplacements(parts[i], host);
  }
  return parts.join('');
}

function applyETagReplacements(text: string, host: string): string {
  const tenant = detectTenantByHost(host).toLowerCase();

  return text
    .replace(E_CONTAINER_RE, (_m, _q, tenants: string, inner: string) => {
      const allow = tenants
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      return allow.length === 0 || allow.includes(tenant) ? inner : '';
    })
    .replace(E_TEXT_RE, (_m, _q, name: string) => getTextValue(name, host) ?? '')
    .replace(E_IMG_RE, (_m, attrs: string) => {
      const a = parseAttrs(attrs);
      const asset = a.src ? getImageAsset(a.src, host) : undefined;
      if (!asset) return '';
      return `![${a.alt ?? ''}](${asset.src})`;
    })
    .replace(E_HOME_RE, (_m, attrs: string) => {
      const a = parseAttrs(attrs);
      const lang = normalizeHomeLang(a.lang);
      return renderHomeSections(buildHomeSections(lang, host));
    });
}

function renderHomeSections(sections: HomeSection[]): string {
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

// EHome 同源逻辑的纯函数版本,仅在 LLM 输出场景使用。
// EHome 组件保持原样,本函数与之独立演进,避免相互耦合。
function normalizeHomeLang(v?: string): HomeLang {
  const s = (v ?? '').trim().toLowerCase();
  if (s.startsWith('zh') || s.startsWith('cn')) return 'zh';
  if (s.startsWith('en')) return 'en';
  return 'ja';
}

function buildHomeSections(lang: HomeLang, host: string): HomeSection[] {
  const tree: any = getFilteredTreeByHost(lang, host) as any;
  const children: any[] = tree?.children ?? [];

  const sections: HomeSection[] = [];
  let current: HomeSection | null = null;

  const flush = () => {
    if (current && current.items.length > 0) sections.push(current);
    current = null;
  };

  const startSection = (rawTitle?: string, description?: string) => {
    const title = (rawTitle ?? '').replace(/^---|---$/g, '').trim();
    flush();
    current = { title, description, items: [] };
  };

  const addItem = (title: string, url?: string, external?: boolean) => {
    if (!url || url === '/') return;
    (current ??= { title: '', items: [] }).items.push({
      title,
      url,
      external,
    });
  };

  const findFirstLink = (
    nodes?: any[],
  ): { url?: string; name?: string; external?: boolean } | undefined => {
    if (!nodes) return undefined;
    for (const n of nodes) {
      if (!n) continue;
      if (n.type === 'page') return n;
      if (n.type === 'folder' && n.index) return n.index;
    }
    return undefined;
  };

  for (const node of children) {
    if (!node) continue;
    switch (node.type) {
      case 'separator': {
        startSection(
          String(node.name ?? ''),
          node.description ? String(node.description) : undefined,
        );
        break;
      }
      case 'page': {
        addItem(String(node.name ?? ''), node.url, Boolean(node.external));
        break;
      }
      case 'folder': {
        const title = String(node?.name ?? '');
        const indexUrl = node.index?.url as string | undefined;
        if (indexUrl) {
          addItem(title, indexUrl, Boolean(node.index?.external));
        } else {
          const first = findFirstLink(node.children);
          if (first) addItem(title, first.url, Boolean(first.external));
        }
        break;
      }
      default:
        break;
    }
  }

  flush();
  return sections;
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
