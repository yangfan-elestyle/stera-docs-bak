'use server';

import { requireWriter } from '@/lib/auth/guard';
import { compileDoc } from '@/lib/cms/mdx';
import {
  StaleWriteError,
  createPage,
  deleteDoc,
  deletePage,
  saveDoc,
  validateDocSource,
} from '@/lib/cms/content';
import { clearDraft, saveDraft } from '@/lib/cms/drafts';
import { revalidateContent } from '@/lib/cms/revalidate';
import { getAdminT } from '@/lib/admin/i18n/server';

export type SaveResult =
  | { ok: true; updatedAt: number }
  | { ok: false; error: string; conflictAt?: number };

export async function saveDocAction(input: {
  slug: string;
  locale: string;
  content: string;
  expectedUpdatedAt?: number;
}): Promise<SaveResult> {
  const user = await requireWriter();
  const t = await getAdminT();

  // 唯一的拦截点: 读取侧只会跳过坏行, 靠它兜底等于坏内容先落库再整页消失
  const invalid = validateDocSource(input.content);
  if (invalid) {
    return { ok: false, error: t('error.invalidFrontmatter', { detail: invalid }) };
  }

  try {
    const updatedAt = saveDoc(
      input.slug,
      input.locale,
      input.content,
      input.expectedUpdatedAt,
    );
    clearDraft(user.id, input.slug, input.locale);
    revalidateContent();
    return { ok: true, updatedAt: updatedAt.getTime() };
  } catch (error) {
    if (error instanceof StaleWriteError) {
      return {
        ok: false,
        error: t('error.conflict'),
        conflictAt: error.current.getTime(),
      };
    }
    return { ok: false, error: (error as Error).message };
  }
}

export async function deleteLocaleAction(input: {
  slug: string;
  locale: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireWriter();
  deleteDoc(input.slug, input.locale);
  clearDraft(user.id, input.slug, input.locale);
  revalidateContent();
  return { ok: true };
}

export type StageResult =
  | { ok: true; version: number; headings: number }
  | { ok: false; error: string };

/**
 * 把草稿落库并试编译, 供预览 iframe 读取。
 *
 * 预览做成独立路由而不是「server action 返回 JSX」: 后者要求预览里用到的每个
 * client component 都在该 action 的 React Client Manifest 里, 而 fumadocs-ui 的
 * Heading / CodeBlock 只在站点路由图里注册过, 生产构建下必定报
 * "Could not find the module ... in the React Client Manifest"。
 *
 * 预览会在服务端执行草稿里的 MDX。这没有扩大权限面 (能写库本来就等于能执行代码),
 * 但把执行时机从「保存时」提前到了「编辑时」, 所以 MUST 保留登录校验。
 */
export async function stageDraftAction(input: {
  slug: string;
  locale: string;
  content: string;
}): Promise<StageResult> {
  const user = await requireWriter();

  const invalid = validateDocSource(input.content);
  if (invalid) {
    const t = await getAdminT();
    return { ok: false, error: t('error.invalidFrontmatter', { detail: invalid }) };
  }

  try {
    const { toc } = await compileDoc(input.content, `${input.slug}.mdx`);
    saveDraft(user.id, input.slug, input.locale, input.content);
    return { ok: true, version: Date.now(), headings: toc.length };
  } catch (error) {
    // MDX 报错带一长串栈, 编辑者看不懂; 只留前几行
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message.split('\n').slice(0, 4).join('\n') };
  }
}

export async function discardDraftAction(input: {
  slug: string;
  locale: string;
}): Promise<void> {
  const user = await requireWriter();
  clearDraft(user.id, input.slug, input.locale);
}

export async function createPageAction(input: {
  slug: string;
  title: string;
  locales: string[];
}): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await requireWriter();
  const t = await getAdminT();
  if (!input.title.trim()) return { ok: false, error: t('error.titleRequired') };
  if (input.locales.length === 0) {
    return { ok: false, error: t('error.localeRequired') };
  }

  try {
    createPage({ ...input, title: input.title.trim() });
    revalidateContent();
    return { ok: true, slug: input.slug };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function deletePageAction(input: {
  slug: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireWriter();
  try {
    deletePage(input.slug);
    revalidateContent();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
