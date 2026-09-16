import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Code2 } from 'lucide-react';
import { buildNavSections, type NavSection } from '@/lib/nav-sections';
import { landingCopy } from '@/lib/landing';
import { SITE } from '@/lib/site';
import { getSource } from '@/lib/source';

export const revalidate = false;

export async function generateMetadata(
  props: PageProps<'/[lang]'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  const copy = landingCopy(lang);
  return { title: copy.title, description: copy.lead[0] };
}

export default async function LandingPage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  const copy = landingCopy(lang);

  // 栏目直接取真实导航树: 编辑在后台调分组或排序, 首页跟着变, 不需要再维护一份副本
  const tree = (await getSource()).getPageTree(lang);
  const docsSections = buildNavSections(tree, '/overview').filter(
    (section) => section.title,
  );
  const apiSections = buildNavSections(tree, '/openapi').filter(
    (section) => section.title,
  );

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-fd-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-5xl">
            {copy.title}
          </h1>
          <div className="mt-6 max-w-2xl space-y-3">
            {copy.lead.map((line) => (
              <p key={line} className="text-pretty leading-relaxed text-fd-muted-foreground">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={copy.primary.href}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
            >
              <BookOpen className="size-4" />
              {copy.primary.text}
            </Link>
            <Link
              href={copy.secondary.href}
              className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <Code2 className="size-4" />
              {copy.secondary.text}
            </Link>
          </div>
        </div>
      </section>

      <SectionGroup
        heading={copy.docsHeading}
        sections={docsSections}
        more={copy.more}
        moreHref="/overview"
      />
      {apiSections.length > 0 ? (
        <SectionGroup
          heading={copy.apiHeading}
          sections={apiSections}
          more={copy.more}
          moreHref="/openapi"
          className="border-t border-fd-border bg-fd-card/30"
        />
      ) : null}
    </main>
  );
}

const MAX_LINKS = 5;

function SectionGroup({
  heading,
  sections,
  more,
  moreHref,
  className,
}: {
  heading: string;
  sections: NavSection[];
  more: string;
  moreHref: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground">
          {heading}
        </h2>
        <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const items = section.items.slice(0, MAX_LINKS);
            const rest = section.items.length - items.length;
            return (
              <div key={section.title}>
                <h3 className="border-b border-fd-border pb-2 text-base font-semibold">
                  {section.title}
                </h3>
                {section.description ? (
                  <p className="mt-2 text-xs leading-relaxed text-fd-muted-foreground">
                    {section.description}
                  </p>
                ) : null}
                <ul className="mt-3 space-y-1">
                  {items.map((item) => (
                    <li key={item.url ?? item.title}>
                      <Link
                        href={item.url ?? '#'}
                        target={item.external ? '_blank' : undefined}
                        className="block rounded-md py-1 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* 只在真的还有条目没列出来时才显示, 否则「查看全部」是句空话 */}
                {rest > 0 ? (
                  <Link
                    href={moreHref}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                  >
                    {more}
                    <ArrowRight className="size-3" />
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
