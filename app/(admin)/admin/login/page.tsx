import type { Metadata } from 'next';
import { BookText, Info } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ActionForm } from '@/components/admin/action-form';
import { LocaleSwitcher } from '@/components/admin/locale-switcher';
import { Field, Input } from '@/components/admin/ui/field';
import { login } from '@/lib/admin/actions/auth';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { currentUser } from '@/lib/auth/guard';
import { countUsers } from '@/lib/auth/users';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminI18n();
  return { title: t('meta.login') };
}

export default async function LoginPage() {
  if (await currentUser()) redirect('/admin');
  const initialized = countUsers() > 0;
  const { t } = await getAdminI18n();

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      {/* 这一页在 (shell) 之外, 语言开关只能挂在这里; 少了它非日语母语者没有自救入口 */}
      <div className="absolute right-4 top-4">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid size-11 place-items-center rounded-xl bg-fd-primary text-fd-primary-foreground shadow-sm">
            <BookText className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{t('login.heading')}</h1>
            <p className="mt-0.5 text-sm text-fd-muted-foreground">
              {t(initialized ? 'login.subtitle' : 'login.subtitleUninitialized')}
            </p>
          </div>
        </div>

        {initialized ? (
          <ActionForm action={login} submitLabel={t('login.submit')} submitFull>
            <Field label={t('common.email')} required>
              <Input name="email" type="email" required autoComplete="username" placeholder="name@example.com" />
            </Field>
            <Field label={t('common.password')} required>
              <Input name="password" type="password" required autoComplete="current-password" />
            </Field>
          </ActionForm>
        ) : (
          // MUST NOT 在这里给「就地创建管理员」的入口: 能编辑内容等于能在服务端执行代码,
          // 那种页面就是留一个谁都能抢注的窗口。
          <div className="flex gap-3 rounded-xl border border-fd-border bg-fd-card p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground" />
            <p className="text-fd-muted-foreground">
              {t('login.uninitBefore')}
              <code className="rounded bg-fd-muted px-1 font-mono text-xs">ADMIN_EMAIL</code>
              {t('login.uninitMiddle')}
              <code className="rounded bg-fd-muted px-1 font-mono text-xs">ADMIN_PASSWORD</code>
              {t('login.uninitAfter')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
