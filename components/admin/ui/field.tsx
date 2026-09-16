'use client';

import { createContext, forwardRef, useContext, useId } from 'react';
import { cn } from '@/lib/admin/cn';

export const inputClass =
  'flex h-9 w-full rounded-lg border border-fd-border bg-fd-card px-3 py-1 text-sm shadow-sm transition-[box-shadow,border-color] outline-none placeholder:text-fd-muted-foreground focus-visible:border-fd-primary focus-visible:ring-2 focus-visible:ring-fd-primary/20 disabled:cursor-not-allowed disabled:opacity-50';

// 用 context 而不是 render-prop 传 id: render-prop 是函数, 从 Server Component
// 传进 Client Component 会被 RSC 序列化拒绝 ("Functions cannot be passed directly")。
const FieldContext = createContext<{ id?: string; describedBy?: string }>({});

export const Input = forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, id, ...props }, ref) => {
  const field = useContext(FieldContext);
  return (
    <input
      ref={ref}
      id={id ?? field.id}
      aria-describedby={props['aria-describedby'] ?? field.describedBy}
      className={cn(inputClass, className)}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, id, ...props }, ref) => {
  const field = useContext(FieldContext);
  return (
    <textarea
      ref={ref}
      id={id ?? field.id}
      aria-describedby={props['aria-describedby'] ?? field.describedBy}
      className={cn(
        inputClass,
        'h-auto min-h-20 py-2 leading-relaxed',
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const describedBy = error || hint ? `${id}-desc` : undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy }}>
      <div className={cn('space-y-1.5', className)}>
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-sm font-medium"
        >
          {label}
          {required ? <span className="text-red-500">*</span> : null}
        </label>
        {children}
        {error ? (
          <p
            id={describedBy}
            className="text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={describedBy} className="text-xs text-fd-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

/** Select 这类自带 trigger 的控件用它取 Field 的 id */
export function useFieldId(): string | undefined {
  return useContext(FieldContext).id;
}
