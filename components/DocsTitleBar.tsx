import Link from 'next/link';
import { ExternalLink, type LucideIcon } from 'lucide-react';
import { headers } from 'next/headers';
import { DocsTitle } from 'fumadocs-ui/page';
import { getRequestHost } from '@/lib/tenant';
import { getTextValue } from '@/lib/tenant-config';
import {
  MarkdownCopyButton,
  ViewOptionsPopover,
} from '@/components/ai/page-actions';

export type DocsTitleAction = {
  text: string | { tenantTextKey: string };
  href: string;
  icon?: LucideIcon;
};

export const DOCS_TITLE_ACTIONS: Record<string, DocsTitleAction[]> = {
  '/': [{ text: 'API Reference', href: '/openapi' }],
  '/openapi': [{ text: { tenantTextKey: 'home_sidebar_title' }, href: '/' }],
};

const ACTION_BUTTON_CLASS =
  'inline-flex shrink-0 items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-1.5 text-sm font-medium text-fd-foreground no-underline shadow-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground';

function resolveActionText(
  text: DocsTitleAction['text'],
  host: string,
): string {
  if (typeof text === 'string') return text;
  return getTextValue(text.tenantTextKey, host) ?? '';
}

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
  const hdrs = await headers();
  const host = getRequestHost(hdrs);

  return (
    <div className="flex items-center justify-between gap-4">
      <DocsTitle>{title}</DocsTitle>
      <div className="flex shrink-0 items-center gap-2">
        {actions?.map((action) => {
          const text = resolveActionText(action.text, host);
          if (!text) return null;
          const Icon = action.icon ?? ExternalLink;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={ACTION_BUTTON_CLASS}
            >
              <Icon className="size-4" />
              {text}
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
