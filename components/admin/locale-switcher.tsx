'use client';

import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ADMIN_LOCALES, ADMIN_LOCALE_NAMES } from '@/lib/admin/i18n/shared';
import { setAdminLocaleAction } from '@/lib/admin/actions/locale';
import { useAdminI18n } from './i18n';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/primitives';

/**
 * 后台界面语言开关。登录页也挂它 —— 那一页在 (shell) 之外, 没有任何已保存偏好,
 * 英语母语者第一眼撞上日文时这是唯一能自救的入口。
 */
export function LocaleSwitcher() {
  const { locale, t } = useAdminI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('locale.label')}
          disabled={pending}
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ADMIN_LOCALES.map((item) => (
          <DropdownMenuItem
            key={item}
            onSelect={() =>
              startTransition(async () => {
                await setAdminLocaleAction(item);
                // cookie 是服务端读的, 必须让 RSC 重新渲染整棵树
                router.refresh();
              })
            }
          >
            {ADMIN_LOCALE_NAMES[item]}
            {item === locale ? (
              <span className="ml-auto text-xs text-fd-muted-foreground">✓</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
