import { buildNavSections } from '@/lib/nav-sections';
import type { Root } from 'fumadocs-core/page-tree';
import Link from 'next/link';

type Props = {
  // 当前 tab 的根页面 url（'/' 或 '/openapi'）: 作为取章节的范围锚点, 自身不计入列表.
  // 必填: 漏传会拉错 tab 的章节, 让 TS 在编译期拦截.
  root: string;
  // 由 mdx-components 在渲染期绑定注入, mdx 作者不写这个属性.
  // MUST NOT 改成组件内 `import { source }`: 那是在渲染期反过来引用正在渲染它的 loader.
  pageTree?: Root;
};

export default function EHome({ root, pageTree }: Props) {
  const sections = pageTree ? buildNavSections(pageTree, root) : [];

  return (
    <div className="not-prose mx-auto w-full max-w-5xl text-[15px] leading-6">
      <div className="mt-8 space-y-12">
        {sections.map((section, idx) => (
          <section key={section.title || idx}>
            {section.title ? (
              <div className="mb-6 flex items-center gap-4">
                <h2 className="text-sm font-semibold text-fd-muted-foreground">
                  {section.title}
                </h2>
                <div className="h-px flex-1 bg-fd-muted-foreground/15" />
              </div>
            ) : null}

            {section.title && section.description ? (
              <p className="-mt-3 mb-6 text-sm text-fd-muted-foreground">
                {section.description}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <Link
                  key={(item.url ?? item.title) as string}
                  href={item.url ?? '#'}
                  prefetch={item.external ? false : undefined}
                  className="group block no-underline hover:no-underline"
                >
                  <div className="font-semibold text-slate-700 group-hover:text-slate-900 group-hover:underline underline-offset-2 dark:text-slate-200 dark:group-hover:text-white">
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
