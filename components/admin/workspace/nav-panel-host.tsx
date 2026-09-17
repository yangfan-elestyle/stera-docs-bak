'use client';

import { useT } from '../i18n';
import { NavPanel } from '../nav-editor/nav-editor';
import { useWorkspaceLocale } from './workspace';

/** 导航面板跟着工作区语言走, 与左树显示的那一套保持一致 */
export function NavPanelHost({
  dir,
  json,
  defaultLocale,
}: {
  dir: string;
  /** locale -> meta JSON */
  json: Record<string, string>;
  defaultLocale: string;
}) {
  const t = useT();
  const { locale } = useWorkspaceLocale(defaultLocale);
  const current = json[locale];

  if (!current) {
    return (
      <p className="p-6 text-sm text-fd-muted-foreground">
        {t('content.navMissing', { locale })}
      </p>
    );
  }

  return (
    <NavPanel
      key={`${dir}:${locale}`}
      dir={dir}
      locale={locale}
      json={current}
    />
  );
}
