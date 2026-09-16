import { parse as parseYaml } from 'yaml';

// MUST NOT 从 @fumadocs/mdx-remote 取 parseFrontmatter: 那个入口会把整条 MDX 编译链
// (含 node:url) 拖进客户端 bundle, 编辑器一用就构建失败。这里只需要 YAML 前置块。
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export interface DocParts {
  /** 原样的 frontmatter 块, 含首尾 `---` 与末尾换行; 无 frontmatter 时为空串 */
  matter: string;
  /** 正文 (frontmatter 之后的全部内容) */
  body: string;
  /** 解析出的 frontmatter 对象 */
  data: Record<string, unknown>;
}

export function splitDoc(source: string): DocParts {
  const match = FRONTMATTER_RE.exec(source);
  if (!match) return { matter: '', body: source, data: {} };

  let data: Record<string, unknown> = {};
  try {
    data = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;
  } catch {
    // 编辑中途的 YAML 可能处于半成品状态, 解析失败就当没有字段, 别让编辑器崩掉
    data = {};
  }
  return { matter: match[0], body: source.slice(match[0].length), data };
}

export function joinDoc(matter: string, body: string): string {
  return `${matter}${body}`;
}

/**
 * 逐键改写 frontmatter, 而不是「解析成对象再整体序列化」。
 *
 * 整体序列化会把没进表单的键、键序、注释、原有引号风格一并抹掉 —— 表单只认识
 * title / description / tocMaxDepth / redirect / full / icon 六个键, 而 schema 还允许
 * `_openapi`, 未来也可能再加。只动被改的那一行, 其余原样留着, 不改就是零字节差异。
 */
export function setFrontmatterValue(
  matter: string,
  key: string,
  value: string | number | boolean | undefined,
): string {
  const hasMatter = matter.startsWith('---');
  if (!hasMatter) {
    if (value === undefined || value === '') return matter;
    return `---\n${key}: ${encodeYamlValue(value)}\n---\n\n${matter}`;
  }

  const lines = matter.split('\n');
  // 第 0 行是开头的 `---`, 找到闭合的 `---`
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (end === -1) return matter;

  const keyRe = new RegExp(`^\\s*${escapeRegExp(key)}\\s*:`);
  const at = lines.findIndex((line, i) => i > 0 && i < end && keyRe.test(line));

  if (value === undefined || value === '') {
    if (at === -1) return matter;
    lines.splice(at, 1);
    return lines.join('\n');
  }

  const serialized = `${key}: ${encodeYamlValue(value)}`;
  if (at === -1) lines.splice(end, 0, serialized);
  else lines[at] = serialized;
  return lines.join('\n');
}

// 字符串一律走 JSON 双引号 (合法的 YAML double-quoted scalar): 标题里可能有
// 冒号 / 井号 / 前导空格, 裸写会让 YAML 解析出完全不同的结构。
function encodeYamlValue(value: string | number | boolean): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
