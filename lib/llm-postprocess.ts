import { loadErrorCodes } from '@/components/ErrorCodeTable';
import {
  renderPlaceholder,
  type PlaceholderData,
} from 'fumadocs-core/mdx-plugins/remark-llms.runtime';
import { getFilteredTreeByHost } from './source';
import { detectTenantByHost, getRequestOrigin } from './tenant';
import { getImageAsset, getTextValue } from './tenant-config';
import { buildNavSections } from './nav-sections';
import { renderAPIPageMarkdown } from './openapi-llm';
import {
  getPageUrl,
  getPublicDocsPathFromStaticImage,
  toAbsoluteUrl,
} from './url';

type HomeLang = 'ja' | 'en' | 'zh';
type PlaceholderAttrs = PlaceholderData['attributes'];

const MARKDOWN_RESOURCE_RE =
  /(!?\[[^\]\n]*\]\()([^)\s]+)((?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?)(\))/g;
const MDX_COMMENT_RE = /\{\/\*[\s\S]*?\*\/\}/g;
const FENCE_RE =
  /^[ \t]{0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]{0,3}\1[ \t]*$/gm;
const BLANK_LINES_RE = /(?:^[ \t]*\r?\n){2,}/gm;
const HTML_ENTITY_RE = /&(quot|apos|amp|#x[0-9a-f]+|#\d+);/gi;
let errorCodesPromise: ReturnType<typeof loadErrorCodes> | undefined;

export async function resolveLLMTags(
  markdown: string,
  host: string,
  pageUrl?: string,
): Promise<string> {
  const origin = getRequestOrigin(host);
  const rendered = await renderPlaceholder(markdown, {
    EText({ attributes }) {
      const name = attrString(attributes, 'name');
      return name ? getTextValue(name, host) ?? '' : '';
    },

    EImg({ attributes }) {
      const src = attrString(attributes, 'src');
      if (!src) return '';
      const asset = getImageAsset(src, host);
      if (!asset) return '';
      const href = toAbsoluteUrl(
        getPublicDocsPathFromStaticImage(asset.src) ?? asset.src,
        origin,
        pageUrl,
      );
      return `![${attrString(attributes, 'alt') ?? ''}](${href})`;
    },

    EHome({ attributes }) {
      const rawLang = (attrString(attributes, 'lang') ?? '').toLowerCase();
      const lang: HomeLang = rawLang.startsWith('zh')
        ? 'zh'
        : rawLang.startsWith('en')
        ? 'en'
        : 'ja';
      const root = attrString(attributes, 'root') ?? '/';
      return buildNavSections(getFilteredTreeByHost(lang, host), root)
        .map((section) =>
          [
            section.title && `## ${section.title}`,
            section.description,
            section.items
              .map((item) => `- [${item.title}](${item.url})`)
              .join('\n'),
          ]
            .filter(Boolean)
            .join('\n\n'),
        )
        .join('\n\n');
    },

    EContainer({ attributes, children }) {
      const tenant = detectTenantByHost(host).toLowerCase();
      const allow = (attrString(attributes, 'tenant') ?? '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      return allow.length === 0 || allow.includes(tenant) ? children : '';
    },

    Callout({ attributes, children }) {
      const title =
        attrString(attributes, 'title') ?? attrString(attributes, 'type');
      return [title && `**${title}**`, children.trim()]
        .filter(Boolean)
        .join('\n\n');
    },

    async ErrorCodeTable() {
      errorCodesPromise ??= loadErrorCodes();
      return codeBlock('json', await errorCodesPromise);
    },

    async APIPage({ attributes }) {
      return renderAPIPageMarkdown(
        attributes,
        pageUrl ? getPageUrl(pageUrl, origin) : undefined,
      );
    },

    EMermaid({ attributes, children }) {
      const chart = (attrString(attributes, 'chart') ?? children)
        .trim()
        .replace(/^`|`$/g, '')
        .trim();
      return chart ? codeBlock('text', chart) : '';
    },
  });

  return normalizeMarkdown(rendered, origin, pageUrl);
}

function codeBlock(lang: string, value: unknown): string {
  return `\`\`\`${lang}\n${
    typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  }\n\`\`\``;
}

function attrString(
  attributes: PlaceholderAttrs,
  name: string,
): string | undefined {
  const value = attrValue(attributes, name);
  if (typeof value !== 'string') return undefined;
  const trimmed = decodeHtmlEntities(value).trim();
  if (!trimmed) return '';
  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === 'string' ? parsed : trimmed;
  } catch {
    return trimmed;
  }
}

function attrValue(attributes: PlaceholderAttrs, name: string): unknown {
  const raw = attributes[name];
  return raw && typeof raw === 'object' && 'value' in raw
    ? (raw as { value?: unknown }).value
    : raw;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(HTML_ENTITY_RE, (_entity, body: string) => {
    const key = body.toLowerCase();
    if (key === 'quot') return '"';
    if (key === 'apos') return "'";
    if (key === 'amp') return '&';
    return String.fromCodePoint(
      parseInt(
        key.slice(key.startsWith('#x') ? 2 : 1),
        key.startsWith('#x') ? 16 : 10,
      ),
    );
  });
}

function normalizeMarkdown(
  markdown: string,
  origin?: string,
  pageUrl?: string,
): string {
  const segments = splitByFence(markdown);
  for (let i = 0; i < segments.length; i += 2) {
    segments[i] = normalizeMarkdownProse(segments[i], origin, pageUrl);
  }
  return segments.join('');
}

function normalizeMarkdownProse(
  markdown: string,
  origin?: string,
  pageUrl?: string,
): string {
  return decodeHtmlEntities(markdown)
    .replace(MDX_COMMENT_RE, '')
    .replace(
      MARKDOWN_RESOURCE_RE,
      (
        match,
        prefix: string,
        rawUrl: string,
        title: string,
        suffix: string,
      ) => {
        const url = toAbsoluteUrl(rawUrl, origin, pageUrl);
        return url === rawUrl ? match : `${prefix}${url}${title}${suffix}`;
      },
    )
    .replace(BLANK_LINES_RE, '\n');
}

function splitByFence(input: string): string[] {
  const out: string[] = [];
  let last = 0;
  for (const match of input.matchAll(FENCE_RE)) {
    const start = match.index ?? 0;
    out.push(input.slice(last, start), match[0]);
    last = start + match[0].length;
  }
  out.push(input.slice(last));
  return out;
}
