import { DocsBody } from 'fumadocs-ui/page';
import { AlertTriangle } from 'lucide-react';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/mdx-components';
import { requireUser } from '@/lib/auth/guard';
import { getDoc } from '@/lib/cms/content';
import { getDraft } from '@/lib/cms/drafts';
import { compileDoc } from '@/lib/cms/mdx';
import { getSource } from '@/lib/source';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { splitDoc } from '@/lib/admin/frontmatter';

// 预览必须现编现渲, 任何缓存都会让编辑者看到上一版
export const dynamic = 'force-dynamic';

/**
 * 编辑器右侧 iframe 的内容。
 *
 * 做成独立路由而不是让 server action 返回 JSX: 后者要求预览用到的每个 client component
 * 都在该 action 的 React Client Manifest 里, 而 fumadocs-ui 的 Heading / CodeBlock 只在
 * 站点路由图里注册过, 生产构建下必定报 "Could not find the module ... in the React Client
 * Manifest"。走真实路由还顺带拿到与站点完全一致的排版。
 */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const user = await requireUser();
  const slug = (await params).slug.map(decodeURIComponent).join('/');
  const locale = (await searchParams).locale ?? 'ja';
  // 提示文案跟界面语言走; 正文渲染跟 locale (正在编辑的内容语言) 走, 两者是不同的东西
  const { t } = await getAdminI18n();

  // 草稿优先, 没有草稿就渲染库里已保存的那份
  const source =
    getDraft(user.id, slug, locale)?.content ?? getDoc(slug, locale)?.content;

  if (!source) {
    return (
      <Shell>
        <p className="text-sm text-fd-muted-foreground">{t('preview.noContent')}</p>
      </Shell>
    );
  }

  const { data } = splitDoc(source);

  try {
    const src = await getSource();
    const { body: MDX } = await compileDoc(source, `${slug}.mdx`);
    const page = src.getPage(slug.split('/').filter(Boolean), locale);

    return (
      <Shell>
        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          {typeof data.title === 'string' ? data.title : slug}
        </h1>
        {typeof data.description === 'string' && data.description ? (
          <p className="-mt-4 mb-6 text-fd-muted-foreground">{data.description}</p>
        ) : null}
        <DocsBody>
          <MDX
            components={getMDXComponents(src.getPageTree(locale), {
              ...(page ? { a: createRelativeLink(src, page) } : {}),
            })}
          />
        </DocsBody>
      </Shell>
    );
  } catch (error) {
    return (
      <Shell>
        <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/8 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-red-700 dark:text-red-400">
              {t('preview.renderFailed')}
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-fd-muted-foreground">
              {(error instanceof Error ? error.message : String(error))
                .split('\n')
                .slice(0, 6)
                .join('\n')}
            </pre>
          </div>
        </div>
      </Shell>
    );
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-6 py-8">{children}</div>;
}
