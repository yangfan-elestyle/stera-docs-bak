'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AdminTree } from '@/lib/cms/tree';
import { cn } from '@/lib/admin/cn';
import { NewPageDialog } from '../new-page-dialog';
import { ContentTree, type TreeSelection } from './content-tree';

interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

/** 编辑器的语言页签与左树共用同一份状态, 切哪边另一边都跟着走 */
export function useWorkspaceLocale(fallback: string): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  const [local, setLocal] = useState(fallback);
  return ctx ?? { locale: local, setLocale: setLocal };
}

export function ContentWorkspace({
  tree,
  languages,
  defaultLocale,
  navDirs,
  children,
}: {
  tree: AdminTree;
  languages: string[];
  defaultLocale: string;
  navDirs: string[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [locale, setLocaleState] = useState(defaultLocale);

  // 语言记在 URL 上, 刷新与分享链接都还原得回来
  useEffect(() => {
    const fromUrl = params.get('lang');
    if (fromUrl && languages.includes(fromUrl)) setLocaleState(fromUrl);
  }, [params, languages]);

  const setLocale = useCallback(
    (next: string) => {
      setLocaleState(next);
      const search = new URLSearchParams(params.toString());
      if (next === defaultLocale) search.delete('lang');
      else search.set('lang', next);
      const query = search.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [defaultLocale, params, pathname, router],
  );

  const selection = useMemo<TreeSelection | undefined>(() => {
    const nav = params.get('nav');
    if (nav !== null) return { kind: 'nav', key: nav };
    const prefix = '/admin/content/';
    if (pathname.startsWith(prefix)) {
      return {
        kind: 'doc',
        key: decodeURIComponent(pathname.slice(prefix.length)),
      };
    }
    return undefined;
  }, [params, pathname]);

  const go = useCallback(
    (next: TreeSelection) => {
      const suffix = locale === defaultLocale ? '' : `lang=${locale}`;
      if (next.kind === 'doc') {
        router.push(`/admin/content/${next.key}${suffix ? `?${suffix}` : ''}`);
      } else {
        const query = new URLSearchParams({ nav: next.key });
        if (suffix) query.set('lang', locale);
        router.push(`/admin/content?${query.toString()}`);
      }
    },
    [defaultLocale, locale, router],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
        <aside
          className={cn(
            'hidden w-72 shrink-0 border-r border-fd-border bg-fd-card/30 lg:flex lg:flex-col',
          )}
        >
          <ContentTree
            nodes={tree.trees[locale] ?? []}
            locales={tree.locales}
            languages={languages}
            locale={locale}
            onLocaleChange={setLocale}
            selection={selection}
            onSelect={go}
            headerAction={
              <NewPageDialog
                dirs={navDirs}
                locales={languages}
                defaultLocale={defaultLocale}
                compact
              />
            }
          />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </LocaleContext.Provider>
  );
}
