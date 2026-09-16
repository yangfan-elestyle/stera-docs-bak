import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/guard';
import { getDoc, listSlugs } from '@/lib/cms/content';
import { i18n } from '@/lib/i18n';
import { saveDocAction } from '../../actions';
import { ActionForm } from '../../ui';

export default async function EditDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  await requireUser();
  const slug = (await params).slug.map(decodeURIComponent).join('/');
  if (!listSlugs().some((entry) => entry.slug === slug)) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-4">
        <h1 className="font-mono text-sm">{slug}</h1>
        <Link href="/admin/content" className="text-sm hover:underline">
          返回列表
        </Link>
      </div>

      {/* 三种语言各自一份独立内容, 各自保存。MUST NOT 做联动翻译或改一处同步多语。 */}
      {i18n.languages.map((locale) => {
        const doc = getDoc(slug, locale);
        return (
          <section key={locale} className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h2 className="font-semibold">{locale}</h2>
              <span className="text-xs text-fd-muted-foreground">
                {doc
                  ? `最后修改 ${doc.updatedAt.toISOString().slice(0, 16).replace('T', ' ')}`
                  : '尚无此语言版本, 前台会回退到默认语言'}
              </span>
            </div>
            <ActionForm action={saveDocAction} submitLabel={`保存 ${locale}`}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="locale" value={locale} />
              <textarea
                name="content"
                defaultValue={doc?.content ?? ''}
                rows={20}
                spellCheck={false}
                className="w-full rounded border border-fd-border bg-fd-card p-3 font-mono text-xs"
              />
            </ActionForm>
          </section>
        );
      })}
    </div>
  );
}
