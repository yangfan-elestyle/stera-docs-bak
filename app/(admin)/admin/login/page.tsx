import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth/guard';
import { countUsers } from '@/lib/auth/users';
import { login } from '../actions';
import { ActionForm, input } from '../ui';

export default async function LoginPage() {
  if (await currentUser()) redirect('/admin/content');

  // 账号表为空 = 部署侧还没注入首个管理员。这里 MUST NOT 提供「就地创建管理员」的入口:
  // 能编辑内容等于能在服务端执行代码, 留这个口子就是留一个任何人都能抢注的窗口。
  if (countUsers() === 0) {
    return (
      <div className="max-w-md space-y-3">
        <h1 className="text-lg font-semibold">尚未初始化</h1>
        <p className="text-sm text-fd-muted-foreground">
          还没有任何账号。首个管理员由部署侧通过环境变量 <code>ADMIN_EMAIL</code> 与{' '}
          <code>ADMIN_PASSWORD</code> 注入, 仅在账号表为空时生效。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-lg font-semibold">登录</h1>
      <ActionForm action={login} submitLabel="登录">
        <input name="email" type="email" required placeholder="邮箱" className={input} autoComplete="username" />
        <input name="password" type="password" required placeholder="密码" className={input} autoComplete="current-password" />
      </ActionForm>
    </div>
  );
}
