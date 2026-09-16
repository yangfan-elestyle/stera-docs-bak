'use client';

import { useActionState } from 'react';
import type { FormState } from './actions';

// 布局刻意做到最简: SMCC 侧 UI 排版未回复前 MUST NOT 定稿, 现在只保证功能完整可验收。
export const input =
  'w-full rounded border border-fd-border bg-fd-card px-3 py-2 text-sm';
export const button =
  'rounded bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-50';

export function ActionForm({
  action,
  children,
  className,
  submitLabel,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={className ?? 'space-y-3'}>
      {children}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={button}>
          {pending ? '处理中…' : submitLabel}
        </button>
        {state.error ? (
          <span className="text-sm text-red-600">{state.error}</span>
        ) : null}
        {state.ok ? (
          <span className="text-sm text-emerald-600">{state.ok}</span>
        ) : null}
      </div>
    </form>
  );
}
