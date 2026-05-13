import { headers } from 'next/headers';
import { getFilteredTreeByHost } from '@/lib/source';
import { getRequestHost } from '@/lib/tenant';
import Link from 'next/link';

type Props = {
  lang?: string;
};

type SectionItem = {
  title: string;
  url?: string;
  external?: boolean;
};

type Section = {
  title: string;
  description?: string;
  items: SectionItem[];
};

// 动态生成首页 raw 索引数据
function buildSections(lang: string, host: string): Section[] {
  const tree: any = getFilteredTreeByHost(lang, host) as any;
  const children: any[] = tree?.children ?? [];

  const sections: Section[] = [];
  let current: Section | null = null;

  const flush = () => {
    if (current && current.items.length > 0) sections.push(current);
    current = null;
  };

  // 以---分隔符开始新章节
  const startSection = (rawTitle?: string, description?: string) => {
    const title = (rawTitle ?? '').replace(/^---|---$/g, '').trim();
    flush();
    current = { title, description, items: [] };
  };

  // 向章节中添加 item（page）
  const addItem = (title: string, url?: string, external?: boolean) => {
    if (!url || url === '/') return;
    (current ??= { title: '', items: [] }).items.push({
      title,
      url,
      external,
    });
  };

  // 对于 folder，不在递归检索。只取 folder 本身的 link，或其第一个子 link。
  // 当前 api 用于处理 folder 的第一个子节点查找。
  const findFirstLink = (
    nodes?: any[],
  ): { url?: string; name?: string; external?: boolean } | undefined => {
    if (!nodes) return undefined;
    for (const n of nodes) {
      if (!n) continue;
      if (n.type === 'page') return n;
      if (n.type === 'folder' && n.index) return n.index;
    }
    return undefined;
  };

  for (const node of children) {
    if (!node) continue;

    switch (node.type) {
      case 'separator': {
        startSection(
          String(node.name ?? ''),
          node.description ? String(node.description) : undefined,
        );
        break;
      }
      case 'page': {
        addItem(String(node.name ?? ''), node.url, Boolean(node.external));
        break;
      }
      case 'folder': {
        const title = String(node?.name ?? '');
        const indexUrl = node.index?.url as string | undefined;

        if (indexUrl) {
          addItem(title, indexUrl, Boolean(node.index?.external));
        } else {
          const first = findFirstLink(node.children);
          if (first) {
            addItem(title, first.url, Boolean(first.external));
          }
        }
        break;
      }
      default:
        break;
    }
  }

  flush();
  return sections;
}

export default async function EHome({ lang }: Props) {
  const hdrs = await headers();
  const host = getRequestHost(hdrs);
  // 简单归一化：zh* / cn* -> zh；en* -> en；其他 -> ja
  const v = (lang ?? '').trim().toLowerCase();
  const currentLang: 'ja' | 'en' | 'zh' =
    v.startsWith('zh') || v.startsWith('cn')
      ? 'zh'
      : v.startsWith('en')
        ? 'en'
        : 'ja';

  const sections = buildSections(currentLang, host);

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
