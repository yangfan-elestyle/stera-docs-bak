'use client';

import { createContext, useContext, useMemo } from 'react';
import type { AdminDict, AdminDictKey, AdminLocale, T, Vars } from '@/lib/admin/i18n';
import { translate } from '@/lib/admin/i18n/translate';

interface Value {
  locale: AdminLocale;
  dict: AdminDict;
  t: T;
}

const Ctx = createContext<Value | undefined>(undefined);

/**
 * 字典以纯对象跨 RSC 边界进来, `t()` 在客户端这侧构造 —— 函数传不过 Server -> Client。
 * 客户端组件 MUST 只 `import type` 字典类型; 值导入会把三份字典全打进 bundle。
 */
export function AdminI18nProvider({
  locale,
  dict,
  children,
}: {
  locale: AdminLocale;
  dict: AdminDict;
  children: React.ReactNode;
}) {
  const value = useMemo<Value>(
    () => ({ locale, dict, t: (key, vars) => translate(dict, key, vars) }),
    [locale, dict],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminI18n(): Value {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminI18n 必须在 AdminI18nProvider 内部调用');
  return ctx;
}

export function useT(): T {
  return useAdminI18n().t;
}

export type { AdminDictKey, Vars };
