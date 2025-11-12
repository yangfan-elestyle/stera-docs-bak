import React from 'react';
import { headers } from 'next/headers';
import { detectTenantByHost } from '@/lib/tenant';

type Props = {
  /**
   * e.g. tenant="smcc,default"
   */
  tenant?: string | string[];
  children?: React.ReactNode;
};

/**
 * 根据 host 推断租户，决定是否渲染其子元素。
 *
 * 用法示例（仅在 smcc 租户可见）：
 * <EContainer tenant="smcc">
 *   <Card title="..." href="...">...</Card>
 * </EContainer>
 */
export default async function EContainer({ tenant, children }: Props) {
  const hdrs = await headers();
  const host = hdrs.get('host');
  const current = detectTenantByHost(host ?? undefined).toLowerCase();

  const list: string[] = Array.isArray(tenant)
    ? tenant
    : typeof tenant === 'string'
      ? tenant.split(',')
      : [];

  const allow =
    list.length === 0
      ? true
      : list.map((t) => String(t).trim().toLowerCase()).includes(current);

  if (!allow) return null;
  return <>{children}</>;
}
