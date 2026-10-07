import type { Metadata } from 'next';
import { BookText } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ActionForm } from '@/components/admin/action-form';
import { LocaleSwitcher } from '@/components/admin/locale-switcher';
import { Field, Input } from '@/components/admin/ui/field';
import { login } from '@/lib/admin/actions/auth';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { currentUser } from '@/lib/auth/guard';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminI18n();
  return { title: t('meta.login') };
}

export default async function LoginPage() {
  if (await currentUser()) redirect('/admin');
  const { t } = await getAdminI18n();

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-12">
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
              {t('login.subtitle')}
            </p>
          </div>
        </div>

        <ActionForm action={login} submitLabel={t('login.submit')} submitFull>
          <Field label={t('common.email')} required>
            <Input name="email" type="email" required autoComplete="username" placeholder="name@example.com" />
          </Field>
          <Field label={t('common.password')} required>
            <Input name="password" type="password" required autoComplete="current-password" />
          </Field>
        </ActionForm>
      </div>
    </div>
  );
}
