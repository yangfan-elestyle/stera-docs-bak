import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { ActionForm } from '@/components/admin/action-form';
import { PageHeader } from '@/components/admin/page-header';
import { Field, Input } from '@/components/admin/ui/field';
import { Badge, Card } from '@/components/admin/ui/primitives';
import { changePassword } from '@/lib/admin/actions/auth';
import { currentUser } from '@/lib/auth/guard';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { formatDateTime } from '@/lib/admin/text';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminI18n();
  return { title: t('account.title') };
}

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  const { t } = await getAdminI18n();

  return (
    <>
      <PageHeader title={t('account.title')} />
      <div className="max-w-2xl space-y-5 px-4 py-5 md:px-6">
        <Card className="p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-fd-muted-foreground">{t('common.email')}</dt>
              <dd className="mt-0.5 text-sm">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">{t('common.role')}</dt>
              <dd className="mt-0.5 text-sm">
                {t(user.role === 'admin' ? 'account.roleAdmin' : 'account.roleEditor')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">{t('common.createdAt')}</dt>
              <dd className="mt-0.5 text-sm">{formatDateTime(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">{t('account.passwordStatus')}</dt>
              <dd className="mt-0.5">
                {user.mustChangePassword ? (
                  <Badge tone="warning">{t('account.initialPassword')}</Badge>
                ) : (
                  <Badge tone="success">{t('account.customPassword')}</Badge>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">{t('account.changePassword')}</h2>
          {user.mustChangePassword ? (
            <p className="mt-1 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              {t('account.mustChangeNotice')}
            </p>
          ) : (
            <p className="mt-1 text-sm text-fd-muted-foreground">
              {t('account.changeHint')}
            </p>
          )}

          <ActionForm action={changePassword} submitLabel={t('account.submit')} className="mt-4">
            <Field label={t('account.current')} required>
              <Input name="current" type="password" required autoComplete="current-password" />
            </Field>
            <Field
              label={t('account.next')}
              required
              hint={t('account.passwordHint', { min: PASSWORD_MIN_LENGTH })}
            >
              <Input
                                    name="next"
                  type="password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
                />
            </Field>
            <Field label={t('account.confirm')} required>
              <Input name="confirm" type="password" required autoComplete="new-password" />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
