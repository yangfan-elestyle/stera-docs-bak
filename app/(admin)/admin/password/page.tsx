import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth/guard';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password';
import { changePassword } from '../actions';
import { ActionForm, input } from '../ui';

export default async function PasswordPage() {
  const user = await currentUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-lg font-semibold">修改密码</h1>
      {user.mustChangePassword ? (
        <p className="text-sm text-fd-muted-foreground">
          当前用的是管理员设定的初始密码, 改掉后才能继续。
        </p>
      ) : null}
      <ActionForm action={changePassword} submitLabel="保存">
        <input name="current" type="password" required placeholder="当前密码" className={input} autoComplete="current-password" />
        <input
          name="next"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          placeholder={`新密码 (至少 ${PASSWORD_MIN_LENGTH} 位, 含大小写与数字)`}
          className={input}
          autoComplete="new-password"
        />
        <input name="confirm" type="password" required placeholder="再输一次新密码" className={input} autoComplete="new-password" />
      </ActionForm>
    </div>
  );
}
