import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { ActionForm } from '@/components/admin/action-form';
import { PageHeader } from '@/components/admin/page-header';
import { Field, Input } from '@/components/admin/ui/field';
import { Badge, Card } from '@/components/admin/ui/primitives';
import { changePassword } from '@/lib/admin/actions/auth';
import { currentUser } from '@/lib/auth/guard';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password';
import { formatDateTime } from '@/lib/admin/text';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: '我的账号' };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect('/admin/login');

  return (
    <>
      <PageHeader title="我的账号" />
      <div className="max-w-2xl space-y-5 px-4 py-5 md:px-6">
        <Card className="p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-fd-muted-foreground">邮箱</dt>
              <dd className="mt-0.5 text-sm">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">角色</dt>
              <dd className="mt-0.5 text-sm">
                {user.role === 'admin' ? '管理员 — 可管理账号' : '编辑者 — 可编辑内容'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">创建于</dt>
              <dd className="mt-0.5 text-sm">{formatDateTime(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">密码状态</dt>
              <dd className="mt-0.5">
                {user.mustChangePassword ? (
                  <Badge tone="warning">仍在用初始密码</Badge>
                ) : (
                  <Badge tone="success">已自行设置</Badge>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">修改密码</h2>
          {user.mustChangePassword ? (
            <p className="mt-1 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              当前用的是管理员设定的初始密码, 请先改掉。
            </p>
          ) : (
            <p className="mt-1 text-sm text-fd-muted-foreground">
              改密后其他设备上的登录状态会全部失效。
            </p>
          )}

          <ActionForm action={changePassword} submitLabel="保存新密码" className="mt-4">
            <Field label="当前密码" required>
              <Input name="current" type="password" required autoComplete="current-password" />
            </Field>
            <Field
              label="新密码"
              required
              hint={`至少 ${PASSWORD_MIN_LENGTH} 位, 需含大写字母、小写字母与数字`}
            >
              <Input
                                    name="next"
                  type="password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
                />
            </Field>
            <Field label="再输一次新密码" required>
              <Input name="confirm" type="password" required autoComplete="new-password" />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
