import type { PlaceholderData } from 'fumadocs-core/mdx-plugins/remark-llms.runtime';

type PlaceholderAttrs = PlaceholderData['attributes'];
type HttpMethod =
  | 'delete'
  | 'get'
  | 'head'
  | 'options'
  | 'patch'
  | 'post'
  | 'put'
  | 'trace';
type JsonObject = Record<string, any>;
type APIOperation = {
  path: string;
  method: HttpMethod;
};
type OpenAPIDocument = JsonObject & {
  components?: JsonObject;
  paths?: Record<string, JsonObject>;
  security?: unknown[];
  tags?: Array<{ name?: string }>;
};

const OPENAPI_DEFAULT_DOCUMENT = './openapi.en.yaml';
const HTTP_METHODS = new Set<HttpMethod>([
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
]);
const openAPIDocumentPromises = new Map<string, Promise<OpenAPIDocument>>();

export async function renderAPIPageMarkdown(
  attributes: PlaceholderAttrs,
  pageHref?: string,
): Promise<string> {
  const document =
    attrString(attributes, 'document') ?? OPENAPI_DEFAULT_DOCUMENT;
  const operations = attrOperations(attributes, 'operations');
  const endpointLines = operations.map(
    ({ method, path }) => `**Endpoint**: ${method.toUpperCase()} ${path}`,
  );
  const spec = await loadOpenAPIDocument(document);
  const endpointSpec = buildEndpointSpec(spec, operations);

  return [
    pageHref && `**Page URL**: ${pageHref}`,
    ...endpointLines,
    endpointSpec
      ? codeBlock('json', endpointSpec)
      : '**OpenAPI operation**: not found',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function codeBlock(lang: string, value: unknown): string {
  return `\`\`\`${lang}\n${
    typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  }\n\`\`\``;
}

async function loadOpenAPIDocument(document: string): Promise<OpenAPIDocument> {
  const key = Object.prototype.hasOwnProperty.call(
    OPENAPI_DOCUMENT_LOADERS,
    document,
  )
    ? document
    : OPENAPI_DEFAULT_DOCUMENT;
  let promise = openAPIDocumentPromises.get(key);
  if (!promise) {
    promise = OPENAPI_DOCUMENT_LOADERS[key]();
    openAPIDocumentPromises.set(key, promise);
  }
  return promise;
}

const OPENAPI_DOCUMENT_LOADERS: Record<
  string,
  () => Promise<OpenAPIDocument>
> = {
  './openapi.yaml': async () =>
    (await import('@/data/openapi/openapi.json')).default as OpenAPIDocument,
  './openapi.en.yaml': async () =>
    (await import('@/data/openapi/openapi.en.json')).default as OpenAPIDocument,
  './openapi.zh.yaml': async () =>
    (await import('@/data/openapi/openapi.zh.json')).default as OpenAPIDocument,
};

function buildEndpointSpec(
  spec: OpenAPIDocument,
  operations: APIOperation[],
): OpenAPIDocument | undefined {
  const paths: Record<string, JsonObject> = {};
  const selectedOperations: JsonObject[] = [];

  for (const { path, method } of operations) {
    const pathItem = spec.paths?.[path];
    const operation = pathItem?.[method];
    if (!pathItem || !operation) continue;

    const targetPathItem = (paths[path] ??= pickPathItemFields(pathItem));
    targetPathItem[method] = operation;
    selectedOperations.push(operation);
  }

  if (Object.keys(paths).length === 0) return undefined;

  const out: OpenAPIDocument = { openapi: spec.openapi };
  if (spec.info) out.info = spec.info;
  if (spec.servers) out.servers = spec.servers;
  if (usesGlobalSecurity(spec, selectedOperations) && spec.security) {
    out.security = spec.security;
  }
  const tags = pickUsedTags(spec, selectedOperations);
  if (tags.length > 0) out.tags = tags;
  out.paths = paths;

  copyReferencedComponents(spec, out, paths);
  copySecuritySchemes(spec, out, selectedOperations);

  return out;
}

function pickPathItemFields(pathItem: JsonObject): JsonObject {
  return Object.fromEntries(
    Object.entries(pathItem).filter(
      ([key]) => !HTTP_METHODS.has(key as HttpMethod),
    ),
  );
}

function pickUsedTags(
  spec: OpenAPIDocument,
  operations: JsonObject[],
): Array<{ name?: string }> {
  if (!Array.isArray(spec.tags)) return [];

  const used = new Set(
    operations.flatMap((operation) =>
      Array.isArray(operation.tags) ? operation.tags : [],
    ),
  );
  return spec.tags.filter((tag) => tag.name && used.has(tag.name));
}

function usesGlobalSecurity(
  spec: OpenAPIDocument,
  operations: JsonObject[],
): boolean {
  return Boolean(
    spec.security &&
      operations.some(
        (operation) =>
          !Object.prototype.hasOwnProperty.call(operation, 'security'),
      ),
  );
}

function copyReferencedComponents(
  spec: OpenAPIDocument,
  out: OpenAPIDocument,
  root: unknown,
) {
  const queue = [...collectLocalComponentRefs(root)];
  const seen = new Set<string>();

  for (let i = 0; i < queue.length; i++) {
    const ref = queue[i];
    if (seen.has(ref)) continue;
    seen.add(ref);

    const value = getJsonPointer(spec, ref);
    if (value === undefined) continue;

    setJsonPointer(out, ref, value);
    for (const next of collectLocalComponentRefs(value)) {
      if (!seen.has(next)) queue.push(next);
    }
  }
}

function copySecuritySchemes(
  spec: OpenAPIDocument,
  out: OpenAPIDocument,
  operations: JsonObject[],
) {
  for (const name of collectSecuritySchemeNames(spec, operations)) {
    const scheme = spec.components?.securitySchemes?.[name];
    if (scheme) {
      setJsonPointer(
        out,
        `#/components/securitySchemes/${escapePointer(name)}`,
        scheme,
      );
    }
  }
}

function collectSecuritySchemeNames(
  spec: OpenAPIDocument,
  operations: JsonObject[],
): Set<string> {
  const names = new Set<string>();

  for (const operation of operations) {
    const security = Object.prototype.hasOwnProperty.call(operation, 'security')
      ? operation.security
      : spec.security;

    if (!Array.isArray(security)) continue;
    for (const requirement of security) {
      if (!requirement || typeof requirement !== 'object') continue;
      for (const key of Object.keys(requirement)) names.add(key);
    }
  }

  return names;
}

function collectLocalComponentRefs(value: unknown, out = new Set<string>()) {
  if (!value || typeof value !== 'object') return out;

  if (!Array.isArray(value) && typeof (value as JsonObject).$ref === 'string') {
    const ref = (value as JsonObject).$ref;
    if (ref.startsWith('#/components/')) out.add(ref);
  }

  for (const child of Array.isArray(value)
    ? value
    : Object.values(value as JsonObject)) {
    collectLocalComponentRefs(child, out);
  }

  return out;
}

function getJsonPointer(root: unknown, pointer: string): unknown {
  return decodePointer(pointer).reduce(
    (current, segment) =>
      current && typeof current === 'object'
        ? (current as JsonObject)[segment]
        : undefined,
    root,
  );
}

function setJsonPointer(root: JsonObject, pointer: string, value: unknown) {
  const parts = decodePointer(pointer);
  let current = root;

  for (const part of parts.slice(0, -1)) {
    current = (current[part] ??= {});
  }
  current[parts.at(-1)!] = value;
}

function decodePointer(pointer: string): string[] {
  return pointer
    .slice(2)
    .split('/')
    .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function escapePointer(value: string): string {
  return value.replace(/~/g, '~0').replace(/\//g, '~1');
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

function attrOperations(
  attributes: PlaceholderAttrs,
  name: string,
): APIOperation[] {
  const value = attrValue(attributes, name);
  const parsed =
    typeof value === 'string' ? parseJSON(decodeHtmlEntities(value)) : value;

  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const path = (item as JsonObject).path;
    const method = String((item as JsonObject).method ?? '').toLowerCase();
    return typeof path === 'string' && HTTP_METHODS.has(method as HttpMethod)
      ? [{ path, method: method as HttpMethod }]
      : [];
  });
}

function attrValue(attributes: PlaceholderAttrs, name: string): unknown {
  const raw = attributes[name];
  return raw && typeof raw === 'object' && 'value' in raw
    ? (raw as { value?: unknown }).value
    : raw;
}

function parseJSON(value: string): unknown {
  try {
    return JSON.parse(value.trim());
  } catch {
    return undefined;
  }
}

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(quot|apos|amp|#x[0-9a-f]+|#\d+);/gi,
    (_entity, body: string) => {
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
    },
  );
}
