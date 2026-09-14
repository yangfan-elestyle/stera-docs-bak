import Link from 'next/link';
import { ExternalLink, type LucideIcon } from 'lucide-react';
import { DocsTitle } from 'fumadocs-ui/page';
import { SITE } from '@/lib/site';
import {
  MarkdownCopyButton,
  ViewOptionsPopover,
} from '@/components/ai/page-actions';

export type DocsTitleAction = {
  text: string;
  href: string;
  icon?: LucideIcon;
};

export const DOCS_TITLE_ACTIONS: Record<string, DocsTitleAction[]> = {
  '/': [{ text: 'API Reference', href: '/openapi' }],
  '/openapi': [{ text: SITE.docsTitle, href: '/' }],
};

const ACTION_BUTTON_CLASS =
  'inline-flex shrink-0 items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-1.5 text-sm font-medium text-fd-foreground no-underline shadow-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground';

export default async function DocsTitleBar({
  title,
  pageUrl,
  markdownUrl,
}: {
  title: string;
  pageUrl: string;
  markdownUrl?: string;
}) {
  const actions = DOCS_TITLE_ACTIONS[pageUrl];

  return (
    <div className="flex items-center justify-between gap-4">
      <DocsTitle>{title}</DocsTitle>
      <div className="flex shrink-0 items-center gap-2">
        {actions?.map((action) => {
          const Icon = action.icon ?? ExternalLink;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={ACTION_BUTTON_CLASS}
            >
              <Icon className="size-4" />
              {action.text}
            </Link>
          );
        })}
        {markdownUrl && (
          <>
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover markdownUrl={markdownUrl} />
          </>
        )}
      </div>
    </div>
  );
}
