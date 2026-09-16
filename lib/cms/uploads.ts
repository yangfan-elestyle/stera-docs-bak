import { createHash } from 'node:crypto';
import { mkdirSync, existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { DB_PATH } from './db';

// 上传件与 db 放同一块持久卷: public/ 是构建期产物, 运行期写进去会在下次发版时丢光。
export const UPLOAD_DIR = path.join(path.dirname(DB_PATH), 'uploads');

/** 站内引用前缀。MUST 与 app/uploads 路由和 middleware matcher 的排除项保持一致。 */
export const UPLOAD_PREFIX = '/uploads';

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export function contentTypeOf(name: string): string | undefined {
  return TYPES[path.extname(name).slice(1).toLowerCase()];
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface UploadResult {
  url: string;
  name: string;
  bytes: number;
}

/**
 * 按内容哈希命名, 同一张图重复上传不会堆副本, 也让 URL 天然可长缓存。
 * 原始文件名只保留到 alt 文本, 不进路径 —— 日文文件名进 URL 会带来一堆转义问题。
 */
export async function storeUpload(file: File): Promise<UploadResult> {
  const type = contentTypeOf(file.name);
  if (!type) throw new Error('只支持 png / jpg / webp / gif / svg');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('单张图片不能超过 8 MB');

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const ext = path.extname(file.name).toLowerCase();
  const name = `${hash}${ext}`;

  mkdirSync(UPLOAD_DIR, { recursive: true });
  const full = path.join(UPLOAD_DIR, name);
  if (!existsSync(full)) await writeFile(full, buffer);

  return { url: `${UPLOAD_PREFIX}/${name}`, name, bytes: buffer.length };
}

export async function readUpload(
  name: string,
): Promise<{ body: Buffer; type: string } | undefined> {
  // 只认哈希文件名, 挡掉 ../ 之类的路径穿越
  if (!/^[a-f0-9]{16}\.[a-z0-9]+$/.test(name)) return undefined;
  const type = contentTypeOf(name);
  if (!type) return undefined;

  try {
    return { body: await readFile(path.join(UPLOAD_DIR, name)), type };
  } catch {
    return undefined;
  }
}
