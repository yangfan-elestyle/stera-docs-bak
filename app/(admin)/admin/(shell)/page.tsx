import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  FileWarning,
  Globe2,
  PencilLine,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Badge, Card, EmptyState } from '@/components/admin/ui/primitives';
import { requireUser } from '@/lib/auth/guard';
import { listSlugs } from '@/lib/cms/content';
import { listDrafts } from '@/lib/cms/drafts';
import { i18n } from '@/lib/i18n';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { formatRelative } from '@/lib/admin/text';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminI18n();
  return { title: t('nav.dashboard') };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { locale, t } = await getAdminI18n();
  const docs = listSlugs();
  const drafts = listDrafts(user.id);

  const incomplete = docs.filter((doc) => doc.locales.length !== i18n.languages.length);
  const recent = [...docs].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 8);

  const stats = [
    {
      label: t('dashboard.statDocs'),
      value: docs.length,
      unit: t('dashboard.unitDocs'),
      icon: FileText,
      href: '/admin/content',
    },
    {
      label: t('dashboard.statComplete'),
      value: docs.length - incomplete.length,
      unit: `/ ${docs.length}`,
      icon: Globe2,
      href: '/admin/content',
    },
    {
      label: t('dashboard.statIncomplete'),
      value: incomplete.length,
      unit: t('dashboard.unitDocs'),
      icon: FileWarning,
      href: '/admin/content',
      tone: incomplete.length > 0 ? ('warning' as const) : undefined,
    },
    {
      label: t('dashboard.statDrafts'),
      value: drafts.length,
      unit: t('dashboard.unitDrafts'),
      icon: PencilLine,
      href: '/admin/content',
    },
  ];

  return (
    <>
      <PageHeader
        title={t('dashboard.welcome')}
        description={`${user.email} · ${t(user.role === 'admin' ? 'common.admin' : 'common.editor')}`}
      />

      <div className="space-y-6 px-4 py-5 md:px-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="p-4 transition-colors group-hover:border-fd-primary/40">
                <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
                  <stat.icon className="size-3.5" />
                  {stat.label}
                </div>
                <p className="mt-2 flex items-baseline gap-1">
                  <span
                    className={
                      stat.tone === 'warning'
                        ? 'text-2xl font-semibold text-amber-600 dark:text-amber-400'
                        : 'text-2xl font-semibold'
                    }
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs text-fd-muted-foreground">{stat.unit}</span>
                </p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              {t('dashboard.recent')}
              <Link
                href="/admin/content"
                className="ml-auto flex items-center gap-1 text-xs font-normal text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              >
                {t('dashboard.allContent')}
                <ArrowRight className="size-3" />
              </Link>
            </h2>
            <Card className="divide-y divide-fd-border">
              {recent.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/admin/content/${doc.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-fd-accent/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{doc.title}</span>
                    <span className="block truncate font-mono text-[11px] text-fd-muted-foreground">
                      {doc.slug}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-fd-muted-foreground">
                    {formatRelative(doc.updatedAt, locale)}
                  </span>
                </Link>
              ))}
            </Card>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">{t('dashboard.missingSection')}</h2>
            {incomplete.length === 0 ? (
              <EmptyState
                icon={<Globe2 />}
                title={t('dashboard.allCompleteTitle')}
                description={t('dashboard.allCompleteDesc')}
              />
            ) : (
              <Card className="divide-y divide-fd-border">
                {incomplete.slice(0, 8).map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/admin/content/${doc.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-fd-accent/40"
                  >
                    <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                    <span className="flex shrink-0 gap-1">
                      {i18n.languages
                        .filter((lang) => !doc.locales.includes(lang))
                        .map((lang) => (
                          <Badge key={lang} tone="danger">
                            {t('dashboard.missingBadge', { lang })}
                          </Badge>
                        ))}
                    </span>
                  </Link>
                ))}
              </Card>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
