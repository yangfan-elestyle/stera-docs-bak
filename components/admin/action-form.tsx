'use client';

import { CheckCircle2, CircleAlert } from 'lucide-react';
import { useActionState } from 'react';
import { cn } from '@/lib/admin/cn';
import type { FormState } from '@/lib/admin/actions/auth';
import { Button } from './ui/button';

export function ActionForm({
  action,
  submitLabel,
  children,
  className,
  submitFull,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
  submitFull?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={cn('space-y-4', className)}>
      {children}

      {state.error ? (
        <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="flex items-start gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {state.ok}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        loading={pending}
        className={submitFull ? 'w-full' : undefined}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
