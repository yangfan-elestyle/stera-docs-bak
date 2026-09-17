'use client';

import {
  KeyRound,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatRelative } from '@/lib/admin/text';
import { useAdminI18n, useT } from './i18n';
import {
  createAccountAction,
  deleteAccountAction,
  resetPasswordAction,
  updateRoleAction,
  type UserResult,
} from '@/lib/admin/actions/users';
import { Button } from './ui/button';
import { Field, Input, useFieldId } from './ui/field';
import {
  Badge,
  Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/primitives';

export interface UserRow {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  mustChangePassword: boolean;
  createdAt: number;
}

function randomPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  const rest = Array.from({ length: 13 }, () => pick(all));
  return [pick(upper), pick(lower), pick(digits), ...rest]
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function UsersPanel({ rows, meId }: { rows: UserRow[]; meId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { locale, t } = useAdminI18n();

  const run = (action: () => Promise<UserResult>) => {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <p className="text-sm text-fd-muted-foreground">{t('users.warning')}</p>
        <CreateDialog onDone={run} />
      </div>

      <div className="overflow-hidden rounded-xl border border-fd-border">
        <table className="w-full text-sm">
          <thead className="bg-fd-card/60 text-left text-xs text-fd-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">{t('users.colAccount')}</th>
              <th className="px-4 py-2.5 font-medium">{t('common.role')}</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                {t('users.colStatus')}
              </th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                {t('common.createdAt')}
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-fd-primary/12 text-[10px] font-semibold text-fd-primary">
                      {row.email.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{row.email}</span>
                    {row.id === meId ? <Badge>{t('users.you')}</Badge> : null}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <Select
                    value={row.role}
                    disabled={pending}
                    onValueChange={(role) =>
                      run(() =>
                        updateRoleAction({
                          id: row.id,
                          role: role as 'admin' | 'editor',
                        }),
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">editor</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="hidden px-4 py-2.5 sm:table-cell">
                  {row.mustChangePassword ? (
                    <Badge tone="warning">{t('users.pendingChange')}</Badge>
                  ) : (
                    <Badge tone="success">{t('users.normal')}</Badge>
                  )}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-2.5 text-xs text-fd-muted-foreground md:table-cell">
                  {formatRelative(row.createdAt, locale)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <RowMenu row={row} meId={meId} onDone={run} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowMenu({
  row,
  meId,
  onDone,
}: {
  row: UserRow;
  meId: string;
  onDone: (action: () => Promise<UserResult>) => void;
}) {
  const t = useT();
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t('common.more')}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setPassword(randomPassword());
              setResetOpen(true);
            }}
          >
            <KeyRound />
            {t('users.resetPassword')}
          </DropdownMenuItem>
          {row.id !== meId ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 />
                {t('users.deleteUser')}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent
          title={t('users.resetPassword')}
          description={t('users.resetDesc', { email: row.email })}
        >
          <div className="space-y-3">
            <Field
              label={t('users.newInitialPassword')}
              hint={t('users.generatedHint')}
            >
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="font-mono"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setResetOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setResetOpen(false);
                  onDone(() => resetPasswordAction({ id: row.id, password }));
                }}
              >
                {t('users.reset')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          title={t('users.deleteUser')}
          description={t('users.deleteDesc', { email: row.email })}
        >
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeleteOpen(false);
                onDone(() => deleteAccountAction({ id: row.id }));
              }}
            >
              {t('common.confirmDelete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateDialog({
  onDone,
}: {
  onDone: (action: () => Promise<UserResult>) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(randomPassword());
  const [role, setRole] = useState<'admin' | 'editor'>('editor');

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setEmail('');
          setPassword(randomPassword());
          setRole('editor');
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" className="ml-auto">
          <UserPlus />
          {t('users.create')}
        </Button>
      </DialogTrigger>
      <DialogContent
        title={t('users.create')}
        description={t('users.createDesc')}
      >
        <div className="space-y-3">
          <Field label={t('common.email')} required>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </Field>
          <Field label={t('users.initialPassword')} required hint={t('users.generatedHintShort')}>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label={t('common.role')}>
            <RoleSelect value={role} onChange={setRole} />
          </Field>
          <div className="flex items-center gap-2 rounded-lg bg-fd-muted/60 px-3 py-2 text-xs text-fd-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            {t('users.createNotice')}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setOpen(false);
                onDone(() => createAccountAction({ email, password, role }));
              }}
            >
              {t('users.submitCreate')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RoleSelect({
  value,
  onChange,
}: {
  value: 'admin' | 'editor';
  onChange: (role: 'admin' | 'editor') => void;
}) {
  const t = useT();
  const id = useFieldId();
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as 'admin' | 'editor')}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="editor">{t('users.roleEditorOption')}</SelectItem>
        <SelectItem value="admin">{t('users.roleAdminOption')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
