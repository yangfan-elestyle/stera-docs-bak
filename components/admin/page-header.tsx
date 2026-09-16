import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/admin/cn';

export function PageHeader({
  breadcrumbs,
  title,
  description,
  actions,
  className,
  sticky,
}: {
  breadcrumbs?: { label: string; href?: string }[];
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}) {
  return (
    <div
      className={cn(
        'border-b border-fd-border bg-fd-background px-4 py-4 md:px-6',
        sticky && 'sticky top-14 z-20',
        className,
      )}
    >
      {breadcrumbs?.length ? (
        <nav className="mb-1 flex items-center gap-1 text-xs text-fd-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span
              key={`${crumb.label}-${i}`}
              className="flex items-center gap-1"
            >
              {i > 0 ? <ChevronRight className="size-3" /> : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-fd-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-sm text-fd-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
