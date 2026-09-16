import { requireAdmin } from '@/lib/auth/guard';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password';
import { listUsers } from '@/lib/auth/users';
import { createAccount, removeAccount, updateRole } from '../actions';
import { ActionForm, input } from '../ui';

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = listUsers();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-lg font-semibold">账号</h1>
        <table className="w-full text-sm">
          <thead className="text-left text-fd-muted-foreground">
            <tr>
              <th className="py-2">邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-fd-border">
                <td className="py-2">{user.email}</td>
                <td>
                  <ActionForm
                    action={updateRole}
                    submitLabel="更新"
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={user.id} />
                    <select name="role" defaultValue={user.role} className={input}>
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                  </ActionForm>
                </td>
                <td className="text-fd-muted-foreground">
                  {user.mustChangePassword ? '待首次改密' : '正常'}
                </td>
                <td>
                  {user.id === me.id ? null : (
                    <ActionForm action={removeAccount} submitLabel="删除" className="">
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="role" value={user.role} />
                    </ActionForm>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="max-w-sm space-y-3">
        <h2 className="font-semibold">新建账号</h2>
        <p className="text-sm text-fd-muted-foreground">
          不发邀请信也不做邮箱验证: 在这里设好初始密码, 线下交给本人, 对方首次登录会被强制改密。
        </p>
        <ActionForm action={createAccount} submitLabel="创建">
          <input name="email" type="email" required placeholder="邮箱" className={input} />
          <input
            name="password"
            type="text"
            required
            minLength={PASSWORD_MIN_LENGTH}
            placeholder={`初始密码 (至少 ${PASSWORD_MIN_LENGTH} 位, 含大小写与数字)`}
            className={input}
          />
          <select name="role" defaultValue="editor" className={input}>
            <option value="editor">editor — 只能改内容</option>
            <option value="admin">admin — 额外可管账号</option>
          </select>
        </ActionForm>
      </section>
    </div>
  );
}
