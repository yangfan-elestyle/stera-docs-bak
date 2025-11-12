export type Tenant = 'smcc' | 'default';

// Detect tenant from host. Current rule: host containing "smcc" -> smcc
export function detectTenantByHost(host?: string | null): Tenant {
  if (!host) return 'default';
  const h = String(host).toLowerCase();
  return h.includes('smcc') ? 'smcc' : 'default';
}
