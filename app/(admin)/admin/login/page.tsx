import type { Metadata } from 'next';
import { BookText, Info } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ActionForm } from '@/components/admin/action-form';
import { Field, Input } from '@/components/admin/ui/field';
import { login } from '@/lib/admin/actions/auth';
import { currentUser } from '@/lib/auth/guard';
import { countUsers } from '@/lib/auth/users';

export const metadata: Metadata = { title: '登录' };

export default async function LoginPage() {
  if (await currentUser()) redirect('/admin');
  const initialized = countUsers() > 0;

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid size-11 place-items-center rounded-xl bg-fd-primary text-fd-primary-foreground shadow-sm">
            <BookText className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">stera smart one 文档管理</h1>
            <p className="mt-0.5 text-sm text-fd-muted-foreground">
              {initialized ? '用分配给你的账号登录' : '系统尚未初始化'}
            </p>
          </div>
        </div>

        {initialized ? (
          <ActionForm action={login} submitLabel="登录" submitFull>
            <Field label="邮箱" required>
              <Input name="email" type="email" required autoComplete="username" placeholder="name@example.com" />
            </Field>
            <Field label="密码" required>
              <Input name="password" type="password" required autoComplete="current-password" />
            </Field>
          </ActionForm>
        ) : (
          // MUST NOT 在这里给「就地创建管理员」的入口: 能编辑内容等于能在服务端执行代码,
          // 那种页面就是留一个谁都能抢注的窗口。
          <div className="flex gap-3 rounded-xl border border-fd-border bg-fd-card p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground" />
            <p className="text-fd-muted-foreground">
              还没有任何账号。首个管理员由部署侧通过环境变量{' '}
              <code className="rounded bg-fd-muted px-1 font-mono text-xs">ADMIN_EMAIL</code> 与{' '}
              <code className="rounded bg-fd-muted px-1 font-mono text-xs">ADMIN_PASSWORD</code>{' '}
              注入, 仅在账号表为空时生效。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
